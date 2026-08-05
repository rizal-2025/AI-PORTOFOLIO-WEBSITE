import {
  hasExactKeys,
  isCanonicalDate,
  isCanonicalReservationReference,
  isCanonicalTime,
  isIso8601Timestamp,
  isSafeDemoContent,
  parsePublicDemoSession,
  type PublicCreateSessionResponse,
  type PublicCurrentSessionResponse,
  type PublicDemoChatResponse,
  type PublicDemoErrorCode,
  type PublicDemoHandoff,
  type PublicDemoMessage,
  type PublicDemoReservation,
  type PublicDemoReservationListResponse,
  type PublicDemoResetResponse,
  type PublicReservationMutation,
} from "@/lib/aura-demo/contracts";

const RESPONSE_LIMIT_BYTES = 64 * 1024;
const BROWSER_TIMEOUT_MS = 35_000;
const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const PUBLIC_ERROR_BY_STATUS = {
  400: {
    code: "INVALID_REQUEST",
    message: "Pesan tidak valid. Periksa isinya lalu coba lagi.",
  },
  401: {
    code: "SESSION_REQUIRED",
    message: "Sesi demo berakhir. Mulai sesi baru untuk melanjutkan.",
  },
  403: {
    code: "FORBIDDEN",
    message: "Permintaan ini tidak diizinkan.",
  },
  409: {
    code: "REQUEST_CONFLICT",
    message: "Status demo berubah. Sinkronkan sesi sebelum mencoba lagi.",
  },
  429: {
    code: "RATE_LIMITED",
    message: "Batas permintaan tercapai. Tunggu sebentar lalu coba lagi.",
  },
  502: {
    code: "UPSTREAM_INVALID_RESPONSE",
    message: "Respons layanan demo tidak dapat diverifikasi.",
  },
  503: {
    code: "SERVICE_UNAVAILABLE",
    message: "Layanan demo sedang tidak tersedia.",
  },
  504: {
    code: "UPSTREAM_TIMEOUT",
    message: "Layanan demo membutuhkan waktu terlalu lama.",
  },
} as const satisfies Record<
  number,
  { code: PublicDemoErrorCode; message: string }
>;

type KnownErrorStatus = keyof typeof PUBLIC_ERROR_BY_STATUS;

export class DemoBrowserError extends Error {
  readonly status: number;
  readonly code: PublicDemoErrorCode | "NETWORK_ERROR";
  readonly retryAfterSeconds: number | null;

