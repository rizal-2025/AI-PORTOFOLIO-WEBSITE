import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { POST as postChat } from "@/app/api/demo/chat/route";
import { GET as getReservations } from "@/app/api/demo/reservations/route";
import { POST as resetDemo } from "@/app/api/demo/reset/route";
import {
  GET as getSession,
  POST as postSession,
} from "@/app/api/demo/session/route";

type AuraTestState = typeof globalThis & {
  __auraDemoCookieValue?: string;
};

const state = globalThis as AuraTestState;
const sessionToken = "x".repeat(43);
const expiredSessionToken = "y".repeat(43);
const requestId = "123e4567-e89b-42d3-a456-426614174000";
const reference = "RSV_0123456789abcdef0123456789abcdef";
const timestamp = "2026-08-05T10:00:00Z";
const absolute = "2099-08-06T10:00:00Z";

process.env.AURA_INTERNAL_BASE_URL = "https://aura.internal";
process.env.AURA_DEMO_SERVICE_TOKEN = "synthetic-service-token-for-route-tests";
process.env.AURA_CLIENT_SUBJECT_HMAC_KEY =
  "synthetic-client-subject-hmac-key-for-route-tests";
process.env.AURA_DEMO_SESSION_COOKIE = "aura_demo";
process.env.AURA_BFF_TIMEOUT_MS = "5000";
process.env.AURA_TRUSTED_INGRESS_MODE = "development";

function jsonResponse(value: unknown, status = 200, headers = {}): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function session(messageCount: number) {
  return {
    status: "active",
    expiresAt: timestamp,
    idleExpiresAt: timestamp,
    absoluteExpiresAt: absolute,
    messageCount,
  };
}

function publicRequest(
  path: string,
  method: "GET" | "POST",
  body?: string,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(`https://portfolio.example${path}`, {
    method,
    body,
    headers: {
      ...(method === "POST"
        ? {
            origin: "https://portfolio.example",
            "sec-fetch-site": "same-origin",
          }
        : {}),
      ...headers,
    },
  });
}

const originalFetch = globalThis.fetch;

test.before(() => {
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    const headers = new Headers(init?.headers);
    assert.equal(
      headers.get("X-BFF-Service-Token"),
      "synthetic-service-token-for-route-tests",
    );
    assert.match(headers.get("X-Demo-Client-Subject") ?? "", /^[0-9a-f]{64}$/);
    const scoped = url.pathname !== "/internal/demo/sessions";
    if (scoped) {
      const receivedToken = headers.get("X-Demo-Session-Token");
      if (receivedToken === expiredSessionToken) {
        return jsonResponse(
          {
            code: "DEMO_SESSION_REQUIRED",
            detail: "Sesi demo tidak valid atau telah kedaluwarsa.",
          },
          401,
        );
      }
      assert.equal(receivedToken, sessionToken);
    }

    if (url.pathname === "/internal/demo/sessions") {
      return jsonResponse(
        { sessionToken, session: session(0) },
        201,
      );
    }
    if (url.pathname === "/internal/demo/sessions/current") {
      return jsonResponse({
        session: session(1),
        messages: [
          {
            id: 17,
            role: "assistant",
            content: "Respons aman.",
            createdAt: timestamp,
          },
        ],
        handoff: {
          status: "simulated",
          reasonCode: "internal_error",
          safeSummary:
            "The demo assistant could not safely complete the request.",
          createdAt: timestamp,
        },
      });
    }
    if (url.pathname === "/internal/demo/reservations") {
      return jsonResponse({
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
      });
    }
    if (url.pathname === "/internal/demo/reset") {
      return jsonResponse({
        status: "reset",
        session: session(0),
        reservationCount: 0,
        handoff: null,
      });
    }
    if (url.pathname === "/internal/demo/chat") {
      const body = JSON.parse(String(init?.body));
      if (body.message === "conflict") {
        return jsonResponse(
          {
            code: "REQUEST_CONFLICT",
            detail: "Permintaan demo sedang diproses atau belum selesai.",
          },
          409,
        );
      }
      if (body.message === "rate") {
        return jsonResponse(
          {
            code: "RATE_LIMIT_EXCEEDED",
            detail: "Batas permintaan demo telah tercapai.",
          },
          429,
          {
            "Retry-After": "12",
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": "9999999999",
            "X-Internal-Debug": "hidden",
          },
        );
      }
      if (body.message === "provider-timeout") {
        return jsonResponse(
          {
            code: "PROVIDER_TIMEOUT",
            detail: "Layanan AI demo melewati batas waktu.",
          },
          504,
        );
      }
      if (body.message === "unavailable") {
        return jsonResponse(
          {
            code: "SERVICE_UNAVAILABLE",
            detail: "Layanan demo sementara tidak tersedia.",
          },
          503,
        );
      }
      if (body.message === "malformed") {
        return jsonResponse({
          reply: {
            id: 99,
            role: "assistant",
            content: "Respons aman.",
            createdAt: timestamp,
            ownerId: 1,
          },
          reservationMutation: null,
          handoff: null,
        });
      }
      return jsonResponse({
        reply: {
          id: 99,
          role: "assistant",
          content: "Respons aman.",
          createdAt: timestamp,
        },
        reservationMutation: {
          operation: "created",
          reservationReference: reference,
        },
        handoff: { status: "simulated" },
      });
    }
    throw new Error("Unexpected synthetic route.");
  };
});

