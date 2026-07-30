import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import {
  AuraDemoClientError,
  createAuraDemoSession,
  getCurrentAuraDemoSession,
} from "@/lib/aura-demo/client.server";
import {
  AuraDemoConfigError,
  getAuraDemoCookieConfig,
  getAuraDemoConfig,
  type AuraDemoConfig,
  type AuraDemoCookieConfig,
} from "@/lib/aura-demo/config.server";
import {
  deleteAuraSessionCookie,
  setAuraSessionCookie,
} from "@/lib/aura-demo/cookie.server";
import type {
  PublicCreateSessionResponse,
  PublicDemoErrorCode,
} from "@/lib/aura-demo/contracts";
import {
  validateGetSessionRequest,
  validatePostSessionRequest,
} from "@/lib/aura-demo/request";
import { publicError, publicJson } from "@/lib/aura-demo/response";
import { isValidAuraSessionToken } from "@/lib/aura-demo/token.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuraDemoClientError) {
    const errorCodes: Record<
      Exclude<typeof error.kind, "session-required">,
      PublicDemoErrorCode
    > = {
      "invalid-response": "UPSTREAM_INVALID_RESPONSE",
      "rate-limited": "RATE_LIMITED",
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

function cookieConfigOrError(): AuraDemoCookieConfig | NextResponse {
  try {
    return getAuraDemoCookieConfig();
  } catch {
    return publicError("SERVICE_UNAVAILABLE");
  }
}

function upstreamConfigOrError(
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

async function createSessionResponse(
  config: AuraDemoConfig,
  clearExistingCookieOnFailure: boolean,
): Promise<NextResponse> {
  try {
    const created = await createAuraDemoSession(config);
    const body: PublicCreateSessionResponse = {
      session: created.session,
    };
    const response = publicJson(body, 201);

    if (
      !setAuraSessionCookie(
        response,
        config.sessionCookieName,
        created.sessionToken,
        created.session.absoluteExpiresAt,
      )
    ) {
      const invalidResponse = publicError("UPSTREAM_INVALID_RESPONSE");
      if (clearExistingCookieOnFailure) {
        deleteAuraSessionCookie(
          invalidResponse,
          config.sessionCookieName,
        );
      }
      return invalidResponse;
    }
    return response;
  } catch (error) {
    const response = clientErrorResponse(error);
    if (clearExistingCookieOnFailure) {
      deleteAuraSessionCookie(response, config.sessionCookieName);
    }
    return response;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestError = await validatePostSessionRequest(request);
  if (requestError !== null) {
    return publicError(requestError);
  }

  const cookieConfig = cookieConfigOrError();
  if (cookieConfig instanceof NextResponse) {
    return cookieConfig;
  }

  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    return publicError("SERVICE_UNAVAILABLE");
  }

  const existingCookie = cookieStore.get(cookieConfig.sessionCookieName);
  const locallyInvalid =
    existingCookie !== undefined &&
    !isValidAuraSessionToken(existingCookie.value);
  const config = upstreamConfigOrError(cookieConfig);
  if (config instanceof NextResponse) {
    if (locallyInvalid) {
      deleteAuraSessionCookie(
        config,
        cookieConfig.sessionCookieName,
      );
    }
    return config;
  }

  if (existingCookie === undefined) {
    return createSessionResponse(config, false);
  }
  if (locallyInvalid) {
    return createSessionResponse(config, true);
  }

  try {
    const current = await getCurrentAuraDemoSession(
      config,
      existingCookie.value,
    );
    const body: PublicCreateSessionResponse = {
      session: current.session,
    };
    return publicJson(body, 200);
  } catch (error) {
    if (
      error instanceof AuraDemoClientError &&
      error.kind === "session-required"
    ) {
      return createSessionResponse(config, true);
    }
    return clientErrorResponse(error);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestError = validateGetSessionRequest(request);
  if (requestError !== null) {
    return publicError(requestError);
  }

  const cookieConfig = cookieConfigOrError();
  if (cookieConfig instanceof NextResponse) {
    return cookieConfig;
  }

  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    return publicError("SERVICE_UNAVAILABLE");
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

  try {
    const current = await getCurrentAuraDemoSession(
      config,
      existingCookie.value,
    );
    return publicJson(current, 200);
  } catch (error) {
    if (
      error instanceof AuraDemoClientError &&
      error.kind === "session-required"
    ) {
      const response = publicError("SESSION_REQUIRED");
      deleteAuraSessionCookie(response, config.sessionCookieName);
      return response;
    }
    return clientErrorResponse(error);
  }
}
