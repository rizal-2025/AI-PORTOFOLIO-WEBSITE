import { NextResponse } from "next/server";

import { isValidAuraSessionToken } from "@/lib/aura-demo/token.server";

function cookieIsSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

export function setAuraSessionCookie(
  response: NextResponse,
  cookieName: string,
  sessionToken: string,
  absoluteExpiresAt: string,
): boolean {
  const expires = new Date(absoluteExpiresAt);
  if (
    !isValidAuraSessionToken(sessionToken) ||
    !Number.isFinite(expires.getTime()) ||
    expires.getTime() <= Date.now()
  ) {
    return false;
  }

  response.cookies.set({
    name: cookieName,
    value: sessionToken,
    httpOnly: true,
    secure: cookieIsSecure(),
    sameSite: "lax",
    path: "/",
    expires,
  });
  return true;
}

export function deleteAuraSessionCookie(
  response: NextResponse,
  cookieName: string,
): void {
  response.cookies.set({
    name: cookieName,
    value: "",
    httpOnly: true,
    secure: cookieIsSecure(),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}
