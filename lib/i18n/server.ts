import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  resolveLocale,
  type SupportedLocale,
} from "@/lib/i18n/locale";

export async function getServerLocale(): Promise<SupportedLocale> {
  try {
    return resolveLocale((await cookies()).get(LOCALE_COOKIE_NAME)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getRequestLocale(request: Request): SupportedLocale {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader === null) return DEFAULT_LOCALE;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() !== LOCALE_COOKIE_NAME) continue;
    try {
      return resolveLocale(decodeURIComponent(part.slice(separator + 1).trim()));
    } catch {
      return DEFAULT_LOCALE;
    }
  }
  return DEFAULT_LOCALE;
}
