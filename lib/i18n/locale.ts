export const SUPPORTED_LOCALES = ["id-ID", "en-US"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "id-ID";
export const LOCALE_COOKIE_NAME = "aura_locale";

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === "id-ID" || value === "en-US";
}

export function resolveLocale(value: unknown): SupportedLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function htmlLanguage(locale: SupportedLocale): "id" | "en" {
  return locale === "en-US" ? "en" : "id";
}