  constructor(
    status: number,
    code: PublicDemoErrorCode | "NETWORK_ERROR",
    message: string,
    retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "DemoBrowserError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function parseMessage(value: unknown): PublicDemoMessage | null {
  if (
    !hasExactKeys(value, ["role", "content", "createdAt"]) ||
    (value.role !== "user" && value.role !== "assistant") ||
    !isSafeDemoContent(value.content) ||
    !isIso8601Timestamp(value.createdAt)
  ) {
    return null;
  }
  return {
    role: value.role,
    content: value.content,
    createdAt: value.createdAt,
  };
}

function parseHandoff(value: unknown): PublicDemoHandoff | null {
  if (
    !hasExactKeys(value, ["status", "summary", "createdAt"]) ||
    value.status !== "simulated" ||
    !isSafeDemoContent(value.summary) ||
    !isIso8601Timestamp(value.createdAt)
  ) {
    return null;
  }
  return {
    status: "simulated",
    summary: value.summary,
    createdAt: value.createdAt,
  };
}

function parseCreateSession(value: unknown): PublicCreateSessionResponse | null {
  if (!hasExactKeys(value, ["session"])) {
    return null;
  }
  const session = parsePublicDemoSession(value.session);
  return session === null ? null : { session };
}

export function parseBrowserCurrentSession(
  value: unknown,
): PublicCurrentSessionResponse | null {
  if (!hasExactKeys(value, ["session", "messages", "handoff"])) {
    return null;
  }
  const session = parsePublicDemoSession(value.session);
  if (session === null || !Array.isArray(value.messages)) {
    return null;
  }
  const messages: PublicDemoMessage[] = [];
  for (const item of value.messages) {
    const parsed = parseMessage(item);
    if (parsed === null) {
      return null;
    }
    messages.push(parsed);
  }
  const handoff = value.handoff === null ? null : parseHandoff(value.handoff);
  if (value.handoff !== null && handoff === null) {
    return null;
  }
  return { session, messages, handoff };
}

function parseMutation(value: unknown): PublicReservationMutation | null {
  if (
    !hasExactKeys(value, ["operation", "reservationReference"]) ||
    (value.operation !== "created" &&
      value.operation !== "updated" &&
      value.operation !== "cancelled") ||
    !isCanonicalReservationReference(value.reservationReference)
  ) {
    return null;
  }
  return {
    operation: value.operation,
    reservationReference: value.reservationReference,
  };
}

export function parseBrowserChatResponse(
  value: unknown,
): PublicDemoChatResponse | null {
  if (!hasExactKeys(value, ["reply", "reservationMutation", "handoff"])) {
    return null;
  }
  if (
    !hasExactKeys(value.reply, ["role", "content", "createdAt"]) ||
    value.reply.role !== "assistant" ||
    !isSafeDemoContent(value.reply.content) ||
    !isIso8601Timestamp(value.reply.createdAt)
  ) {
    return null;
  }
  const mutation =
    value.reservationMutation === null
      ? null
      : parseMutation(value.reservationMutation);
  if (value.reservationMutation !== null && mutation === null) {
    return null;
  }
  if (
    value.handoff !== null &&
    (!hasExactKeys(value.handoff, ["status"]) ||
      value.handoff.status !== "simulated")
  ) {
    return null;
  }
  return {
    reply: {
      role: "assistant",
      content: value.reply.content,
      createdAt: value.reply.createdAt,
    },
    reservationMutation: mutation,
    handoff: value.handoff === null ? null : { status: "simulated" },
  };
}

function parseReservation(value: unknown): PublicDemoReservation | null {
  if (
    !hasExactKeys(value, [
      "reservationReference",
      "status",
      "reservationDate",
      "reservationTime",
      "partySize",
    ]) ||
    !isCanonicalReservationReference(value.reservationReference) ||
    (value.status !== "pending" && value.status !== "cancelled") ||
    !isCanonicalDate(value.reservationDate) ||
    !isCanonicalTime(value.reservationTime) ||
    !Number.isSafeInteger(value.partySize) ||
    (value.partySize as number) <= 0
  ) {
    return null;
  }
  return {
    reservationReference: value.reservationReference,
    status: value.status,
    reservationDate: value.reservationDate,
    reservationTime: value.reservationTime,
    partySize: value.partySize as number,
  };
}

export function parseBrowserReservationList(
  value: unknown,
): PublicDemoReservationListResponse | null {
  if (
    !hasExactKeys(value, ["reservations", "count"]) ||
    !Array.isArray(value.reservations) ||
    !Number.isSafeInteger(value.count) ||
    (value.count as number) < 0 ||
    value.count !== value.reservations.length
  ) {
    return null;
  }
  const reservations: PublicDemoReservation[] = [];
  for (const item of value.reservations) {
    const parsed = parseReservation(item);
    if (parsed === null) {
      return null;
    }
    reservations.push(parsed);
  }
  return { reservations, count: value.count as number };
}

function parseReset(value: unknown): PublicDemoResetResponse | null {
  if (
    !hasExactKeys(value, ["status", "session", "reservationCount", "handoff"]) ||
    value.status !== "reset" ||
    value.reservationCount !== 0 ||
    value.handoff !== null
  ) {
    return null;
  }
  const session = parsePublicDemoSession(value.session);
  return session === null
    ? null
    : { status: "reset", session, reservationCount: 0, handoff: null };
}

function parseRetryAfter(value: string | null): number | null {
  if (value === null || !/^(?:0|[1-9]\d*)$/.test(value)) {
    return null;
  }
  const seconds = Number(value);
  return Number.isSafeInteger(seconds) && seconds >= 0 && seconds <= 86_400
    ? seconds
    : null;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > RESPONSE_LIMIT_BYTES) {
    throw new DemoBrowserError(
      502,
      "UPSTREAM_INVALID_RESPONSE",
      PUBLIC_ERROR_BY_STATUS[502].message,
    );
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new DemoBrowserError(
      502,
      "UPSTREAM_INVALID_RESPONSE",
      PUBLIC_ERROR_BY_STATUS[502].message,
    );
  }
}

