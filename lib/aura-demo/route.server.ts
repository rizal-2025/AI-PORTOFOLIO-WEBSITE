import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AuraDemoClientError } from "@/lib/aura-demo/client.server";
import {
  AuraDemoConfigError,
  getAuraDemoCookieConfig,
  getAuraDemoConfig,
  type AuraDemoConfig,
  type AuraDemoCookieConfig,
} from "@/lib/aura-demo/config.server";
import type { PublicDemoErrorCode } from "@/lib/aura-demo/contracts";
import { deleteAuraSessionCookie } from "@/lib/aura-demo/cookie.server";
import { publicError } from "@/lib/aura-demo/response";
import { isValidAuraSessionToken } from "@/lib/aura-demo/token.server";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export type AuraDemoSessionContext = Readonly<{
  config: AuraDemoConfig;
  sessionToken: string;
}>;

export function clientErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuraDemoClientError) {
    const errorCodes: Record<
      Exclude<typeof error.kind, "session-required">,
      PublicDemoErrorCode
    > = {
      "invalid-response": "UPSTREAM_INVALID_RESPONSE",
      "rate-limited": "RATE_LIMITED",
      "request-conflict": "REQUEST_CONFLICT",
      timeout: "UPSTREAM_TIMEOUT",
      unavailable: "SERVICE_UNAVAILABLE",
    };
    if (error.kind === "session-required") {
      return publicError("SESSION_REQUIRED");
    }
    return publicError(errorCodes[error.kind], error.rateLimitHeaders);
  }
  return publicError("SERVICE_UNAVAILABLE");
}

export function cookieConfigOrError(): AuraDemoCookieConfig | NextResponse {
  try {
    return getAuraDemoCookieConfig();
  } catch {
    return publicError("SERVICE_UNAVAILABLE");
  }
}

export function upstreamConfigOrError(
  cookieConfig: AuraDemoCookieConfig,
): AuraDemoConfig | NextResponse {
  try {
    return getAuraDemoConfig(cookieConfig);
  } catch (error) {
    if (error instanceof AuraDemoConfigError) {
      return publicError("SERVICE_UNAVAILABLE");
    }
    return publicError("SERVICE_UNAVAILABLE");
  }
}

export async function cookieStoreOrError(): Promise<
  CookieStore | NextResponse
> {
  try {
    return await cookies();
  } catch {
    return publicError("SERVICE_UNAVAILABLE");
  }
}

export function clientErrorResponseForSession(
  error: unknown,
  config: AuraDemoConfig,
): NextResponse {
  const response = clientErrorResponse(error);
  if (
    error instanceof AuraDemoClientError &&
    error.kind === "session-required"
  ) {
    deleteAuraSessionCookie(response, config.sessionCookieName);
  }
  return response;
}

export async function requireAuraDemoSession(): Promise<
  AuraDemoSessionContext | NextResponse
> {
  const cookieConfig = cookieConfigOrError();
  if (cookieConfig instanceof NextResponse) {
    return cookieConfig;
  }
  const cookieStore = await cookieStoreOrError();
  if (cookieStore instanceof NextResponse) {
    return cookieStore;
  }
  const existingCookie = cookieStore.get(cookieConfig.sessionCookieName);
  if (existingCookie === undefined) {
    return publicError("SESSION_REQUIRED");
  }
  if (!isValidAuraSessionToken(existingCookie.value)) {
    const response = publicError("SESSION_REQUIRED");
    deleteAuraSessionCookie(response, cookieConfig.sessionCookieName);
    return response;
  }
  const config = upstreamConfigOrError(cookieConfig);
  if (config instanceof NextResponse) {
    return config;
  }
  return {
    config,
    sessionToken: existingCookie.value,
  };
}
