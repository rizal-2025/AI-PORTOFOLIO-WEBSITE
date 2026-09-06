"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { LanguageSelector } from "@/components/i18n/language-selector";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SupportedLocale } from "@/lib/i18n/locale";

const linkStyles =
  "flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200";

export function MobileNavigation({ locale, copy, links }: Readonly<{
  locale: SupportedLocale;
  copy: Dictionary["global"];
  links: ReadonlyArray<{ href: string; label: string }>;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-violet-300/50 hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 lg:hidden"
        aria-controls="mobile-navigation"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? copy.closeMenu : copy.openMenu}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span>{isMenuOpen ? copy.close : copy.menu}</span>
        {isMenuOpen ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      <nav
        id="mobile-navigation"
        className="absolute inset-x-0 top-full border-t border-zinc-800 bg-zinc-950 lg:hidden"
        aria-label={copy.mobileNavigationLabel}
        hidden={!isMenuOpen}
      >
        <PageContainer className="grid gap-1 py-3">
          <div className="mb-2">
            <LanguageSelector locale={locale} copy={copy} onSelected={closeMenu} />
          </div>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={linkStyles} onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
          <Link
            href="/demo/aura"
            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-400 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200"
            onClick={closeMenu}
          >
            {copy.auraDemo}
          </Link>
        </PageContainer>
      </nav>
    </>
  );
}
