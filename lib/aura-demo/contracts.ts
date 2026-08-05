export type PublicDemoSession = {
  status: "active";
  expiresAt: string;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
  messageCount: number;
};

export type PublicCreateSessionResponse = {
  session: PublicDemoSession;
};

export type PublicDemoMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type PublicDemoHandoff = {
  status: "simulated";
  summary: string;
  createdAt: string;
};

export type PublicCurrentSessionResponse = {
  session: PublicDemoSession;
  messages: PublicDemoMessage[];
  handoff: PublicDemoHandoff | null;
};

export type PublicDemoChatReply = {
  role: "assistant";
  content: string;
  createdAt: string;
};

export type PublicReservationMutation = {
  operation: "created" | "updated" | "cancelled";
  reservationReference: string;
};

export type PublicDemoChatHandoff = {
  status: "simulated";
};

export type PublicDemoChatResponse = {
  reply: PublicDemoChatReply;
  reservationMutation: PublicReservationMutation | null;
  handoff: PublicDemoChatHandoff | null;
};

export type PublicDemoReservation = {
  reservationReference: string;
  status: "pending" | "cancelled";
  reservationDate: string;
  reservationTime: string;
  partySize: number;
};

export type PublicDemoReservationListResponse = {
  reservations: PublicDemoReservation[];
  count: number;
};

export type PublicDemoResetResponse = {
  status: "reset";
  session: PublicDemoSession;
  reservationCount: 0;
  handoff: null;
};

export type PublicDemoErrorCode =
  | "INVALID_REQUEST"
  | "FORBIDDEN"
  | "SESSION_REQUIRED"
  | "RATE_LIMITED"
  | "REQUEST_CONFLICT"
  | "UPSTREAM_INVALID_RESPONSE"
  | "SERVICE_UNAVAILABLE"
  | "UPSTREAM_TIMEOUT";

export type PublicDemoErrorResponse = {
  error: {
    code: PublicDemoErrorCode;
    message: string;
  };
};

export type SafeRateLimitHeaders = Partial<
  Record<
    | "Retry-After"
    | "X-RateLimit-Limit"
    | "X-RateLimit-Remaining"
    | "X-RateLimit-Reset",
    string
  >
>;

const ISO_8601_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(?:Z|[+-](\d{2}):(\d{2}))$/;
const RESERVATION_REFERENCE_PATTERN = /^RSV_[0-9a-f]{32}$/;
const CANONICAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const CANONICAL_TIME_PATTERN = /^(\d{2}):(\d{2}):(\d{2})$/;
const UNSAFE_UNICODE_OTHER_PATTERN = /\p{C}/u;
const MAX_PUBLIC_DEMO_CONTENT_CODEPOINTS = 4096;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasExactKeys(
  value: unknown,
  expectedKeys: readonly string[],
): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const keys = Object.keys(value);
  return (
    keys.length === expectedKeys.length &&
    expectedKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(value, key),
    )
  );
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1] ?? 0;
}

export function isCanonicalReservationReference(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    RESERVATION_REFERENCE_PATTERN.test(value)
  );
}

export function isSafeDemoContent(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }
  if (Array.from(value).length > MAX_PUBLIC_DEMO_CONTENT_CODEPOINTS) {
    return false;
  }
  for (const character of value) {
    if (
      character !== "\n" &&
      UNSAFE_UNICODE_OTHER_PATTERN.test(character)
    ) {
      return false;
    }
  }
  return !value.includes("\r");
}

export function isCanonicalDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const match = CANONICAL_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

export function isCanonicalTime(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const match = CANONICAL_TIME_PATTERN.exec(value);
  return (
    match !== null &&
    Number(match[1]) <= 23 &&
    Number(match[2]) <= 59 &&
    Number(match[3]) <= 59
  );
}

export function isIso8601Timestamp(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const match = ISO_8601_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[7] === undefined ? 0 : Number(match[7]);
  const offsetMinute = match[8] === undefined ? 0 : Number(match[8]);

  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month) &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59 &&
    offsetHour <= 23 &&
    offsetMinute <= 59 &&
    Number.isFinite(Date.parse(value))
  );
}

export function parsePublicDemoSession(
  value: unknown,
): PublicDemoSession | null {
  if (
    !hasExactKeys(value, [
      "status",
      "expiresAt",
      "idleExpiresAt",
      "absoluteExpiresAt",
      "messageCount",
    ]) ||
    value.status !== "active" ||
    !isIso8601Timestamp(value.expiresAt) ||
    !isIso8601Timestamp(value.idleExpiresAt) ||
    !isIso8601Timestamp(value.absoluteExpiresAt) ||
    !Number.isSafeInteger(value.messageCount) ||
    (value.messageCount as number) < 0
  ) {
    return null;
  }

  return {
    status: "active",
    expiresAt: value.expiresAt,
    idleExpiresAt: value.idleExpiresAt,
    absoluteExpiresAt: value.absoluteExpiresAt,
    messageCount: value.messageCount as number,
  };
}

export function parseRateLimitInteger(
  value: string | null,
  positive: boolean,
): string | undefined {
  if (value === null || !/^(?:0|[1-9]\d*)$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);
  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 0 ||
    (positive && parsed === 0)
  ) {
    return undefined;
  }

  return value;
}
