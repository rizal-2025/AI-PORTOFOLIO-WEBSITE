import type { SupportedLocale } from "@/lib/i18n/locale";

type LocalizedShape<T> = T extends string
  ? string
  : T extends number | boolean | null | undefined
    ? T
    : T extends readonly unknown[]
      ? { readonly [K in keyof T]: LocalizedShape<T[K]> }
      : T extends object
        ? { readonly [K in keyof T]: LocalizedShape<T[K]> }
        : never;

/**
 * Keeps both presentation languages on one statically checked semantic shape.
 * Arrays are treated as tuples so a locale cannot silently omit a section,
 * card, status, or other ordered content record.
 */
export function defineLocalizedContent<const T>(content: {
  readonly "id-ID": T;
  readonly "en-US": LocalizedShape<T>;
}) {
  return content;
}

export function selectLocalizedContent<
  const T extends Record<SupportedLocale, unknown>,
>(content: T, locale: SupportedLocale): T[SupportedLocale] {
  return content[locale];
}
