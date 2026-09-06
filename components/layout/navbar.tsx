import Link from "next/link";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageContainer } from "@/components/layout/page-container";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SupportedLocale } from "@/lib/i18n/locale";

const linkStyles =
  "rounded-md px-2.5 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200";

export function Navbar({ locale, copy }: Readonly<{ locale: SupportedLocale; copy: Dictionary["global"] }>) {
  const links = [
    { href: "/", label: copy.nav.home },
    { href: "/projects", label: copy.nav.projects },
    { href: "/architecture", label: copy.nav.architecture },
    { href: "/about", label: copy.nav.about },
    { href: "/contact", label: copy.nav.contact },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95">
      <PageContainer className="flex min-h-16 items-center justify-between gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200"
          aria-label={copy.homeAria}
        >
          <span className="size-2 rounded-full bg-violet-300" aria-hidden="true" />
          <span>Rizal</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={copy.navigationLabel}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={linkStyles}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <LanguageSelector locale={locale} copy={copy} />
          </div>
          <Link
            href={siteConfig.primaryLink.href}
            className="inline-flex min-h-11 items-center rounded-lg border border-violet-300/20 bg-violet-400 px-3 text-xs font-semibold text-zinc-950 transition-colors hover:bg-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">{copy.auraDemo}</span>
          </Link>

          <MobileNavigation locale={locale} copy={copy} links={links} />
        </div>
      </PageContainer>
    </header>
  );
}
