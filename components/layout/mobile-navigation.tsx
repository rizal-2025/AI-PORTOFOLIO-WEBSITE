"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { siteConfig } from "@/config/site";

const linkStyles =
  "flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200";

export function MobileNavigation() {
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
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/50 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 lg:hidden"
        aria-controls="mobile-navigation"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span>{isMenuOpen ? "Tutup" : "Menu"}</span>
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
        className="absolute inset-x-0 top-full border-t border-slate-800 bg-slate-950 lg:hidden"
        aria-label="Navigasi mobile"
        hidden={!isMenuOpen}
      >
        <PageContainer className="grid gap-1 py-3">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={linkStyles} onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
          <Link
            href={siteConfig.primaryLink.href}
            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            onClick={closeMenu}
          >
            {siteConfig.primaryLink.label}
          </Link>
        </PageContainer>
      </nav>
    </>
  );
}
