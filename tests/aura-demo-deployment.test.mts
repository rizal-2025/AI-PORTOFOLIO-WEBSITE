import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { GET as health } from "@/app/api/health/route";
import {
  AuraDemoConfigError,
  getAuraDemoConfig,
} from "@/lib/aura-demo/config.server";

const cookie = { sessionCookieName: "aura_demo_session" } as const;
const variableNames = [
  "AURA_SERVER_BASE_URL",
  "AURA_INTERNAL_BASE_URL",
  "AURA_CLIENT_SUBJECT_HMAC_KEY",
  "AURA_DEMO_SERVICE_TOKEN",
  "AURA_BFF_TIMEOUT_MS",
  "AURA_TRUSTED_INGRESS_MODE",
  "NODE_ENV",
  "VERCEL",
  "VERCEL_ENV",
] as const;

function preserveEnvironment(t: test.TestContext): void {
  const previous = new Map(variableNames.map((name) => [name, process.env[name]]));
  t.after(() => {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else Reflect.set(process.env, name, value);
    }
  });
}

function validEnvironment(): void {
  process.env.AURA_SERVER_BASE_URL = "https://aura.internal";
  delete process.env.AURA_INTERNAL_BASE_URL;
  process.env.AURA_CLIENT_SUBJECT_HMAC_KEY =
    "deployment-test-client-subject-hmac-key";
  process.env.AURA_DEMO_SERVICE_TOKEN = "deployment-test-service-token-value";
  process.env.AURA_BFF_TIMEOUT_MS = "30000";
  process.env.AURA_TRUSTED_INGRESS_MODE = "development";
}

function validVercelEnvironment(): void {
  validEnvironment();
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.AURA_TRUSTED_INGRESS_MODE = "vercel";
  process.env.VERCEL = "1";
  process.env.VERCEL_ENV = "preview";
}

test("website health response is fixed and never cached", () => {
  const response = health();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("production BFF permits only a pathless Koyeb HTTPS origin", (t) => {
  preserveEnvironment(t);
  validVercelEnvironment();
  process.env.AURA_SERVER_BASE_URL =
    "https://aura-api-example-123.koyeb.app";
  assert.equal(
    getAuraDemoConfig(cookie).baseUrl,
    "https://aura-api-example-123.koyeb.app",
  );
  for (const invalid of [
    "http://aura-api-example-123.koyeb.app",
    "https://attacker.example",
    "https://aura-api-example-123.koyeb.app:8443",
    "https://aura-api-example-123.koyeb.app/path",
    "https://aura-api-example-123.koyeb.app?debug=1",
    "https://user:password@aura-api-example-123.koyeb.app",
    "https://localhost",
    "https://127.0.0.1",
  ]) {
    process.env.AURA_SERVER_BASE_URL = invalid;
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  }
});

test("Vercel config and BFF route budgets target Frankfurt safely", () => {
  const config = JSON.parse(readFileSync("vercel.json", "utf8")) as {
    framework: string;
    regions: string[];
  };
  assert.equal(config.framework, "nextjs");
  assert.deepEqual(config.regions, ["fra1"]);
  for (const route of ["session", "chat", "reservations", "reset"]) {
    const source = readFileSync(`app/api/demo/${route}/route.ts`, "utf8");
    assert.match(source, /preferredRegion = "fra1"/);
    assert.match(source, /maxDuration = 60/);
  }
});

test("Vercel trust mode fails closed without verified runtime", (t) => {
  preserveEnvironment(t);
  validVercelEnvironment();
  process.env.AURA_SERVER_BASE_URL =
    "https://aura-api-example-123.koyeb.app";
  for (const name of ["VERCEL", "VERCEL_ENV"] as const) {
    const value = process.env[name];
    delete process.env[name];
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
    if (value !== undefined) process.env[name] = value;
  }
  process.env.VERCEL_ENV = "development";
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
});

test("legacy base URL has an unambiguous migration path", (t) => {
  preserveEnvironment(t);
  validEnvironment();
  const current = process.env.AURA_SERVER_BASE_URL;
  delete process.env.AURA_SERVER_BASE_URL;
  process.env.AURA_INTERNAL_BASE_URL = current;
  assert.equal(getAuraDemoConfig(cookie).baseUrl, "https://aura.internal");
  process.env.AURA_SERVER_BASE_URL = current;
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
});

test("service credential validation matches the hardened server boundary", (t) => {
  preserveEnvironment(t);
  validEnvironment();
  for (const invalid of [
    "short",
    "x".repeat(32),
    "CHANGE_ME_service_token_that_is_not_allowed",
    ` ${"secure-looking-token-value-for-test"}`,
    "secure-looking-token-value-for-test\n",
  ]) {
    process.env.AURA_DEMO_SERVICE_TOKEN = invalid;
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  }
});

test("client-subject HMAC key uses the same strict secret policy", (t) => {
  preserveEnvironment(t);
  validEnvironment();
  for (const invalid of [
    "short",
    "x".repeat(32),
    "CHANGE_ME_client_subject_hmac_key_value",
    ` ${"secure-client-subject-hmac-key-value"}`,
  ]) {
    process.env.AURA_CLIENT_SUBJECT_HMAC_KEY = invalid;
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  }
});