test.after(() => {
  globalThis.fetch = originalFetch;
  delete state.__auraDemoCookieValue;
});

test("session routes set HttpOnly cookie and expose no token or internal ID", async () => {
  delete state.__auraDemoCookieValue;
  const created = await postSession(
    publicRequest("/api/demo/session", "POST"),
  );
  assert.equal(created.status, 201);
  assert.match(created.headers.get("set-cookie") ?? "", /HttpOnly/i);
  assert.deepEqual(await created.json(), { session: session(0) });

  state.__auraDemoCookieValue = sessionToken;
  const current = await getSession(
    publicRequest("/api/demo/session", "GET"),
  );
  const body = await current.json();
  assert.equal(current.status, 200);
  assert.deepEqual(body.messages, [
    {
      role: "assistant",
      content: "Respons aman.",
      createdAt: timestamp,
    },
  ]);
  assert.deepEqual(Object.keys(body.handoff).sort(), [
    "createdAt",
    "status",
    "summary",
  ]);
  assert.equal(JSON.stringify(body).includes('"id"'), false);
  assert.equal(JSON.stringify(body).includes("reference"), false);
});

test("chat, reservation, and reset routes expose exact public allowlists", async () => {
  state.__auraDemoCookieValue = sessionToken;
  const chat = await postChat(
    publicRequest(
      "/api/demo/chat",
      "POST",
      JSON.stringify({ message: "Halo", requestId }),
      { "content-type": "application/json" },
    ),
  );
  const chatBody = await chat.json();
  assert.equal(chat.status, 200);
  assert.deepEqual(Object.keys(chatBody.reply).sort(), [
    "content",
    "createdAt",
    "role",
  ]);
  assert.equal(chatBody.reservationMutation.reservationReference, reference);
  assert.equal(chat.headers.get("set-cookie"), null);

  const reservations = await getReservations(
    publicRequest("/api/demo/reservations", "GET"),
  );
  const reservationsBody = await reservations.json();
  assert.equal(reservations.status, 200);
  assert.deepEqual(Object.keys(reservationsBody.reservations[0]).sort(), [
    "partySize",
    "reservationDate",
    "reservationReference",
    "reservationTime",
    "status",
  ]);

  const reset = await resetDemo(
    publicRequest("/api/demo/reset", "POST"),
  );
  assert.equal(reset.status, 200);
  assert.deepEqual(await reset.json(), {
    status: "reset",
    session: session(0),
    reservationCount: 0,
    handoff: null,
  });
  assert.equal(reset.headers.get("set-cookie"), null);
});

