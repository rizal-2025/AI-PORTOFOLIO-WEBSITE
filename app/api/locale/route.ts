import { NextResponse } from "next/server";

import {
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite !== null && !["same-origin", "same-site", "none"].includes(fetchSite)) {
    return false;
  }
  if (origin === null) return true;
  try {
    const parsedOrigin = new URL(origin);
    const requestOrigin = new URL(request.url).origin;
    const requestHost = request.headers.get("host");
    return (
      origin === parsedOrigin.origin &&
      (parsedOrigin.origin === requestOrigin || parsedOrigin.host === requestHost)
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
  }
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")) {
    return NextResponse.json({ error: { code: "INVALID_LOCALE" } }, { status: 400 });
  }
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_LOCALE" } }, { status: 400 });
  }
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).length !== 1 ||
    !("locale" in value) ||
    !isSupportedLocale(value.locale)
  ) {
    return NextResponse.json({ error: { code: "INVALID_LOCALE" } }, { status: 400 });
  }

  const response = NextResponse.json({ locale: value.locale }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: value.locale,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 31_536_000,
  });
  return response;
}
