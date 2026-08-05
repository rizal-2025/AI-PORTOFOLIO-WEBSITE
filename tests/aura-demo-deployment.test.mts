import assert from "node:assert/strict";
import test from "node:test";

import { GET as health } from "@/app/api/health/route";
import {
  AuraDemoConfigError,
  getAuraDemoConfig,
} from "@/lib/aura-demo/config.server";

const cookie = { sessionCookieName: "aura_demo_session" } as const;
const variableNames = [
  "AURA_INTERNAL_BASE_URL",
  "AURA_DEMO_SERVICE_TOKEN",
  "AURA_BFF_TIMEOUT_MS",
  "NODE_ENV",
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
  process.env.AURA_DEMO_SERVICE_TOKEN = "deployment-test-service-token-value";
  process.env.AURA_BFF_TIMEOUT_MS = "30000";
}

test("website health response is fixed and never cached", () => {
  const response = health();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("production BFF configuration requires HTTPS", (t) => {
  preserveEnvironment(t);
  validEnvironment();
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.AURA_INTERNAL_BASE_URL = "http://aura.internal";
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  process.env.AURA_INTERNAL_BASE_URL = "https://aura.internal";
  assert.equal(getAuraDemoConfig(cookie).baseUrl, "https://aura.internal");
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
