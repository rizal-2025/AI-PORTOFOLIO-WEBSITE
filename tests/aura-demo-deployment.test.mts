import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { GET as health } from "@/app/api/health/route";
import {
  AuraDemoConfigError,
  getAuraDemoConfig,
} from "@/lib/aura-demo/config.server";

const cookie = { sessionCookieName: "aura_demo_session" } as const;
const variableNames = [
  "AURA_SERVER_BASE_URL",
  "AURA_CF_ACCESS_CLIENT_ID",
  "AURA_CF_ACCESS_CLIENT_SECRET",
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
  process.env.AURA_CF_ACCESS_CLIENT_ID =
    "synthetic-cloudflare-client-id.access";
  process.env.AURA_CF_ACCESS_CLIENT_SECRET =
    "synthetic-cloudflare-client-secret-value";
  process.env.AURA_CLIENT_SUBJECT_HMAC_KEY =
    "deployment-test-client-subject-hmac-key";
  process.env.AURA_DEMO_SERVICE_TOKEN = "deployment-test-service-token-value";
  process.env.AURA_BFF_TIMEOUT_MS = "30000";
  process.env.AURA_TRUSTED_INGRESS_MODE = "development";
  Reflect.set(process.env, "NODE_ENV", "test");
}

function validVercelEnvironment(environment: "preview" | "production" = "preview"): void {
  validEnvironment();
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.AURA_TRUSTED_INGRESS_MODE = "vercel";
  process.env.VERCEL = "1";
  process.env.VERCEL_ENV = environment;
  process.env.AURA_SERVER_BASE_URL =
    environment === "preview"
      ? "https://aura-staging.portfolio-demo.dev"
      : "https://aura-api.portfolio-demo.dev";
}

test("website health response is fixed and never cached", () => {
  const response = health();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("production BFF permits only the matching pathless Cloudflare hostname", (t) => {
  preserveEnvironment(t);
  validVercelEnvironment();
  assert.equal(
    getAuraDemoConfig(cookie).baseUrl,
    "https://aura-staging.portfolio-demo.dev",
  );
  for (const invalid of [
    "http://aura-staging.portfolio-demo.dev",
    "https://aura-api.portfolio-demo.dev",
    "https://aura-staging.portfolio-demo.dev:8443",
    "https://aura-staging.portfolio-demo.dev/path",
    "https://aura-staging.portfolio-demo.dev?debug=1",
    "https://user:password@aura-staging.portfolio-demo.dev",
    "https://aura-staging.trycloudflare.com",
    "https://aura-staging.example.koyeb.app",
    "https://localhost",
    "https://127.0.0.1",
  ]) {
    process.env.AURA_SERVER_BASE_URL = invalid;
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  }
  validVercelEnvironment("production");
  assert.equal(
    getAuraDemoConfig(cookie).baseUrl,
    "https://aura-api.portfolio-demo.dev",
  );
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
  for (const name of ["VERCEL", "VERCEL_ENV"] as const) {
    const value = process.env[name];
    delete process.env[name];
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
    if (value !== undefined) process.env[name] = value;
  }
  process.env.VERCEL_ENV = "development";
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
});

test("every server credential is mandatory and strictly validated", (t) => {
  preserveEnvironment(t);
  validEnvironment();
  for (const name of [
    "AURA_CF_ACCESS_CLIENT_ID",
    "AURA_CF_ACCESS_CLIENT_SECRET",
    "AURA_DEMO_SERVICE_TOKEN",
    "AURA_CLIENT_SUBJECT_HMAC_KEY",
  ] as const) {
    const valid = process.env[name];
    for (const invalid of [undefined, "short", "x".repeat(32), "CHANGE_ME_secret_value"]) {
      if (invalid === undefined) delete process.env[name];
      else process.env[name] = invalid;
      assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
    }
    if (valid !== undefined) process.env[name] = valid;
  }
});

test("superseded Koyeb deployment assets are absent", () => {
  assert.equal(existsSync("docs/vercel-koyeb-deployment.md"), false);
  const source = readFileSync("lib/aura-demo/config.server.ts", "utf8");
  assert.doesNotMatch(source, /KOYEB_HOST_PATTERN/);
  assert.doesNotMatch(source, /AURA_INTERNAL_BASE_URL/);
});
