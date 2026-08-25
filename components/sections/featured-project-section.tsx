import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function FeaturedProjectSection({ copy }: Readonly<{ copy: Dictionary["home"] }>) {
  return (
    <section className="border-y border-slate-800 bg-slate-900/30 py-20 sm:py-24">
      <PageContainer>
        <SectionHeading eyebrow={copy.featured} title="AURA" />
        <article className="mt-10 grid min-w-0 gap-8 border border-slate-800 bg-slate-950 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0 max-w-2xl">
            <p className="max-w-full break-words text-base leading-8 text-slate-400">
              {copy.projectDescription}
            </p>
            <p className="mt-5 text-sm font-medium text-cyan-200">
              {copy.availability}
            </p>
          </div>
          <div className="min-w-0 flex flex-col gap-3 sm:flex-row lg:flex-col">
            <ButtonLink href="/demo/aura" className="max-w-full">{copy.liveDemo}</ButtonLink>
            <ButtonLink href="/projects/aura" variant="secondary" className="max-w-full">{copy.caseStudy}</ButtonLink>
          </div>
        </article>
      </PageContainer>
    </section>
  );
}
