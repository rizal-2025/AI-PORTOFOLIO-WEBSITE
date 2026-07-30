import type { AuraDemoConfig } from "@/lib/aura-demo/config.server";
import {
  hasExactKeys,
  parseRateLimitInteger,
  type PublicCurrentSessionResponse,
  type SafeRateLimitHeaders,
} from "@/lib/aura-demo/contracts";
import {
  parseAuraCreateSession,
  parseAuraCurrentSession,
  type ParsedAuraCreateSession,
} from "@/lib/aura-demo/upstream.server";

type AuraDemoClientErrorKind =
  | "invalid-response"
  | "rate-limited"
  | "session-required"
  | "timeout"
  | "unavailable";

type AuraRequestContext = {
  raceWithDeadline: <T>(operation: Promise<T>) => Promise<T>;
  setActiveReader: (
    reader: ReadableStreamDefaultReader<Uint8Array> | null,
    cancel: (() => Promise<void>) | null,
  ) => void;
  throwIfExpired: () => void;
};

type ParsedJsonDocument = Readonly<{
  text: string;
  value: unknown;
}>;

export class AuraDemoClientError extends Error {
  constructor(
    readonly kind: AuraDemoClientErrorKind,
    readonly rateLimitHeaders: SafeRateLimitHeaders = {},
  ) {
    super("AURA demo request failed.");
    this.name = "AuraDemoClientError";
  }
}

const CREATE_SESSION_PATH = "/internal/demo/sessions";
const CURRENT_SESSION_PATH = "/internal/demo/sessions/current";
const MAX_AURA_RESPONSE_BYTES = 262_144;
const MAX_AURA_RESPONSE_BYTES_TEXT = String(MAX_AURA_RESPONSE_BYTES);
const STREAM_CANCEL_GRACE_MS = 50;
const SESSION_REQUIRED_CODE = "DEMO_SESSION_REQUIRED";
const SESSION_REQUIRED_DETAIL =
  "Sesi demo tidak valid atau telah kedaluwarsa.";
const ERROR_ENVELOPE_KEYS = ["code", "detail"] as const;
const JSON_PROPERTY_PATTERN = /"((?:\\.|[^"\\])*)"\s*:/g;

function rateLimitHeaders(headers: Headers): SafeRateLimitHeaders {
  const safeHeaders: SafeRateLimitHeaders = {};
  const retryAfter = parseRateLimitInteger(
    headers.get("Retry-After"),
    true,
  );
  const limit = parseRateLimitInteger(
    headers.get("X-RateLimit-Limit"),
    false,
  );
  const remaining = parseRateLimitInteger(
    headers.get("X-RateLimit-Remaining"),
    false,
  );
  const reset = parseRateLimitInteger(
    headers.get("X-RateLimit-Reset"),
    false,
  );

  if (retryAfter !== undefined) {
    safeHeaders["Retry-After"] = retryAfter;
  }
  if (limit !== undefined) {
    safeHeaders["X-RateLimit-Limit"] = limit;
  }
  if (remaining !== undefined) {
    safeHeaders["X-RateLimit-Remaining"] = remaining;
  }
  if (reset !== undefined) {
    safeHeaders["X-RateLimit-Reset"] = reset;
  }

  return safeHeaders;
}

function observeCancellation(
  cancel: () => Promise<unknown>,
): Promise<void> {
  try {
    return Promise.resolve(cancel()).then(
      () => undefined,
      () => undefined,
    );
  } catch {
    return Promise.resolve();
  }
}

async function waitForCancellation(
  cancellation: Promise<void>,
): Promise<void> {
  let graceTimer: ReturnType<typeof setTimeout> | undefined;
  const grace = new Promise<void>((resolve) => {
    graceTimer = setTimeout(resolve, STREAM_CANCEL_GRACE_MS);
  });

  try {
    await Promise.race([cancellation, grace]);
  } finally {
    if (graceTimer !== undefined) {
      clearTimeout(graceTimer);
    }
  }
}

