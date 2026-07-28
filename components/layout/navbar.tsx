import Link from "next/link";
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
            className="hidden rounded-lg border border-cyan-300/20 bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 sm:inline-flex"
          >
            {siteConfig.primaryLink.label}
          </Link>

          <details className="relative lg:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 marker:content-none">
              Menu
              <span aria-hidden="true">⌄</span>
            </summary>
            <nav
              className="absolute right-0 top-12 grid w-64 gap-1 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-black/40"
              aria-label="Navigasi mobile"
            >
              {siteConfig.navigation.map((item) => (
                <Link key={item.href} href={item.href} className={linkStyles}>
                  {item.label}
                </Link>
              ))}
              <Link
                href={siteConfig.primaryLink.href}
                className="mt-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-center text-sm font-semibold text-slate-950"
              >
                {siteConfig.primaryLink.label}
              </Link>
            </nav>
          </details>
        </div>
      </PageContainer>
    </header>
  );
}