function isKnownStatus(status: number): status is KnownErrorStatus {
  return Object.prototype.hasOwnProperty.call(PUBLIC_ERROR_BY_STATUS, status);
}

async function throwPublicError(response: Response): Promise<never> {
  const definition = isKnownStatus(response.status)
    ? PUBLIC_ERROR_BY_STATUS[response.status]
    : PUBLIC_ERROR_BY_STATUS[503];
  let value: unknown = null;
  try {
    value = await readJson(response);
  } catch {
    // The browser only displays the local safe message below.
  }
  const envelopeMatches =
    hasExactKeys(value, ["error"]) &&
    hasExactKeys(value.error, ["code", "message"]) &&
    value.error.code === definition.code &&
    typeof value.error.message === "string";
  const code = envelopeMatches ? definition.code : "SERVICE_UNAVAILABLE";
  throw new DemoBrowserError(
    response.status,
    code,
    envelopeMatches ? definition.message : PUBLIC_ERROR_BY_STATUS[503].message,
    response.status === 429
      ? parseRetryAfter(response.headers.get("Retry-After"))
      : null,
  );
}

async function requestJson<T>(
  path: "/api/demo/session" | "/api/demo/chat" | "/api/demo/reservations" | "/api/demo/reset",
  init: RequestInit,
  parser: (value: unknown) => T | null,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), BROWSER_TIMEOUT_MS);
  try {
    const response = await fetch(path, {
      ...init,
      cache: "no-store",
      credentials: "same-origin",
      redirect: "error",
      signal: controller.signal,
    });
    if (!response.ok) {
      return await throwPublicError(response);
    }
    const parsed = parser(await readJson(response));
    if (parsed === null) {
      throw new DemoBrowserError(
        502,
        "UPSTREAM_INVALID_RESPONSE",
        PUBLIC_ERROR_BY_STATUS[502].message,
      );
    }
    return parsed;
  } catch (error) {
    if (error instanceof DemoBrowserError) {
      throw error;
    }
    throw new DemoBrowserError(
      0,
      "NETWORK_ERROR",
      "Koneksi ke demo terputus. Periksa jaringan lalu coba lagi.",
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

export function createDemoRequestId(): string {
  const requestId = crypto.randomUUID();
  if (!REQUEST_ID_PATTERN.test(requestId)) {
    throw new DemoBrowserError(
      0,
      "NETWORK_ERROR",
      "Browser tidak dapat membuat identitas permintaan yang aman.",
    );
  }
  return requestId;
}

export function createDemoSession(): Promise<PublicCreateSessionResponse> {
  return requestJson("/api/demo/session", { method: "POST" }, parseCreateSession);
}

export function getDemoSession(): Promise<PublicCurrentSessionResponse> {
  return requestJson("/api/demo/session", { method: "GET" }, parseBrowserCurrentSession);
}

export function postDemoChat(
  message: string,
  requestId: string,
): Promise<PublicDemoChatResponse> {
  return requestJson(
    "/api/demo/chat",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, requestId }),
    },
    parseBrowserChatResponse,
  );
}

export function getDemoReservations(): Promise<PublicDemoReservationListResponse> {
  return requestJson(
    "/api/demo/reservations",
    { method: "GET" },
    parseBrowserReservationList,
  );
}

export function resetDemoSession(): Promise<PublicDemoResetResponse> {
  return requestJson("/api/demo/reset", { method: "POST" }, parseReset);
}
