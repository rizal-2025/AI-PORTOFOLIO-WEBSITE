import { NextResponse } from "next/server";

import type {
  PublicDemoErrorCode,
  PublicDemoErrorResponse,
  SafeRateLimitHeaders,
} from "@/lib/aura-demo/contracts";

const PUBLIC_ERRORS: Record<
  PublicDemoErrorCode,
  { message: string; status: number }
> = {
  INVALID_REQUEST: {
    status: 400,
    message: "The request is invalid.",
  },
  FORBIDDEN: {
    status: 403,
    message: "The request is not allowed.",
  },
  SESSION_REQUIRED: {
    status: 401,
    message: "Demo session is required.",
  },
  RATE_LIMITED: {
    status: 429,
    message: "Too many requests. Please try again later.",
  },
  UPSTREAM_INVALID_RESPONSE: {
    status: 502,
    message: "The demo service returned an invalid response.",
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
    message: "The demo service is unavailable.",
  },
  UPSTREAM_TIMEOUT: {
    status: 504,
    message: "The demo service timed out.",
  },
};

const RATE_LIMIT_HEADER_NAMES = [
  "Retry-After",
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
  "X-RateLimit-Reset",
] as const;

function noStoreHeaders(): Headers {
  return new Headers({
    "Cache-Control": "no-store",
  });
}

export function publicJson<T>(body: T, status: number): NextResponse<T> {
  return NextResponse.json(body, {
    status,
    headers: noStoreHeaders(),
  });
}

export function publicError(
  code: PublicDemoErrorCode,
  rateLimitHeaders: SafeRateLimitHeaders = {},
): NextResponse<PublicDemoErrorResponse> {
  const definition = PUBLIC_ERRORS[code];
  const headers = noStoreHeaders();

  if (code === "RATE_LIMITED") {
    for (const name of RATE_LIMIT_HEADER_NAMES) {
      const value = rateLimitHeaders[name];
      if (value !== undefined) {
        headers.set(name, value);
      }
    }
  }

  return NextResponse.json(
    {
      error: {
        code,
        message: definition.message,
      },
    },
    {
      status: definition.status,
      headers,
    },
  );
}
