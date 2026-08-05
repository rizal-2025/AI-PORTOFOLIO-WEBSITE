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
  type PublicDemoHandoff,
  type PublicDemoMessage,
  type PublicDemoReservation,
  type PublicDemoReservationListResponse,
  type PublicDemoResetResponse,
  type PublicReservationMutation,
} from "@/lib/aura-demo/contracts";
import { isValidAuraSessionToken } from "@/lib/aura-demo/token.server";

export type ParsedAuraCreateSession = PublicCreateSessionResponse & {
  sessionToken: string;
};

const SAFE_HANDOFF_SUMMARIES = {
  explicit_human_request:
    "Demo visitor requested simulated human assistance.",
  repeated_misunderstanding:
    "The demo assistant could not resolve the request.",
  internal_error:
    "The demo assistant could not safely complete the request.",
} as const;

function parseMessage(value: unknown): PublicDemoMessage | null {
  if (
    !hasExactKeys(value, ["id", "role", "content", "createdAt"]) ||
    !Number.isSafeInteger(value.id) ||
    (value.id as number) <= 0 ||
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
    !hasExactKeys(value, [
      "status",
      "reasonCode",
      "safeSummary",
      "createdAt",
    ]) ||
    value.status !== "simulated" ||
    typeof value.reasonCode !== "string" ||
    !Object.prototype.hasOwnProperty.call(
      SAFE_HANDOFF_SUMMARIES,
      value.reasonCode,
    ) ||
    typeof value.safeSummary !== "string" ||
    value.safeSummary !==
      SAFE_HANDOFF_SUMMARIES[
        value.reasonCode as keyof typeof SAFE_HANDOFF_SUMMARIES
      ] ||
    !isIso8601Timestamp(value.createdAt)
  ) {
    return null;
  }

  return {
    status: "simulated",
    summary: value.safeSummary,
    createdAt: value.createdAt,
  };
}

export function parseAuraCreateSession(
  value: unknown,
  nowMs: number,
): ParsedAuraCreateSession | null {
  if (
    !hasExactKeys(value, ["sessionToken", "session"]) ||
    !isValidAuraSessionToken(value.sessionToken)
  ) {
    return null;
  }

  const session = parsePublicDemoSession(value.session);
  if (
    session === null ||
    Date.parse(session.absoluteExpiresAt) <= nowMs
  ) {
    return null;
  }

  return {
    sessionToken: value.sessionToken,
    session,
  };
}

export function parseAuraCurrentSession(
  value: unknown,
): PublicCurrentSessionResponse | null {
  if (
    !hasExactKeys(value, ["session", "messages", "handoff"]) ||
    !Array.isArray(value.messages) ||
    value.messages.length > 50
  ) {
    return null;
  }

  const session = parsePublicDemoSession(value.session);
  if (session === null || session.messageCount < value.messages.length) {
    return null;
  }

  const messages: PublicDemoMessage[] = [];
  for (const candidate of value.messages) {
    const message = parseMessage(candidate);
    if (message === null) {
      return null;
    }
    messages.push(message);
  }

  let handoff: PublicDemoHandoff | null = null;
  if (value.handoff !== null) {
    handoff = parseHandoff(value.handoff);
    if (handoff === null) {
      return null;
    }
  }

  return {
    session,
    messages,
    handoff,
  };
}

function parseChatReply(value: unknown) {
  if (
    !hasExactKeys(value, ["id", "role", "content", "createdAt"]) ||
    !Number.isSafeInteger(value.id) ||
    (value.id as number) <= 0 ||
    value.role !== "assistant" ||
    !isSafeDemoContent(value.content) ||
    !isIso8601Timestamp(value.createdAt)
  ) {
    return null;
  }
  return {
    role: "assistant" as const,
    content: value.content,
    createdAt: value.createdAt,
  };
}

function parseReservationMutation(
  value: unknown,
): PublicReservationMutation | null {
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

export function parseAuraChatResponse(
  value: unknown,
): PublicDemoChatResponse | null {
  if (
    !hasExactKeys(value, ["reply", "reservationMutation", "handoff"])
  ) {
    return null;
  }
  const reply = parseChatReply(value.reply);
  if (reply === null) {
    return null;
  }
  let reservationMutation: PublicReservationMutation | null = null;
  if (value.reservationMutation !== null) {
    reservationMutation = parseReservationMutation(value.reservationMutation);
    if (reservationMutation === null) {
      return null;
    }
  }
  if (
    value.handoff !== null &&
    (!hasExactKeys(value.handoff, ["status"]) ||
      value.handoff.status !== "simulated")
  ) {
    return null;
  }
  return {
    reply,
    reservationMutation,
    handoff:
      value.handoff === null ? null : { status: "simulated" as const },
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
    (value.partySize as number) < 1 ||
    (value.partySize as number) > 20
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

export function parseAuraReservationList(
  value: unknown,
): PublicDemoReservationListResponse | null {
  if (
    !hasExactKeys(value, ["reservations", "count"]) ||
    !Array.isArray(value.reservations) ||
    value.reservations.length > 50 ||
    !Number.isSafeInteger(value.count) ||
    (value.count as number) < value.reservations.length
  ) {
    return null;
  }
  const reservations: PublicDemoReservation[] = [];
  for (const candidate of value.reservations) {
    const reservation = parseReservation(candidate);
    if (reservation === null) {
      return null;
    }
    reservations.push(reservation);
  }
  return { reservations, count: value.count as number };
}

export function parseAuraResetResponse(
  value: unknown,
): PublicDemoResetResponse | null {
  if (
    !hasExactKeys(value, [
      "status",
      "session",
      "reservationCount",
      "handoff",
    ]) ||
    value.status !== "reset" ||
    value.reservationCount !== 0 ||
    value.handoff !== null
  ) {
    return null;
  }
  const session = parsePublicDemoSession(value.session);
  if (session === null || session.messageCount !== 0) {
    return null;
  }
  return {
    status: "reset",
    session,
    reservationCount: 0,
    handoff: null,
  };
}