test("routes reject browser auth headers, cross-site calls, bodies, and missing sessions", async () => {
  state.__auraDemoCookieValue = sessionToken;
  const browserAuth = await postChat(
    publicRequest(
      "/api/demo/chat",
      "POST",
      JSON.stringify({ message: "Halo", requestId }),
      {
        "content-type": "application/json",
        "x-bff-service-token": "browser-controlled",
      },
    ),
  );
  assert.equal(browserAuth.status, 400);

  const browserSubject = await postChat(
    publicRequest(
      "/api/demo/chat",
      "POST",
      JSON.stringify({ message: "Halo", requestId }),
      {
        "content-type": "application/json",
        "x-demo-client-subject": "c".repeat(64),
      },
    ),
  );
  assert.equal(browserSubject.status, 400);

  const crossSite = await postChat(
    publicRequest(
      "/api/demo/chat",
      "POST",
      JSON.stringify({ message: "Halo", requestId }),
      {
        "content-type": "application/json",
        origin: "https://attacker.example",
        "sec-fetch-site": "cross-site",
      },
    ),
  );
  assert.equal(crossSite.status, 403);

  const resetWithBody = await resetDemo(
    publicRequest("/api/demo/reset", "POST", "{}", {
      "content-type": "application/json",
    }),
  );
  assert.equal(resetWithBody.status, 400);

  delete state.__auraDemoCookieValue;
  const missing = await getReservations(
    publicRequest("/api/demo/reservations", "GET"),
  );
  assert.equal(missing.status, 401);
  assert.equal((await missing.json()).error.code, "SESSION_REQUIRED");
});

test("conflict and rate limit are safe and retain the valid cookie", async () => {
  state.__auraDemoCookieValue = sessionToken;
  const conflict = await postChat(
    publicRequest(
      "/api/demo/chat",
      "POST",
      JSON.stringify({ message: "conflict", requestId }),
      { "content-type": "application/json" },
    ),
  );
  assert.equal(conflict.status, 409);
  assert.equal((await conflict.json()).error.code, "REQUEST_CONFLICT");
  assert.equal(conflict.headers.get("set-cookie"), null);

  const rateLimited = await postChat(
    publicRequest(
      "/api/demo/chat",
      "POST",
      JSON.stringify({ message: "rate", requestId }),
      { "content-type": "application/json" },
    ),
  );
  assert.equal(rateLimited.status, 429);
  assert.equal((await rateLimited.json()).error.code, "RATE_LIMITED");
  assert.equal(rateLimited.headers.get("retry-after"), "12");
  assert.equal(rateLimited.headers.get("x-internal-debug"), null);
  assert.equal(rateLimited.headers.get("set-cookie"), null);
});

test("session invalidation is exact while transient and malformed failures retain cookies", async () => {
  state.__auraDemoCookieValue = expiredSessionToken;
  const expired = await getReservations(
    publicRequest("/api/demo/reservations", "GET"),
  );
  assert.equal(expired.status, 401);
  assert.equal((await expired.json()).error.code, "SESSION_REQUIRED");
  assert.match(expired.headers.get("set-cookie") ?? "", /Max-Age=0/i);

  state.__auraDemoCookieValue = sessionToken;
  for (const [message, status, code] of [
    ["provider-timeout", 504, "UPSTREAM_TIMEOUT"],
    ["unavailable", 503, "SERVICE_UNAVAILABLE"],
    ["malformed", 502, "UPSTREAM_INVALID_RESPONSE"],
  ] as const) {
    const response = await postChat(
      publicRequest(
        "/api/demo/chat",
        "POST",
        JSON.stringify({ message, requestId }),
        { "content-type": "application/json" },
      ),
    );
    assert.equal(response.status, status);
    assert.equal((await response.json()).error.code, code);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});
