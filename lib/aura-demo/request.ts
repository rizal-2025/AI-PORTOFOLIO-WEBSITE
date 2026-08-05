export type SessionRequestError = "FORBIDDEN" | "INVALID_REQUEST";

export type PublicDemoChatRequest = Readonly<{
  message: string;
  requestId: string;
}>;

export type ChatRequestValidationResult =
  | { ok: true; value: PublicDemoChatRequest }
  | { ok: false; error: SessionRequestError };

const MAX_EMPTY_STREAM_CHUNKS = 8;
const POST_BODY_PROBE_TIMEOUT_MS = 1_000;
const CONTENT_LENGTH_PATTERN = /^(?:0|[1-9]\d*)$/;
const JSON_CONTENT_TYPE_PATTERN =
  /^application\/json(?:\s*;\s*charset=utf-8)?$/i;
const CANONICAL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UNSAFE_UNICODE_OTHER_PATTERN = /\p{C}/u;
const MAX_CHAT_BODY_BYTES = 8_192;
const MAX_CHAT_MESSAGE_CODEPOINTS = 1_000;
const MAX_CHAT_STREAM_CHUNKS = 64;
const ALLOWED_SEC_FETCH_SITES = new Set([
  "same-origin",
  "same-site",
  "none",
]);

type BodyProbeOutcome =
  | {
      kind: "read";
      result: ReadableStreamReadResult<Uint8Array>;
    }
  | { kind: "read-error" }
  | { kind: "stopped" };

function contentLengthIsValidAndEmpty(request: Request): boolean {
  const contentLength = request.headers.get("content-length");
  if (contentLength === null) {
    return true;
  }
  if (!CONTENT_LENGTH_PATTERN.test(contentLength)) {
    return false;
  }

  const parsed = Number(contentLength);
  return Number.isSafeInteger(parsed) && parsed === 0;
}

function hasQuery(request: Request): boolean {
  try {
    return new URL(request.url).search !== "";
  } catch {
    return true;
  }
}

function hasBrowserInternalTokenHeader(request: Request): boolean {
  return (
    request.headers.has("x-demo-session-token") ||
    request.headers.has("x-bff-service-token")
  );
}

async function postBodyIsEmpty(request: Request): Promise<boolean> {
  if (
    !contentLengthIsValidAndEmpty(request) ||
    request.headers.has("transfer-encoding") ||
    request.signal.aborted
  ) {
    return false;
  }
  if (request.body === null) {
    return true;
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = request.body.getReader();
  } catch {
    return false;
  }

  let accepted = false;
  let activeRead: Promise<BodyProbeOutcome> | null = null;
  let cancellation: Promise<void> | null = null;
  let stopProbe: (() => void) | null = null;

  const cancelReader = () => {
    if (cancellation === null) {
      cancellation = reader.cancel().catch(() => undefined);
    }
  };
  const stopped = new Promise<BodyProbeOutcome>((resolve) => {
    stopProbe = () => {
      cancelReader();
      resolve({ kind: "stopped" });
    };
  });
  const deadlineAt = Date.now() + POST_BODY_PROBE_TIMEOUT_MS;
  const timeout = setTimeout(() => {
    stopProbe?.();
  }, POST_BODY_PROBE_TIMEOUT_MS);
  const abortHandler = () => {
    stopProbe?.();
  };

  if (request.signal.aborted) {
    abortHandler();
  } else {
    request.signal.addEventListener("abort", abortHandler, { once: true });
  }

  try {
    for (let count = 0; count < MAX_EMPTY_STREAM_CHUNKS; count += 1) {
      const read = reader.read().then<BodyProbeOutcome, BodyProbeOutcome>(
        (result) => ({ kind: "read", result }),
        () => ({ kind: "read-error" }),
      );
      activeRead = read;
      const outcome = await Promise.race([read, stopped]);

      if (outcome.kind !== "read") {
        return false;
      }
      activeRead = null;
      if (request.signal.aborted || Date.now() >= deadlineAt) {
        return false;
      }
      if (outcome.result.done) {
        accepted = true;
        return true;
      }
      if (outcome.result.value.byteLength > 0) {
        return false;
      }
    }
    return false;
  } catch {
    return false;
  } finally {
    if (!accepted) {
      cancelReader();
    }
    if (cancellation !== null) {
      await Promise.race([cancellation, stopped]);
    }
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", abortHandler);

    const releaseReader = () => {
      try {
        reader.releaseLock();
      } catch {
        // Cleanup failures never alter the public validation result.
      }
    };
    if (activeRead === null) {
      releaseReader();
    } else {
      void activeRead.then(releaseReader, releaseReader);
    }
  }
}

function getBodyIsEmpty(request: Request): boolean {
  return (
    contentLengthIsValidAndEmpty(request) &&
    !request.headers.has("transfer-encoding") &&
    request.body === null
  );
}

