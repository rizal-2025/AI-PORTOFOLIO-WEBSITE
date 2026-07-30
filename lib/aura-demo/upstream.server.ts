import {
  hasExactKeys,
  isIso8601Timestamp,
  parsePublicDemoSession,
  type PublicCreateSessionResponse,
  type PublicCurrentSessionResponse,
  type PublicDemoHandoff,
  type PublicDemoMessage,
} from "@/lib/aura-demo/contracts";
import { isValidAuraSessionToken } from "@/lib/aura-demo/token.server";

export type ParsedAuraCreateSession = PublicCreateSessionResponse & {
  sessionToken: string;
};

function parseMessage(value: unknown): PublicDemoMessage | null {
  if (
    !hasExactKeys(value, ["id", "role", "content", "createdAt"]) ||
    !Number.isSafeInteger(value.id) ||
    (value.id as number) <= 0 ||
    (value.role !== "user" && value.role !== "assistant") ||
    typeof value.content !== "string" ||
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
      "reference",
      "status",
      "reasonCode",
      "safeSummary",
      "createdAt",
    ]) ||
    typeof value.reference !== "string" ||
    value.status !== "simulated" ||
    typeof value.reasonCode !== "string" ||
    typeof value.safeSummary !== "string" ||
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
  if (session === null) {
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
