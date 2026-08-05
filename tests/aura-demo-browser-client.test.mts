import assert from "node:assert/strict";
import test from "node:test";

import {
  createDemoRequestId,
  createDemoSession,
  DemoBrowserError,
  getDemoReservations,
  getDemoSession,
  parseBrowserChatResponse,
  parseBrowserCurrentSession,
  parseBrowserReservationList,
  postDemoChat,
  resetDemoSession,
} from "@/lib/aura-demo/browser-client";

const timestamp = "2026-08-05T10:00:00Z";
const reference = "RSV_0123456789abcdef0123456789abcdef";
const session = {
  status: "active",
  expiresAt: timestamp,
  idleExpiresAt: timestamp,
  absoluteExpiresAt: "2026-08-06T10:00:00Z",
  messageCount: 0,
};

test("browser session parser accepts only the public allowlist", () => {
  const current = {
    session,
    messages: [
      { role: "assistant", content: "Halo.", createdAt: timestamp },
    ],
    handoff: null,
  };
  assert.deepEqual(parseBrowserCurrentSession(current), current);
  assert.equal(
    parseBrowserCurrentSession({
      ...current,
      sessionToken: "must-not-cross-the-browser-boundary",
    }),
    null,
  );
  assert.equal(
    parseBrowserCurrentSession({
      ...current,
      messages: [{ ...current.messages[0], id: 9 }],
    }),
    null,
  );
});

test("browser chat parser uses structured mutation and rejects internal IDs", () => {
  const result = {
    reply: { role: "assistant", content: "Dibuat.", createdAt: timestamp },
    reservationMutation: {
      operation: "created",
      reservationReference: reference,
    },
    handoff: null,
  };
  assert.deepEqual(parseBrowserChatResponse(result), result);
  assert.equal(
    parseBrowserChatResponse({
      ...result,
      reservationMutation: { ...result.reservationMutation, reservationId: 3 },
    }),
    null,
  );
});

test("browser reservation parser rejects numeric IDs and count mismatches", () => {
  const reservation = {
    reservationReference: reference,
    status: "pending",
    reservationDate: "2026-08-10",
    reservationTime: "19:00:00",
    partySize: 2,
  };
  assert.deepEqual(parseBrowserReservationList({ reservations: [reservation], count: 1 }), {
    reservations: [reservation],
    count: 1,
  });
  assert.equal(
    parseBrowserReservationList({ reservations: [{ ...reservation, id: 1 }], count: 1 }),
    null,
  );
  assert.equal(parseBrowserReservationList({ reservations: [reservation], count: 0 }), null);
});

test("browser helpers call only the four same-origin BFF routes", async (t) => {
  const calls: Array<{ path: string; method: string; body: string | null }> = [];
  const responses = [
    { session },
    { session, messages: [], handoff: null },
    { reservations: [], count: 0 },
    {
      reply: { role: "assistant", content: "Halo.", createdAt: timestamp },
      reservationMutation: null,
      handoff: null,
    },
    { status: "reset", session, reservationCount: 0, handoff: null },
  ];
  const browserWindow = {
    setTimeout,
    clearTimeout,
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: browserWindow,
  });
  t.after(() => {
    Reflect.deleteProperty(globalThis, "window");
  });
  t.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({
      path: String(input),
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : null,
    });
      return Response.json(responses.shift());
    },
  );

  await createDemoSession();
  await getDemoSession();
  await getDemoReservations();
  await postDemoChat("Halo", "37f6b68e-e047-4e2e-8bc5-b0c07831f41d");
  await resetDemoSession();

  assert.deepEqual(
    calls.map(({ path, method }) => ({ path, method })),
    [
      { path: "/api/demo/session", method: "POST" },
      { path: "/api/demo/session", method: "GET" },
      { path: "/api/demo/reservations", method: "GET" },
      { path: "/api/demo/chat", method: "POST" },
      { path: "/api/demo/reset", method: "POST" },
    ],
  );
  assert.deepEqual(JSON.parse(calls[3]?.body ?? "{}"), {
    message: "Halo",
    requestId: "37f6b68e-e047-4e2e-8bc5-b0c07831f41d",
  });
  assert.match(createDemoRequestId(), /^[0-9a-f-]{36}$/);
});

test("browser chat does not retry a rate-limited mutation automatically", async (t) => {
  let callCount = 0;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { setTimeout, clearTimeout },
  });
  t.after(() => {
    Reflect.deleteProperty(globalThis, "window");
  });
  t.mock.method(globalThis, "fetch", async () => {
    callCount += 1;
    return Response.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "untrusted upstream wording is ignored",
        },
      },
      { status: 429, headers: { "Retry-After": "12" } },
    );
  });

  await assert.rejects(
    postDemoChat("Halo", "37f6b68e-e047-4e2e-8bc5-b0c07831f41d"),
    (error: unknown) => {
      assert.ok(error instanceof DemoBrowserError);
      assert.equal(error.code, "RATE_LIMITED");
      assert.equal(error.retryAfterSeconds, 12);
      assert.equal(error.message.includes("untrusted"), false);
      return true;
    },
  );
  assert.equal(callCount, 1);
});
