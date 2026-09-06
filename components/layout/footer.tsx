import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Footer({ copy }: Readonly<{ copy: Dictionary["global"] }>) {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <PageContainer className="grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-semibold text-zinc-100">Rizal · AI Engineer</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Jakarta · Indonesia</p>
        </div>
        <div className="sm:text-right">
          <Link href="/contact" className="text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200">
            {copy.startConversation} <span aria-hidden="true">→</span>
          </Link>
          {siteConfig.contact.email ? (
            <a href={`mailto:${siteConfig.contact.email}`} className="mt-3 inline-flex break-all text-xs text-zinc-500 transition-colors hover:text-violet-200">
              {siteConfig.contact.email}
            </a>
          ) : null}
          <p className="mt-3 text-xs text-zinc-600">© {new Date().getFullYear()} · Rizal</p>
        </div>
      </PageContainer>
    </footer>
  );
}
