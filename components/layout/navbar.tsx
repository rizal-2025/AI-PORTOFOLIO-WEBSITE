import Link from "next/link";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageContainer } from "@/components/layout/page-container";
import { siteConfig } from "@/config/site";

const linkStyles =
  "rounded-md px-2.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95">
      <PageContainer className="flex min-h-16 items-center justify-between gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
          aria-label="Rizal — Home"
        >
          <span className="size-2 rounded-full bg-cyan-300" aria-hidden="true" />
          <span>Rizal</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={linkStyles}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={siteConfig.primaryLink.href}
            className="inline-flex min-h-11 items-center rounded-lg border border-cyan-300/20 bg-cyan-400 px-3 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">{siteConfig.primaryLink.label}</span>
          </Link>

          <MobileNavigation />
        </div>
      </PageContainer>
    </header>
  );
}
