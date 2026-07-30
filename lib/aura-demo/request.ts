export type SessionRequestError = "FORBIDDEN" | "INVALID_REQUEST";

const MAX_EMPTY_STREAM_CHUNKS = 8;
const POST_BODY_PROBE_TIMEOUT_MS = 1_000;
const CONTENT_LENGTH_PATTERN = /^(?:0|[1-9]\d*)$/;
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

function hasBrowserSessionTokenHeader(request: Request): boolean {
  return request.headers.has("x-demo-session-token");
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
    hasBrowserSessionTokenHeader(request) ||
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
    hasBrowserSessionTokenHeader(request) ||
    !getBodyIsEmpty(request)
  ) {
    return "INVALID_REQUEST";
  }
  return null;
}
