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
  "AURA_INTERNAL_BASE_URL",
  "AURA_CLIENT_SUBJECT_HMAC_KEY",
  "AURA_DEMO_SERVICE_TOKEN",
  "AURA_BFF_TIMEOUT_MS",
  "AURA_TRUSTED_INGRESS_MODE",
  "AURA_RAILWAY_IP_HEADER_VERIFIED",
  "NODE_ENV",
  "RAILWAY_ENVIRONMENT_ID",
  "RAILWAY_SERVICE_ID",
  "RAILWAY_SERVICE_NAME",
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
  process.env.AURA_INTERNAL_BASE_URL = "https://aura.internal";
  process.env.AURA_CLIENT_SUBJECT_HMAC_KEY =
    "deployment-test-client-subject-hmac-key";
  process.env.AURA_DEMO_SERVICE_TOKEN = "deployment-test-service-token-value";
  process.env.AURA_BFF_TIMEOUT_MS = "30000";
  process.env.AURA_TRUSTED_INGRESS_MODE = "development";
}

function validRailwayEnvironment(): void {
  validEnvironment();
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.AURA_TRUSTED_INGRESS_MODE = "railway";
  process.env.AURA_RAILWAY_IP_HEADER_VERIFIED = "true";
  process.env.RAILWAY_ENVIRONMENT_ID =
    "123e4567-e89b-42d3-a456-426614174000";
  process.env.RAILWAY_SERVICE_ID =
    "123e4567-e89b-42d3-a456-426614174001";
  process.env.RAILWAY_SERVICE_NAME = "portfolio-web";
}

test("website health response is fixed and never cached", () => {
  const response = health();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("production BFF permits only exact Railway private HTTP", (t) => {
  preserveEnvironment(t);
  validRailwayEnvironment();
  process.env.AURA_INTERNAL_BASE_URL = "http://aura.internal";
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  process.env.AURA_INTERNAL_BASE_URL = "http://aura-api.railway.internal:8000";
  assert.equal(
    getAuraDemoConfig(cookie).baseUrl,
    "http://aura-api.railway.internal:8000",
  );
  for (const invalid of [
    "http://railway.internal:8000",
    "http://aura-api.railway.internal",
    "http://aura-api.railway.internal:8000/path",
    "http://other.railway.internal:8000",
    "http://attacker.example:8000",
  ]) {
    process.env.AURA_INTERNAL_BASE_URL = invalid;
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  }
});

test("Railway web config is single-replica, health-checked, and migration-free", () => {
  const configText = readFileSync(
    "deploy/railway/portfolio-web.toml",
    "utf8",
  );
  assert.match(configText, /builder = "DOCKERFILE"/);
  assert.match(configText, /startCommand = "node server\.js"/);
  assert.match(configText, /numReplicas = 1/);
  assert.match(configText, /healthcheckPath = "\/api\/health"/);
  assert.doesNotMatch(configText, /migrat/i);

  const dockerfile = readFileSync("Dockerfile", "utf8");
  assert.match(dockerfile, /HOSTNAME=::/);
  assert.match(dockerfile, /process\.env\.PORT/);
});

test("Railway trust mode fails closed without verified runtime", (t) => {
  preserveEnvironment(t);
  validRailwayEnvironment();
  process.env.AURA_INTERNAL_BASE_URL = "http://aura-api.railway.internal:8000";
  for (const name of [
    "AURA_RAILWAY_IP_HEADER_VERIFIED",
    "RAILWAY_ENVIRONMENT_ID",
    "RAILWAY_SERVICE_ID",
    "RAILWAY_SERVICE_NAME",
  ] as const) {
    const value = process.env[name];
    delete process.env[name];
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
    if (value !== undefined) process.env[name] = value;
  }
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
