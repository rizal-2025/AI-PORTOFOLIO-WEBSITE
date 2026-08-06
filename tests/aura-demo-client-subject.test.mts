import assert from "node:assert/strict";
import test from "node:test";

import {
  AuraDemoClientSubjectError,
  canonicalizeClientIp,
  deriveAuraClientSubject,
} from "@/lib/aura-demo/client-subject.server";

const baseConfig = {
  baseUrl: "https://aura.internal",
  cfAccessClientId: "synthetic-cloudflare-client-id.access",
  cfAccessClientSecret: "synthetic-cloudflare-client-secret",
  clientSubjectHmacKey: "synthetic-client-subject-hmac-key-for-tests",
  serviceToken: "synthetic-service-token-for-tests",
  sessionCookieName: "aura_demo",
  timeoutMs: 5_000,
} as const;

function request(headers: Record<string, string>): Request {
  return new Request("https://portfolio.example/api/demo/session", { headers });
}

test("IPv4 and IPv6 inputs are canonicalized exactly", () => {
  assert.equal(canonicalizeClientIp("203.0.113.7"), "203.0.113.7");
  assert.equal(
    canonicalizeClientIp("2001:0db8:0:0:0:0:0:1"),
    "2001:db8::1",
  );
  assert.equal(
    canonicalizeClientIp("::ffff:192.0.2.1"),
    "192.0.2.1",
  );
  assert.equal(canonicalizeClientIp("::ffff:c000:201"), "192.0.2.1");
});

test("Vercel subject HMAC is stable, opaque, and ignores spoofable headers", () => {
  const config = { ...baseConfig, trustedIngressMode: "vercel" } as const;
  const first = deriveAuraClientSubject(
    request({
      "x-vercel-forwarded-for": "2001:db8::1",
      "x-forwarded-for": "198.51.100.9",
      "x-real-ip": "198.51.100.10",
    }),
    config,
  );
  const canonicalEquivalent = deriveAuraClientSubject(
    request({
      "x-vercel-forwarded-for": "2001:0db8:0:0:0:0:0:1",
      "x-forwarded-for": "192.0.2.44, 192.0.2.45",
    }),
    config,
  );
  const different = deriveAuraClientSubject(
    request({ "x-vercel-forwarded-for": "2001:db8::2" }),
    config,
  );
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first, canonicalEquivalent);
  assert.notEqual(first, different);
  assert.equal(first.includes("2001:db8"), false);
});

test("development mode ignores every browser forwarding header", () => {
  const config = { ...baseConfig, trustedIngressMode: "development" } as const;
  const plain = deriveAuraClientSubject(request({}), config);
  const spoofed = deriveAuraClientSubject(
    request({
      "x-real-ip": "203.0.113.250",
      "x-forwarded-for": "198.51.100.1",
      "x-vercel-forwarded-for": "192.0.2.1",
    }),
    config,
  );
  assert.equal(plain, spoofed);
  assert.match(plain, /^[0-9a-f]{64}$/);
});

test("missing, chained, wrapped, zoned, and malformed Vercel IPs fail closed", () => {
  const config = { ...baseConfig, trustedIngressMode: "vercel" } as const;
  const invalidHeaders: Record<string, string>[] = [
    {},
    { "x-vercel-forwarded-for": "203.0.113.7, 198.51.100.2" },
    { "x-vercel-forwarded-for": "[2001:db8::1]" },
    { "x-vercel-forwarded-for": "fe80::1%eth0" },
    { "x-vercel-forwarded-for": "not-an-address" },
  ];
  for (const headers of invalidHeaders) {
    assert.throws(
      () => deriveAuraClientSubject(request(headers), config),
      AuraDemoClientSubjectError,
    );
  }
});
