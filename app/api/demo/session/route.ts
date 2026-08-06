import { type NextRequest, NextResponse } from "next/server";

import {
  AuraDemoClientError,
  createAuraDemoSession,
  getCurrentAuraDemoSession,
} from "@/lib/aura-demo/client.server";
import type { AuraDemoConfig } from "@/lib/aura-demo/config.server";
import {
  deleteAuraSessionCookie,
  setAuraSessionCookie,
} from "@/lib/aura-demo/cookie.server";
import type {
  PublicCreateSessionResponse,
} from "@/lib/aura-demo/contracts";
import {
  validateGetSessionRequest,
  validatePostSessionRequest,
} from "@/lib/aura-demo/request";
import { publicError, publicJson } from "@/lib/aura-demo/response";
import {
  clientErrorResponse,
  clientErrorResponseForSession,
  clientSubjectOrError,
  cookieConfigOrError,
  cookieStoreOrError,
  upstreamConfigOrError,
} from "@/lib/aura-demo/route.server";
import { isValidAuraSessionToken } from "@/lib/aura-demo/token.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";
export const maxDuration = 60;

async function createSessionResponse(
  config: AuraDemoConfig,
  clientSubject: string,
  clearExistingCookieOnFailure: boolean,
): Promise<NextResponse> {
  try {
    const created = await createAuraDemoSession(config, clientSubject);
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

  const cookieStore = await cookieStoreOrError();
  if (cookieStore instanceof NextResponse) {
    return cookieStore;
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
  const clientSubject = clientSubjectOrError(request, config);
  if (clientSubject instanceof NextResponse) {
    return clientSubject;
  }

  if (existingCookie === undefined) {
    return createSessionResponse(config, clientSubject, false);
  }
  if (locallyInvalid) {
    return createSessionResponse(config, clientSubject, true);
  }

  try {
    const current = await getCurrentAuraDemoSession(
      config,
      existingCookie.value,
      clientSubject,
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
      return createSessionResponse(config, clientSubject, true);
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
  const clientSubject = clientSubjectOrError(request, config);
  if (clientSubject instanceof NextResponse) {
    return clientSubject;
  }

  try {
    const current = await getCurrentAuraDemoSession(
      config,
      existingCookie.value,
      clientSubject,
    );
    return publicJson(current, 200);
  } catch (error) {
    return clientErrorResponseForSession(error, config);
  }
}
