export type AuraDemoConfig = Readonly<{
  backendMode: "tailscale-funnel";
  baseUrl: string;
  clientSubjectHmacKey: string;
  serviceToken: string;
  sessionCookieName: string;
  timeoutMs: number;
  trustedIngressMode: "development" | "vercel";
}>;

export type AuraDemoCookieConfig = Readonly<{
  sessionCookieName: string;
}>;

const COOKIE_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const TIMEOUT_PATTERN = /^(?:0|[1-9]\d*)$/;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 30_000;
const MIN_SERVICE_TOKEN_LENGTH = 32;
const MAX_SERVICE_TOKEN_LENGTH = 512;
const TAILSCALE_FUNNEL_HOST_PATTERN =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.ts\.net$/;
const CONTROL_CHARACTER_PATTERN = /\p{C}/u;
const SERVICE_TOKEN_PLACEHOLDER_PATTERNS = [
  /CHANGE[_-]?ME/i,
  /YOUR[_-]?(?:SECRET|TOKEN|KEY)/i,
  /REPLACE[_-]?(?:WITH|ME)/i,
  /EXAMPLE/i,
  /PLACEHOLDER/i,
  /DUMMY/i,
] as const;

export class AuraDemoConfigError extends Error {
  constructor() {
    super("AURA demo configuration is unavailable.");
    this.name = "AuraDemoConfigError";
  }
}

function invalidConfig(): never {
  throw new AuraDemoConfigError();
}

function parseTrustedIngressMode(
  rawValue: string | undefined,
): "development" | "vercel" {
  if (rawValue === "development" && process.env.NODE_ENV !== "production") {
    return rawValue;
  }
  if (
    rawValue === "vercel" &&
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL === "1" &&
    (process.env.VERCEL_ENV === "preview" ||
      process.env.VERCEL_ENV === "production")
  ) {
    return rawValue;
  }
  return invalidConfig();
}

function parseBaseUrl(
  rawValue: string | undefined,
  trustedIngressMode: "development" | "vercel",
): string {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    return invalidConfig();
  }

  let parsed: URL;
  try {
    parsed = new URL(rawValue.trim());
  } catch {
    return invalidConfig();
  }

  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    parsed.pathname !== "/"
  ) {
    return invalidConfig();
  }
  if (process.env.NODE_ENV === "production") {
    const expectedPort = process.env.VERCEL_ENV === "preview" ? "8443" : "";
    if (
      trustedIngressMode !== "vercel" ||
      parsed.protocol !== "https:" ||
      parsed.port !== expectedPort ||
      !TAILSCALE_FUNNEL_HOST_PATTERN.test(parsed.hostname)
    ) {
      return invalidConfig();
    }
  } else if (
    !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname) ||
    !["", "8000", "8001"].includes(parsed.port)
  ) {
    return invalidConfig();
  }

  return parsed.origin;
}

function isTriviallyRepeated(value: string): boolean {
  for (let unitLength = 1; unitLength <= value.length / 2; unitLength += 1) {
    if (value.length % unitLength !== 0) continue;
    const unit = value.slice(0, unitLength);
    if (unit.repeat(value.length / unitLength) === value) return true;
  }
  return false;
}

function parseServiceToken(rawValue: string | undefined): string {
  if (
    typeof rawValue !== "string" ||
    rawValue.length < MIN_SERVICE_TOKEN_LENGTH ||
    rawValue.length > MAX_SERVICE_TOKEN_LENGTH ||
    rawValue !== rawValue.trim() ||
    CONTROL_CHARACTER_PATTERN.test(rawValue) ||
    SERVICE_TOKEN_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(rawValue)) ||
    isTriviallyRepeated(rawValue)
  ) {
    return invalidConfig();
  }
  return rawValue;
}

function parseCookieName(rawValue: string | undefined): string {
  if (
    typeof rawValue !== "string" ||
    rawValue === "" ||
    !COOKIE_NAME_PATTERN.test(rawValue)
  ) {
    return invalidConfig();
  }
  return rawValue;
}

function parseTimeout(rawValue: string | undefined): number {
  if (typeof rawValue !== "string" || !TIMEOUT_PATTERN.test(rawValue)) {
    return invalidConfig();
  }

  const timeoutMs = Number(rawValue);
  if (
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs < MIN_TIMEOUT_MS ||
    timeoutMs > MAX_TIMEOUT_MS
  ) {
    return invalidConfig();
  }
  return timeoutMs;
}

export function getAuraDemoCookieConfig(): AuraDemoCookieConfig {
  return Object.freeze({
    sessionCookieName: parseCookieName(
      process.env.AURA_DEMO_SESSION_COOKIE,
    ),
  });
}

export function getAuraDemoConfig(
  cookieConfig: AuraDemoCookieConfig,
): AuraDemoConfig {
  const trustedIngressMode = parseTrustedIngressMode(
    process.env.AURA_TRUSTED_INGRESS_MODE,
  );
  if (process.env.AURA_BACKEND_MODE !== "tailscale-funnel") {
    return invalidConfig();
  }
  return Object.freeze({
    backendMode: "tailscale-funnel",
    baseUrl: parseBaseUrl(
      process.env.AURA_SERVER_BASE_URL,
      trustedIngressMode,
    ),
    clientSubjectHmacKey: parseServiceToken(
      process.env.AURA_CLIENT_SUBJECT_HMAC_KEY,
    ),
    serviceToken: parseServiceToken(process.env.AURA_DEMO_SERVICE_TOKEN),
    sessionCookieName: cookieConfig.sessionCookieName,
    timeoutMs: parseTimeout(process.env.AURA_BFF_TIMEOUT_MS),
    trustedIngressMode,
  });
}
