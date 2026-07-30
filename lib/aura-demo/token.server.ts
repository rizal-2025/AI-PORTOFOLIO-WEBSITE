const AURA_SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43,128}$/;

export function isValidAuraSessionToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    AURA_SESSION_TOKEN_PATTERN.test(value)
  );
}
