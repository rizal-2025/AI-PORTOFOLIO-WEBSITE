import Link from "next/link";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { PageContainer } from "@/components/layout/page-container";
import { siteConfig } from "@/config/site";

const linkStyles =
  "rounded-md px-2.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#050a13]/90 backdrop-blur-xl">
      <PageContainer className="flex min-h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 rounded-md font-semibold tracking-tight text-slate-50"
          aria-label="AI Engineer Portfolio — Home"
        >
          <span
            className="grid size-8 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-xs font-bold text-cyan-300"
            aria-hidden="true"
          >
            AI
          </span>
          <span className="hidden sm:inline">{siteConfig.shortName}</span>
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
            className="inline-flex min-h-11 items-center rounded-lg border border-cyan-300/20 bg-cyan-400 px-3 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-300 sm:px-4 sm:py-2.5 sm:text-sm"
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
