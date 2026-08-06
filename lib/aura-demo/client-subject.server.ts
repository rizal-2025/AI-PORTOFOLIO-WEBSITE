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
      return hostname.slice(1, -1);
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

  const realIp = request.headers.get("x-real-ip");
  if (realIp === null) {
    return invalidSubject();
  }
  return opaqueSubject(
    `aura:demo-client:ip:v1:${canonicalizeClientIp(realIp)}`,
    config.clientSubjectHmacKey,
  );
}