function cancelReaderSafely(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<void> {
  return observeCancellation(() => reader.cancel());
}

function hasExactRawErrorKeys(text: string): boolean {
  const keys: string[] = [];
  JSON_PROPERTY_PATTERN.lastIndex = 0;

  for (const match of text.matchAll(JSON_PROPERTY_PATTERN)) {
    keys.push(match[1]);
  }

  return (
    keys.length === ERROR_ENVELOPE_KEYS.length &&
    ERROR_ENVELOPE_KEYS.every((key) => keys.includes(key))
  );
}

function isExactSessionRequiredError(
  document: ParsedJsonDocument,
): boolean {
  if (
    !hasExactKeys(document.value, ERROR_ENVELOPE_KEYS) ||
    Object.getPrototypeOf(document.value) !== Object.prototype ||
    !hasExactRawErrorKeys(document.text)
  ) {
    return false;
  }

  return (
    typeof document.value.code === "string" &&
    document.value.code === SESSION_REQUIRED_CODE &&
    typeof document.value.detail === "string" &&
    document.value.detail === SESSION_REQUIRED_DETAIL
  );
}

function contentLengthExceedsLimit(value: string | null): boolean {
  if (value === null || !/^(?:0|[1-9]\d*)$/.test(value)) {
    return false;
  }
  return (
    value.length > MAX_AURA_RESPONSE_BYTES_TEXT.length ||
    (value.length === MAX_AURA_RESPONSE_BYTES_TEXT.length &&
      value > MAX_AURA_RESPONSE_BYTES_TEXT)
  );
}

async function readBoundedJson(
  response: Response,
  context: AuraRequestContext,
): Promise<ParsedJsonDocument> {
  const responseBody = response.body;
  if (responseBody === null) {
    throw new AuraDemoClientError("invalid-response");
  }
  if (contentLengthExceedsLimit(response.headers.get("content-length"))) {
    await waitForCancellation(
      observeCancellation(() => responseBody.cancel()),
    );
    context.throwIfExpired();
    throw new AuraDemoClientError("invalid-response");
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = responseBody.getReader();
  } catch {
    throw new AuraDemoClientError("invalid-response");
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let completed = false;
  let cancellation: Promise<void> | null = null;
  const cancelReader = () => {
    if (cancellation === null) {
      cancellation = cancelReaderSafely(reader);
    }
    return cancellation;
  };
  context.setActiveReader(reader, cancelReader);

  try {
    while (true) {
      context.throwIfExpired();
      const chunk = await context.raceWithDeadline(reader.read());
      context.throwIfExpired();
      if (chunk.done) {
        completed = true;
        break;
      }
      if (chunk.value.byteLength === 0) {
        continue;
      }
      if (chunk.value.byteLength > MAX_AURA_RESPONSE_BYTES - totalBytes) {
        throw new AuraDemoClientError("invalid-response");
      }
      totalBytes += chunk.value.byteLength;
      chunks.push(chunk.value);
    }
  } catch (error) {
    cancelReader();
    context.throwIfExpired();
    if (error instanceof AuraDemoClientError) {
      throw error;
    }
    throw new AuraDemoClientError("unavailable");
  } finally {
    if (!completed) {
      await waitForCancellation(cancelReader());
    }
    context.setActiveReader(null, null);
    try {
      reader.releaseLock();
    } catch {
      // Cleanup failures never replace the primary classification.
    }
  }

  if (totalBytes === 0) {
    throw new AuraDemoClientError("invalid-response");
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  context.throwIfExpired();
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    throw new AuraDemoClientError("invalid-response");
  }

  context.throwIfExpired();
  try {
    const parsed: unknown = JSON.parse(text);
    context.throwIfExpired();
    return {
      text,
      value: parsed,
    };
  } catch (error) {
    context.throwIfExpired();
    if (error instanceof AuraDemoClientError) {
      throw error;
    }
    throw new AuraDemoClientError("invalid-response");
  }
}

async function runAuraRequest<T>(
  config: AuraDemoConfig,
  path: string,
  headers: HeadersInit,
  method: "GET" | "POST",
  handleResponse: (
    response: Response,
    context: AuraRequestContext,
  ) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const deadlineAt = Date.now() + config.timeoutMs;
  let timedOut = false;
  let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let cancelActiveReader: (() => Promise<void>) | null = null;
  let rejectDeadline: ((error: AuraDemoClientError) => void) | null = null;

  const markTimedOut = () => {
    if (timedOut) {
      return;
    }
    timedOut = true;
    controller.abort();
    if (cancelActiveReader !== null) {
      void cancelActiveReader();
    } else if (activeReader !== null) {
      void cancelReaderSafely(activeReader);
    }
    rejectDeadline?.(new AuraDemoClientError("timeout"));
  };
  const timeout = setTimeout(() => {
    markTimedOut();
  }, config.timeoutMs);
  const deadline = new Promise<never>((_resolve, reject) => {
    rejectDeadline = reject;
  });
  const context: AuraRequestContext = {
    raceWithDeadline: (operation) =>
      Promise.race([operation, deadline]),
    setActiveReader: (reader, cancel) => {
      activeReader = reader;
      cancelActiveReader = cancel;
      if (timedOut && reader !== null) {
        if (cancel !== null) {
          void cancel();
        } else {
          void cancelReaderSafely(reader);
        }
      }
    },
    throwIfExpired: () => {
      if (timedOut || Date.now() >= deadlineAt) {
        markTimedOut();
        throw new AuraDemoClientError("timeout");
      }
    },
  };

  const operation = (async () => {
    const response = await fetch(new URL(path, config.baseUrl), {
      method,
      headers,
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
    context.throwIfExpired();
    const result = await handleResponse(response, context);
    context.throwIfExpired();
    return result;
  })();

  try {
    return await Promise.race([operation, deadline]);
  } catch (error) {
    if (timedOut || Date.now() >= deadlineAt) {
      markTimedOut();
      throw new AuraDemoClientError("timeout");
    }
    if (error instanceof AuraDemoClientError) {
      throw error;
    }
    throw new AuraDemoClientError("unavailable");
  } finally {
    clearTimeout(timeout);
    rejectDeadline = null;
  }
}

async function throwForCommonFailure(
  response: Response,
  context: AuraRequestContext,
): Promise<never> {
  const responseBody = response.body;
  if (responseBody !== null) {
    await waitForCancellation(
      observeCancellation(() => responseBody.cancel()),
    );
  }
  context.throwIfExpired();
  if (response.status === 429) {
    throw new AuraDemoClientError(
      "rate-limited",
      rateLimitHeaders(response.headers),
    );
  }
  throw new AuraDemoClientError("unavailable");
}

export async function createAuraDemoSession(
  config: AuraDemoConfig,
): Promise<ParsedAuraCreateSession> {
  return runAuraRequest(
    config,
    CREATE_SESSION_PATH,
    {
      "X-BFF-Service-Token": config.serviceToken,
    },
    "POST",
    async (response, context) => {
      if (response.status !== 201) {
        await throwForCommonFailure(response, context);
      }

      const document = await readBoundedJson(response, context);
      const parsed = parseAuraCreateSession(document.value, Date.now());
      if (parsed === null) {
        throw new AuraDemoClientError("invalid-response");
      }
      return parsed;
    },
  );
}

export async function getCurrentAuraDemoSession(
  config: AuraDemoConfig,
  sessionToken: string,
): Promise<PublicCurrentSessionResponse> {
  return runAuraRequest(
    config,
    CURRENT_SESSION_PATH,
    {
      "X-BFF-Service-Token": config.serviceToken,
      "X-Demo-Session-Token": sessionToken,
    },
    "GET",
    async (response, context) => {
      if (response.status === 401) {
        let document: ParsedJsonDocument;
        try {
          document = await readBoundedJson(response, context);
        } catch (error) {
          if (
            error instanceof AuraDemoClientError &&
            error.kind === "timeout"
          ) {
            throw error;
          }
          throw new AuraDemoClientError("unavailable");
        }
        // Only an exact AURA session-required envelope permits replacement.
        if (isExactSessionRequiredError(document)) {
          throw new AuraDemoClientError("session-required");
        }
        throw new AuraDemoClientError("unavailable");
      }

      if (response.status !== 200) {
        await throwForCommonFailure(response, context);
      }

      const document = await readBoundedJson(response, context);
      const parsed = parseAuraCurrentSession(document.value);
      if (parsed === null) {
        throw new AuraDemoClientError("invalid-response");
      }
      return parsed;
    },
  );
}