function isSameOriginPost(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin !== null) {
    try {
      const parsedOrigin = new URL(origin);
      // Deployment must provide a trusted canonical request URL.
      if (
        origin !== parsedOrigin.origin ||
        parsedOrigin.origin !== new URL(request.url).origin
      ) {
        return false;
      }
    } catch {
      return false;
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  return fetchSite === null || ALLOWED_SEC_FETCH_SITES.has(fetchSite);
}

export async function validatePostSessionRequest(
  request: Request,
): Promise<SessionRequestError | null> {
  if (
    hasQuery(request) ||
    hasBrowserInternalTokenHeader(request) ||
    !(await postBodyIsEmpty(request))
  ) {
    return "INVALID_REQUEST";
  }
  if (!isSameOriginPost(request)) {
    return "FORBIDDEN";
  }
  return null;
}

export function validateGetSessionRequest(
  request: Request,
): SessionRequestError | null {
  if (
    hasQuery(request) ||
    hasBrowserInternalTokenHeader(request) ||
    !getBodyIsEmpty(request)
  ) {
    return "INVALID_REQUEST";
  }
  return null;
}

export const validatePostEmptyRequest = validatePostSessionRequest;
export const validateGetEmptyRequest = validateGetSessionRequest;

function contentLengthWithinChatLimit(request: Request): boolean {
  const contentLength = request.headers.get("content-length");
  if (contentLength === null) {
    return true;
  }
  if (!CONTENT_LENGTH_PATTERN.test(contentLength)) {
    return false;
  }
  const parsed = Number(contentLength);
  return Number.isSafeInteger(parsed) && parsed <= MAX_CHAT_BODY_BYTES;
}

function normalizePublicChatMessage(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  if (
    normalized.trim() === "" ||
    Array.from(normalized).length > MAX_CHAT_MESSAGE_CODEPOINTS
  ) {
    return null;
  }
  for (const character of normalized) {
    if (
      character !== "\n" &&
      UNSAFE_UNICODE_OTHER_PATTERN.test(character)
    ) {
      return null;
    }
  }
  return normalized;
}

async function readBoundedChatBody(request: Request): Promise<string | null> {
  if (
    !contentLengthWithinChatLimit(request) ||
    request.headers.has("transfer-encoding") ||
    request.signal.aborted ||
    request.body === null
  ) {
    return null;
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = request.body.getReader();
  } catch {
    return null;
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let completed = false;
  let timedOut = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<null>((resolve) => {
    timeout = setTimeout(() => {
      timedOut = true;
      void reader.cancel().catch(() => undefined);
      resolve(null);
    }, POST_BODY_PROBE_TIMEOUT_MS);
  });

  try {
    for (let count = 0; count < MAX_CHAT_STREAM_CHUNKS; count += 1) {
      const result = await Promise.race([reader.read(), deadline]);
      if (result === null || request.signal.aborted || timedOut) {
        return null;
      }
      if (result.done) {
        completed = true;
        break;
      }
      if (result.value.byteLength > MAX_CHAT_BODY_BYTES - totalBytes) {
        return null;
      }
      if (result.value.byteLength > 0) {
        totalBytes += result.value.byteLength;
        chunks.push(result.value);
      }
    }
  } catch {
    return null;
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    if (!completed) {
      void reader.cancel().catch(() => undefined);
    }
    try {
      reader.releaseLock();
    } catch {
      // Request cleanup never changes the public validation result.
    }
  }

  if (!completed || totalBytes === 0) {
    return null;
  }
  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    return null;
  }
}

export async function validatePostChatRequest(
  request: Request,
): Promise<ChatRequestValidationResult> {
  if (
    hasQuery(request) ||
    hasBrowserInternalTokenHeader(request) ||
    !isSameOriginPost(request)
  ) {
    return {
      ok: false,
      error: isSameOriginPost(request) ? "INVALID_REQUEST" : "FORBIDDEN",
    };
  }
  const contentType = request.headers.get("content-type");
  if (
    contentType === null ||
    !JSON_CONTENT_TYPE_PATTERN.test(contentType)
  ) {
    return { ok: false, error: "INVALID_REQUEST" };
  }
  const text = await readBoundedChatBody(request);
  if (text === null) {
    return { ok: false, error: "INVALID_REQUEST" };
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: "INVALID_REQUEST" };
  }
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return { ok: false, error: "INVALID_REQUEST" };
  }
  const keys = Object.keys(value);
  if (
    keys.length !== 2 ||
    !Object.prototype.hasOwnProperty.call(value, "message") ||
    !Object.prototype.hasOwnProperty.call(value, "requestId")
  ) {
    return { ok: false, error: "INVALID_REQUEST" };
  }
  const record = value as Record<string, unknown>;
  const message = normalizePublicChatMessage(record.message);
  if (
    message === null ||
    typeof record.requestId !== "string" ||
    !CANONICAL_UUID_PATTERN.test(record.requestId)
  ) {
    return { ok: false, error: "INVALID_REQUEST" };
  }
  return {
    ok: true,
    value: { message, requestId: record.requestId },
  };
}
