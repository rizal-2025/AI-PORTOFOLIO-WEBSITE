import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ContactCtaSection({ copy }: Readonly<{ copy: Dictionary["home"] }>) {
  return (
    <section className="border-t border-slate-800 bg-slate-900/30 py-20 sm:py-24">
      <PageContainer>
        <div className="grid gap-8 border border-slate-800 bg-slate-950 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{copy.contact}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">{copy.contactTitle}</h2>
            <p className="mt-5 text-base leading-7 text-slate-400">{copy.contactDescription}</p>
          </div>
          <ButtonLink href="/contact">{copy.contactButton}</ButtonLink>
        </div>
      </PageContainer>
    </section>
  );
}
