import { createHmac } from "node:crypto";
import { isIP } from "node:net";

import type { AuraDemoConfig } from "@/lib/aura-demo/config.server";

const DEVELOPMENT_SUBJECT = "aura:demo-client:development:v1";

export class AuraDemoClientSubjectError extends Error {
  constructor() {
    super("AURA demo client subject is unavailable.");
    this.name = "AuraDemoClientSubjectError";
  }
}

function invalidSubject(): never {
  throw new AuraDemoClientSubjectError();
}

export function canonicalizeClientIp(rawValue: string): string {
  if (
    rawValue === "" ||
    rawValue !== rawValue.trim() ||
    rawValue.includes(",") ||
    rawValue.includes("%") ||
    rawValue.startsWith("[") ||
    rawValue.endsWith("]")
  ) {
    return invalidSubject();
  }

  const version = isIP(rawValue);
  if (version === 4) {
    return rawValue
      .split(".")
      .map((part) => String(Number(part)))
      .join(".");
  }
  if (version === 6) {
    try {
      const hostname = new URL(`http://[${rawValue}]/`).hostname;
      if (!hostname.startsWith("[") || !hostname.endsWith("]")) {
        return invalidSubject();
      }
      const canonical = hostname.slice(1, -1);
      const mapped = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(
        canonical,
      );
      if (mapped !== null) {
        const high = Number.parseInt(mapped[1], 16);
        const low = Number.parseInt(mapped[2], 16);
        return [high >> 8, high & 0xff, low >> 8, low & 0xff].join(".");
      }
      return canonical;
    } catch {
      return invalidSubject();
    }
  }
  return invalidSubject();
}

function opaqueSubject(value: string, key: string): string {
  return createHmac("sha256", key).update(value, "utf8").digest("hex");
}

export function deriveAuraClientSubject(
  request: Request,
  config: AuraDemoConfig,
): string {
  if (config.trustedIngressMode === "development") {
    return opaqueSubject(DEVELOPMENT_SUBJECT, config.clientSubjectHmacKey);
  }

  const vercelClientIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelClientIp === null) {
    return invalidSubject();
  }
  return opaqueSubject(
    `aura:demo-client:ip:v1:${canonicalizeClientIp(vercelClientIp)}`,
    config.clientSubjectHmacKey,
  );
}
