import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { GET as health } from "@/app/api/health/route";
import {
  AuraDemoConfigError,
  getAuraDemoConfig,
} from "@/lib/aura-demo/config.server";
import { resolveNextOutputMode } from "@/next.config";

const cookie = { sessionCookieName: "aura_demo_session" } as const;
const variableNames = [
  "AURA_BACKEND_MODE",
  "AURA_SERVER_BASE_URL",
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
  process.env.AURA_BACKEND_MODE = "tailscale-funnel";
  process.env.AURA_SERVER_BASE_URL = "http://127.0.0.1:8000";
  process.env.AURA_CLIENT_SUBJECT_HMAC_KEY =
    "deployment-test-client-subject-hmac-key";
  process.env.AURA_DEMO_SERVICE_TOKEN = "deployment-test-service-token-value";
  process.env.AURA_BFF_TIMEOUT_MS = "30000";
  process.env.AURA_TRUSTED_INGRESS_MODE = "development";
  Reflect.set(process.env, "NODE_ENV", "test");
}

function validVercelEnvironment(
  environment: "preview" | "production" = "preview",
): void {
  validEnvironment();
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.AURA_TRUSTED_INGRESS_MODE = "vercel";
  process.env.VERCEL = "1";
  process.env.VERCEL_ENV = environment;
  process.env.AURA_SERVER_BASE_URL =
    environment === "preview"
      ? "https://aura-demo-node.synthetic-tailnet.ts.net:8443"
      : "https://aura-demo-node.synthetic-tailnet.ts.net";
}

test("website health response is fixed and never cached", () => {
  const response = health();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("Vercel managed builds omit Docker standalone output", () => {
  assert.equal(resolveNextOutputMode("1"), undefined);
  assert.equal(resolveNextOutputMode(undefined), "standalone");
  assert.equal(resolveNextOutputMode("0"), "standalone");
});

test("production BFF permits only a pathless HTTPS Funnel origin on the profile port", (t) => {
  preserveEnvironment(t);
  validVercelEnvironment();
  assert.equal(getAuraDemoConfig(cookie).timeoutMs, 30_000);
  assert.equal(
    getAuraDemoConfig(cookie).baseUrl,
    "https://aura-demo-node.synthetic-tailnet.ts.net:8443",
  );
  for (const invalid of [
    "http://aura-demo-node.synthetic-tailnet.ts.net:8443",
    "https://aura-demo-node.synthetic-tailnet.ts.net",
    "https://aura-demo-node.synthetic-tailnet.ts.net:443",
    "https://aura-demo-node.synthetic-tailnet.ts.net:8443/path",
    "https://aura-demo-node.synthetic-tailnet.ts.net:8443?debug=1",
    "https://user:password@aura-demo-node.synthetic-tailnet.ts.net:8443",
    "https://synthetic-tailnet.ts.net:8443",
    "https://a.b.c.ts.net:8443",
    "https://example.com:8443",
    "https://localhost:8443",
    "https://127.0.0.1:8443",
  ]) {
    process.env.AURA_SERVER_BASE_URL = invalid;
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  }
  validVercelEnvironment("production");
  assert.equal(
    getAuraDemoConfig(cookie).baseUrl,
    "https://aura-demo-node.synthetic-tailnet.ts.net",
  );
  process.env.AURA_SERVER_BASE_URL =
    "https://aura-demo-node.synthetic-tailnet.ts.net:8443";
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
});

test("development backend origins are loopback-only", (t) => {
  preserveEnvironment(t);
  validEnvironment();
  assert.equal(getAuraDemoConfig(cookie).baseUrl, "http://127.0.0.1:8000");
  for (const invalid of [
    "http://aura.internal:8000",
    "http://192.0.2.1:8000",
    "http://localhost:9000",
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
  for (const name of ["VERCEL", "VERCEL_ENV"] as const) {
    const value = process.env[name];
    delete process.env[name];
    assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
    if (value !== undefined) process.env[name] = value;
  }
  process.env.VERCEL_ENV = "development";
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
});

test("backend mode and every server credential are mandatory", (t) => {
  preserveEnvironment(t);
  validEnvironment();
  delete process.env.AURA_BACKEND_MODE;
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  process.env.AURA_BACKEND_MODE = "direct";
  assert.throws(() => getAuraDemoConfig(cookie), AuraDemoConfigError);
  process.env.AURA_BACKEND_MODE = "tailscale-funnel";
  for (const name of [
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

test("superseded provider assets and legacy base URL logic are absent", () => {
  assert.equal(existsSync("docs/vercel-koyeb-deployment.md"), false);
  const source = readFileSync("lib/aura-demo/config.server.ts", "utf8");
  assert.doesNotMatch(source, /AURA_INTERNAL_BASE_URL/);
  assert.match(source, /AURA_BACKEND_MODE/);
});
