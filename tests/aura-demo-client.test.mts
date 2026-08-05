import assert from "node:assert/strict";
import test from "node:test";

import {
  AuraDemoClientError,
  getAuraDemoReservations,
  postAuraDemoChat,
} from "@/lib/aura-demo/client.server";

const config = {
  baseUrl: "https://aura.internal",
  serviceToken: "synthetic-service-token",
  sessionCookieName: "aura_demo",
  timeoutMs: 500,
} as const;
const sessionToken = "x".repeat(43);
const requestId = "123e4567-e89b-42d3-a456-426614174000";
const reference = "RSV_0123456789abcdef0123456789abcdef";
const timestamp = "2026-08-05T10:00:00Z";

function jsonResponse(value: unknown, status = 200, headers = {}): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

async function withFetch(
  implementation: typeof fetch,
  operation: () => Promise<void>,
): Promise<void> {
  const original = globalThis.fetch;
  globalThis.fetch = implementation;
  try {
    await operation();
  } finally {
    globalThis.fetch = original;
  }
}

test("chat client sends server-only headers once and strips internal reply ID", async () => {
  let calls = 0;
  await withFetch(async (input, init) => {
    calls += 1;
    assert.equal(String(input), "https://aura.internal/internal/demo/chat");
    assert.equal(init?.method, "POST");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("X-BFF-Service-Token"), config.serviceToken);
    assert.equal(headers.get("X-Demo-Session-Token"), sessionToken);
    assert.deepEqual(JSON.parse(String(init?.body)), {
      message: "Halo",
      requestId,
    });
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
      handoff: null,
    });
  }, async () => {
    const result = await postAuraDemoChat(config, sessionToken, {
      message: "Halo",
      requestId,
    });
    assert.equal(calls, 1);
    assert.deepEqual(result.reply, {
      role: "assistant",
      content: "Respons aman.",
      createdAt: timestamp,
    });
    assert.equal(JSON.stringify(result).includes('"id"'), false);
  });
});

test("client classifies only exact session and conflict envelopes", async () => {
  await withFetch(async () =>
    jsonResponse(
      {
        code: "DEMO_SESSION_REQUIRED",
        detail: "Sesi demo tidak valid atau telah kedaluwarsa.",
      },
      401,
    ), async () => {
    await assert.rejects(
      () => getAuraDemoReservations(config, sessionToken),
      (error) =>
        error instanceof AuraDemoClientError &&
        error.kind === "session-required",
    );
  });

  await withFetch(async () =>
    jsonResponse(
      {
        code: "REQUEST_CONFLICT",
        detail: "Permintaan demo sedang diproses atau belum selesai.",
      },
      409,
    ), async () => {
    await assert.rejects(
      () =>
        postAuraDemoChat(config, sessionToken, {
          message: "Halo",
          requestId,
        }),
      (error) =>
        error instanceof AuraDemoClientError &&
        error.kind === "request-conflict",
    );
  });

  await withFetch(async () =>
    jsonResponse(
      {
        code: "REQUEST_CONFLICT",
        detail: "unexpected detail",
      },
      409,
    ), async () => {
    await assert.rejects(
      () =>
        postAuraDemoChat(config, sessionToken, {
          message: "Halo",
          requestId,
        }),
      (error) =>
        error instanceof AuraDemoClientError &&
        error.kind === "invalid-response",
    );
  });
});

test("rate-limit mapping forwards only validated integer headers", async () => {
  await withFetch(async () =>
    jsonResponse(
      {
        code: "RATE_LIMIT_EXCEEDED",
        detail: "Batas permintaan demo telah tercapai.",
      },
      429,
      {
        "Retry-After": "12",
        "X-RateLimit-Limit": "30",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "not-an-integer",
        "X-Internal-Debug": "never-forwarded",
      },
    ), async () => {
    await assert.rejects(
      () => getAuraDemoReservations(config, sessionToken),
      (error) => {
        assert.ok(error instanceof AuraDemoClientError);
        assert.equal(error.kind, "rate-limited");
        assert.deepEqual(error.rateLimitHeaders, {
          "Retry-After": "12",
          "X-RateLimit-Limit": "30",
          "X-RateLimit-Remaining": "0",
        });
        return true;
      },
    );
  });
});

test("one overall deadline aborts the request without retry", async () => {
  let calls = 0;
  let aborted = false;
  await withFetch((_input, init) => {
    calls += 1;
    return new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener(
        "abort",
        () => {
          aborted = true;
          reject(new DOMException("aborted", "AbortError"));
        },
        { once: true },
      );
    });
  }, async () => {
    await assert.rejects(
      () =>
        postAuraDemoChat(
          { ...config, timeoutMs: 10 },
          sessionToken,
          { message: "Halo", requestId },
        ),
      (error) =>
        error instanceof AuraDemoClientError && error.kind === "timeout",
    );
    assert.equal(calls, 1);
    assert.equal(aborted, true);
  });
});
