import type { AuraDemoConfig } from "@/lib/aura-demo/config.server";
import {
  hasExactKeys,
  parseRateLimitInteger,
  type PublicCurrentSessionResponse,
  type PublicDemoChatResponse,
  type PublicDemoReservationListResponse,
  type PublicDemoResetResponse,
  type SafeRateLimitHeaders,
} from "@/lib/aura-demo/contracts";
import type { PublicDemoChatRequest } from "@/lib/aura-demo/request";
import {
  parseAuraChatResponse,
  parseAuraCreateSession,
  parseAuraCurrentSession,
  parseAuraReservationList,
  parseAuraResetResponse,
  type ParsedAuraCreateSession,
} from "@/lib/aura-demo/upstream.server";

type AuraDemoClientErrorKind =
  | "invalid-response"
  | "rate-limited"
  | "request-conflict"
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
  readonly kind: AuraDemoClientErrorKind;
  readonly rateLimitHeaders: SafeRateLimitHeaders;

  constructor(
    kind: AuraDemoClientErrorKind,
    rateLimitHeaders: SafeRateLimitHeaders = {},
  ) {
    super("AURA demo request failed.");
    this.name = "AuraDemoClientError";
    this.kind = kind;
    this.rateLimitHeaders = rateLimitHeaders;
  }
}

const CREATE_SESSION_PATH = "/internal/demo/sessions";
const CURRENT_SESSION_PATH = "/internal/demo/sessions/current";
const CHAT_PATH = "/internal/demo/chat";
const RESERVATIONS_PATH = "/internal/demo/reservations";
const RESET_PATH = "/internal/demo/reset";
const MAX_AURA_RESPONSE_BYTES = 262_144;
const MAX_AURA_RESPONSE_BYTES_TEXT = String(MAX_AURA_RESPONSE_BYTES);
const STREAM_CANCEL_GRACE_MS = 50;
const SESSION_REQUIRED_CODE = "DEMO_SESSION_REQUIRED";
const SESSION_REQUIRED_DETAIL =
  "Sesi demo tidak valid atau telah kedaluwarsa.";
const RATE_LIMIT_CODE = "RATE_LIMIT_EXCEEDED";
const RATE_LIMIT_DETAIL = "Batas permintaan demo telah tercapai.";
const PROVIDER_TIMEOUT_CODE = "PROVIDER_TIMEOUT";
const PROVIDER_TIMEOUT_DETAIL = "Layanan AI demo melewati batas waktu.";
const REQUEST_CONFLICT_DETAILS = new Map([
  ["REQUEST_CONFLICT", "Permintaan demo sedang diproses atau belum selesai."],
  [
    "DEMO_HISTORY_RESET_REQUIRED",
    "Riwayat demo lama harus direset sebelum sesi dapat dilanjutkan.",
  ],
]);
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

function isExactError(
  document: ParsedJsonDocument,
  code: string,
  detail: string,
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
    document.value.code === code &&
    typeof document.value.detail === "string" &&
    document.value.detail === detail
  );
}

function isExactSessionRequiredError(
  document: ParsedJsonDocument,
): boolean {
  return isExactError(
    document,
    SESSION_REQUIRED_CODE,
    SESSION_REQUIRED_DETAIL,
  );
}

