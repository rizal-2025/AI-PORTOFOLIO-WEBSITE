import assert from "node:assert/strict";
import test from "node:test";

import {
  isCanonicalDate,
  isCanonicalReservationReference,
  isCanonicalTime,
  isSafeDemoContent,
} from "@/lib/aura-demo/contracts";
import {
  parseAuraChatResponse,
  parseAuraCurrentSession,
  parseAuraReservationList,
  parseAuraResetResponse,
} from "@/lib/aura-demo/upstream.server";

const timestamp = "2026-08-05T10:00:00Z";
const reference = "RSV_0123456789abcdef0123456789abcdef";
const session = {
  status: "active",
  expiresAt: timestamp,
  idleExpiresAt: timestamp,
  absoluteExpiresAt: "2026-08-06T10:00:00Z",
  messageCount: 1,
};

test("canonical public primitives reject malformed or unsafe values", () => {
  assert.equal(isCanonicalReservationReference(reference), true);
  assert.equal(
    isCanonicalReservationReference(reference.toUpperCase()),
    false,
  );
  assert.equal(isCanonicalDate("2026-02-29"), false);
  assert.equal(isCanonicalDate("2028-02-29"), true);
  assert.equal(isCanonicalTime("23:59:59"), true);
  assert.equal(isCanonicalTime("24:00:00"), false);
  assert.equal(isSafeDemoContent("Respons\naman"), true);
  assert.equal(isSafeDemoContent("unsafe\u0000content"), false);
  assert.equal(isSafeDemoContent("x".repeat(4097)), false);
});

test("current session accepts only fixed safe handoff pairs without reference", () => {
  const value = {
    session,
    messages: [
      {
        id: 42,
        role: "assistant",
        content: "Respons aman.",
        createdAt: timestamp,
      },
    ],
    handoff: {
      status: "simulated",
      reasonCode: "internal_error",
      safeSummary: "The demo assistant could not safely complete the request.",
      createdAt: timestamp,
    },
  };
  assert.deepEqual(parseAuraCurrentSession(value), {
    session,
    messages: [
      {
        role: "assistant",
        content: "Respons aman.",
        createdAt: timestamp,
      },
    ],
    handoff: {
      status: "simulated",
      summary: "The demo assistant could not safely complete the request.",
      createdAt: timestamp,
    },
  });
  assert.equal(
    parseAuraCurrentSession({
      ...value,
      handoff: { ...value.handoff, reference: "internal" },
    }),
    null,
  );
  assert.equal(
    parseAuraCurrentSession({
      ...value,
      handoff: { ...value.handoff, safeSummary: "untrusted" },
    }),
    null,
  );
});

test("chat parser strips internal IDs and accepts only structured mutation", () => {
  const parsed = parseAuraChatResponse({
    reply: {
      id: 7,
      role: "assistant",
      content: "Reservasi dibuat.",
      createdAt: timestamp,
    },
    reservationMutation: {
      operation: "created",
      reservationReference: reference,
    },
    handoff: { status: "simulated" },
  });
  assert.deepEqual(parsed, {
    reply: {
      role: "assistant",
      content: "Reservasi dibuat.",
      createdAt: timestamp,
    },
    reservationMutation: {
      operation: "created",
      reservationReference: reference,
    },
    handoff: { status: "simulated" },
  });
  assert.equal(JSON.stringify(parsed).includes('"id"'), false);
  assert.equal(
    parseAuraChatResponse({
      reply: {
        id: 7,
        role: "assistant",
        content: "Reservasi dibuat.",
        createdAt: timestamp,
      },
      reservationMutation: {
        operation: "created",
        reservationReference: reference,
        reservationId: 9,
      },
      handoff: null,
    }),
    null,
  );
});

test("reservation and reset parsers enforce exact public-safe DTOs", () => {
  assert.deepEqual(
    parseAuraReservationList({
      reservations: [
        {
          reservationReference: reference,
          status: "pending",
          reservationDate: "2026-08-10",
          reservationTime: "19:00:00",
          partySize: 4,
        },
      ],
      count: 1,
    }),
    {
      reservations: [
        {
          reservationReference: reference,
          status: "pending",
          reservationDate: "2026-08-10",
          reservationTime: "19:00:00",
          partySize: 4,
        },
      ],
      count: 1,
    },
  );
  assert.equal(
    parseAuraReservationList({
      reservations: [
        {
          reservationReference: reference,
          status: "pending",
          reservationDate: "2026-08-10",
          reservationTime: "19:00:00",
          partySize: 4,
          id: 1,
        },
      ],
      count: 1,
    }),
    null,
  );
  assert.deepEqual(
    parseAuraResetResponse({
      status: "reset",
      session: { ...session, messageCount: 0 },
      reservationCount: 0,
      handoff: null,
    }),
    {
      status: "reset",
      session: { ...session, messageCount: 0 },
      reservationCount: 0,
      handoff: null,
    },
  );
});
