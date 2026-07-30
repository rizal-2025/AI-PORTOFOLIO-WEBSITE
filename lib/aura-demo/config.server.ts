export type AuraDemoConfig = Readonly<{
  baseUrl: string;
  serviceToken: string;
  sessionCookieName: string;
  timeoutMs: number;
}>;

export type AuraDemoCookieConfig = Readonly<{
  sessionCookieName: string;
}>;

const COOKIE_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const TIMEOUT_PATTERN = /^(?:0|[1-9]\d*)$/;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 30_000;

export class AuraDemoConfigError extends Error {
  constructor() {
    super("AURA demo configuration is unavailable.");
    this.name = "AuraDemoConfigError";
  }
}

function invalidConfig(): never {
  throw new AuraDemoConfigError();
}

function parseBaseUrl(rawValue: string | undefined): string {
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

  return parsed.origin;
}

function parseServiceToken(rawValue: string | undefined): string {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    return invalidConfig();
  }
  return rawValue.trim();
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
  return Object.freeze({
    baseUrl: parseBaseUrl(process.env.AURA_INTERNAL_BASE_URL),
    serviceToken: parseServiceToken(process.env.AURA_DEMO_SERVICE_TOKEN),
    sessionCookieName: cookieConfig.sessionCookieName,
    timeoutMs: parseTimeout(process.env.AURA_BFF_TIMEOUT_MS),
  });
}