function isExactRequestConflict(document: ParsedJsonDocument): boolean {
  for (const [code, detail] of REQUEST_CONFLICT_DETAILS) {
    if (isExactError(document, code, detail)) {
      return true;
    }
  }
  return false;
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
  body: string | undefined,
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
      body,
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

async function discardResponseBody(
  response: Response,
  context: AuraRequestContext,
): Promise<void> {
  const responseBody = response.body;
  if (responseBody !== null) {
    await waitForCancellation(
      observeCancellation(() => responseBody.cancel()),
    );
  }
  context.throwIfExpired();
}

async function readFailureDocument(
  response: Response,
  context: AuraRequestContext,
  malformedKind: "invalid-response" | "unavailable",
): Promise<ParsedJsonDocument> {
  try {
    return await readBoundedJson(response, context);
  } catch (error) {
    if (
      error instanceof AuraDemoClientError &&
      error.kind === "timeout"
    ) {
      throw error;
    }
    throw new AuraDemoClientError(malformedKind);
  }
}

async function throwForFailure(
  response: Response,
  context: AuraRequestContext,
  options: Readonly<{
    sessionScoped?: boolean;
    requestConflict?: boolean;
    providerTimeout?: boolean;
  }> = {},
): Promise<never> {
  if (response.status === 429) {
    const document = await readFailureDocument(
      response,
      context,
      "invalid-response",
    );
    if (!isExactError(document, RATE_LIMIT_CODE, RATE_LIMIT_DETAIL)) {
      throw new AuraDemoClientError("invalid-response");
    }
    throw new AuraDemoClientError(
      "rate-limited",
      rateLimitHeaders(response.headers),
    );
  }

  if (response.status === 401 && options.sessionScoped) {
    const document = await readFailureDocument(
      response,
      context,
      "unavailable",
    );
    if (isExactSessionRequiredError(document)) {
      throw new AuraDemoClientError("session-required");
    }
    throw new AuraDemoClientError("unavailable");
  }

  if (response.status === 409 && options.requestConflict) {
    const document = await readFailureDocument(
      response,
      context,
      "invalid-response",
    );
    if (isExactRequestConflict(document)) {
      throw new AuraDemoClientError("request-conflict");
    }
    throw new AuraDemoClientError("invalid-response");
  }

  if (response.status === 504 && options.providerTimeout) {
    const document = await readFailureDocument(
      response,
      context,
      "unavailable",
    );
    if (
      isExactError(
        document,
        PROVIDER_TIMEOUT_CODE,
        PROVIDER_TIMEOUT_DETAIL,
      )
    ) {
      throw new AuraDemoClientError("timeout");
    }
    throw new AuraDemoClientError("unavailable");
  }

  await discardResponseBody(response, context);
  if (response.status >= 500 || response.status === 401) {
    throw new AuraDemoClientError("unavailable");
  }
  throw new AuraDemoClientError("invalid-response");
}

export async function createAuraDemoSession(
  config: AuraDemoConfig,
  clientSubject: string,
): Promise<ParsedAuraCreateSession> {
  return runAuraRequest(
    config,
    CREATE_SESSION_PATH,
    {
      "X-BFF-Service-Token": config.serviceToken,
      "X-Demo-Client-Subject": clientSubject,
    },
    "POST",
    undefined,
    async (response, context) => {
      if (response.status !== 201) {
        await throwForFailure(response, context);
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
  clientSubject: string,
): Promise<PublicCurrentSessionResponse> {
  return runAuraRequest(
    config,
    CURRENT_SESSION_PATH,
    {
      "X-BFF-Service-Token": config.serviceToken,
      "X-Demo-Client-Subject": clientSubject,
      "X-Demo-Session-Token": sessionToken,
    },
    "GET",
    undefined,
    async (response, context) => {
      if (response.status !== 200) {
        await throwForFailure(response, context, { sessionScoped: true });
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

export async function postAuraDemoChat(
  config: AuraDemoConfig,
  sessionToken: string,
  clientSubject: string,
  request: PublicDemoChatRequest,
): Promise<PublicDemoChatResponse> {
  return runAuraRequest(
    config,
    CHAT_PATH,
    {
      "Content-Type": "application/json",
      "X-BFF-Service-Token": config.serviceToken,
      "X-Demo-Client-Subject": clientSubject,
      "X-Demo-Session-Token": sessionToken,
    },
    "POST",
    JSON.stringify({
      message: request.message,
      requestId: request.requestId,
    }),
    async (response, context) => {
      if (response.status !== 200) {
        await throwForFailure(response, context, {
          sessionScoped: true,
          requestConflict: true,
          providerTimeout: true,
        });
      }
      const document = await readBoundedJson(response, context);
      const parsed = parseAuraChatResponse(document.value);
      if (parsed === null) {
        throw new AuraDemoClientError("invalid-response");
      }
      return parsed;
    },
  );
}

export async function getAuraDemoReservations(
  config: AuraDemoConfig,
  sessionToken: string,
  clientSubject: string,
): Promise<PublicDemoReservationListResponse> {
  return runAuraRequest(
    config,
    RESERVATIONS_PATH,
    {
      "X-BFF-Service-Token": config.serviceToken,
      "X-Demo-Client-Subject": clientSubject,
      "X-Demo-Session-Token": sessionToken,
    },
    "GET",
    undefined,
    async (response, context) => {
      if (response.status !== 200) {
        await throwForFailure(response, context, { sessionScoped: true });
      }
      const document = await readBoundedJson(response, context);
      const parsed = parseAuraReservationList(document.value);
      if (parsed === null) {
        throw new AuraDemoClientError("invalid-response");
      }
      return parsed;
    },
  );
}

export async function resetAuraDemo(
  config: AuraDemoConfig,
  sessionToken: string,
  clientSubject: string,
): Promise<PublicDemoResetResponse> {
  return runAuraRequest(
    config,
    RESET_PATH,
    {
      "X-BFF-Service-Token": config.serviceToken,
      "X-Demo-Client-Subject": clientSubject,
      "X-Demo-Session-Token": sessionToken,
    },
    "POST",
    undefined,
    async (response, context) => {
      if (response.status !== 200) {
        await throwForFailure(response, context, {
          sessionScoped: true,
          requestConflict: true,
        });
      }
      const document = await readBoundedJson(response, context);
      const parsed = parseAuraResetResponse(document.value);
      if (parsed === null) {
        throw new AuraDemoClientError("invalid-response");
      }
      return parsed;
    },
  );
}
