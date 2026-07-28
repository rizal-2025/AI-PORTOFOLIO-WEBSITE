import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#050a13]">
      <PageContainer className="grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-semibold text-slate-100">
            {siteConfig.owner.name} · {siteConfig.owner.role}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Membangun AI Agent yang menjembatani kebutuhan operasional dengan
            implementasi teknis yang terukur.
          </p>
        </div>
        <div className="sm:text-right">
          <Link
            href="/contact"
            className="text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Mulai percakapan <span aria-hidden="true">↗</span>
          </Link>
          {siteConfig.contact.email ? (
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="mt-3 inline-flex break-all text-xs text-slate-500 transition-colors hover:text-cyan-200"
            >
              {siteConfig.contact.email}
            </a>
          ) : null}
          <p className="mt-3 text-xs text-slate-600">
            © {new Date().getFullYear()} · {siteConfig.owner.name}
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
