import assert from "node:assert/strict";
import test from "node:test";

import {
  validateGetEmptyRequest,
  validatePostChatRequest,
  validatePostEmptyRequest,
} from "@/lib/aura-demo/request";

const requestId = "123e4567-e89b-42d3-a456-426614174000";

function chatRequest(
  body: unknown,
  headers: Record<string, string> = {},
  url = "https://portfolio.example/api/demo/chat",
): Request {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://portfolio.example",
      "sec-fetch-site": "same-origin",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("chat request accepts exact bounded body and canonicalizes newlines", async () => {
  const result = await validatePostChatRequest(
    chatRequest({ message: "satu\r\ndua", requestId }),
  );
  assert.deepEqual(result, {
    ok: true,
    value: { message: "satu\ndua", requestId },
  });
});

test("chat request rejects cross-site, internal headers, extras, and unsafe text", async () => {
  const cases = [
    chatRequest(
      { message: "aman", requestId },
      { origin: "https://attacker.example" },
    ),
    chatRequest(
      { message: "aman", requestId },
      { "x-bff-service-token": "browser-controlled" },
    ),
    chatRequest({ message: "aman", requestId, ownerId: 1 }),
    chatRequest({ message: "unsafe\u0000", requestId }),
    chatRequest({ message: "x".repeat(1001), requestId }),
    chatRequest({ message: "aman", requestId: "not-a-uuid" }),
    chatRequest(
      { message: "aman", requestId },
      {},
      "https://portfolio.example/api/demo/chat?retry=1",
    ),
  ];
  for (const request of cases) {
    const result = await validatePostChatRequest(request);
    assert.equal(result.ok, false);
  }
});

test("chat request rejects oversized, invalid UTF-8, and stalled streams", async () => {
  const oversized = chatRequest(
    { message: "aman", requestId },
    { "content-length": "8193" },
  );
  assert.equal((await validatePostChatRequest(oversized)).ok, false);

  const invalidUtf8 = new Request(
    "https://portfolio.example/api/demo/chat",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://portfolio.example",
        "sec-fetch-site": "same-origin",
      },
      body: new Uint8Array([0xff]),
    },
  );
  assert.equal((await validatePostChatRequest(invalidUtf8)).ok, false);

  let cancelled = false;
  const stalled = new ReadableStream<Uint8Array>({
    cancel() {
      cancelled = true;
    },
  });
  const stalledRequest = new Request(
    "https://portfolio.example/api/demo/chat",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://portfolio.example",
        "sec-fetch-site": "same-origin",
      },
      body: stalled,
      duplex: "half",
    } as RequestInit & { duplex: "half" },
  );
  assert.equal((await validatePostChatRequest(stalledRequest)).ok, false);
  assert.equal(cancelled, true);
});

test("empty request validators reject bodies, queries, and both internal headers", async () => {
  const emptyPost = new Request(
    "https://portfolio.example/api/demo/reset",
    {
      method: "POST",
      headers: {
        origin: "https://portfolio.example",
        "sec-fetch-site": "same-origin",
      },
    },
  );
  assert.equal(await validatePostEmptyRequest(emptyPost), null);
  assert.equal(
    await validatePostEmptyRequest(
      new Request("https://portfolio.example/api/demo/reset", {
        method: "POST",
        headers: {
          origin: "https://portfolio.example",
          "sec-fetch-site": "same-origin",
          "x-demo-session-token": "browser-controlled",
        },
      }),
    ),
    "INVALID_REQUEST",
  );
  assert.equal(
    validateGetEmptyRequest(
      new Request("https://portfolio.example/api/demo/reservations?all=1"),
    ),
    "INVALID_REQUEST",
  );
});
