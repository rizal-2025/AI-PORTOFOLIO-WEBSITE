import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";

export function FeaturedProjectSection() {
  return (
    <section className="border-y border-slate-800 bg-slate-900/30 py-20 sm:py-24">
      <PageContainer>
        <SectionHeading eyebrow="Featured project" title="AURA" />
        <article className="mt-10 grid gap-8 border border-slate-800 bg-slate-950 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-base leading-8 text-slate-400">
              AI reservation agent yang menangani percakapan, sesi demo, reservasi, rate limiting, dan pemisahan aman antara browser dengan backend internal.
            </p>
            <p className="mt-5 text-sm font-medium text-cyan-200">Web integration in progress</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <ButtonLink href="/projects/aura">Lihat Case Study</ButtonLink>
            <div>
              <ButtonLink href="/demo/aura" variant="secondary">Lihat Status Demo</ButtonLink>
              <p className="mt-2 text-xs text-slate-500">Coming soon</p>
            </div>
          </div>
        </article>
      </PageContainer>
    </section>
  );
}
