import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function HeroSection({ copy }: Readonly<{ copy: Dictionary["home"] }>) {
  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <PageContainer className="grid min-w-0 min-h-[calc(100svh-4rem)] items-center gap-12 py-20 sm:py-28 lg:min-h-0 lg:pt-16 lg:pb-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
            {copy.heroEyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-6 max-w-full break-words text-base leading-8 text-slate-400 sm:max-w-2xl sm:text-lg">
            {copy.heroDescription}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/demo/aura">{copy.tryAura}</ButtonLink>
            <ButtonLink href="/projects" variant="secondary">{copy.viewProjects}</ButtonLink>
          </div>
        </div>

        <aside className="min-w-0 max-w-full border-l border-slate-800 pl-6 sm:pl-8">
          <p className="text-sm font-medium text-slate-200">{copy.featured}</p>
          <p className="mt-4 max-w-full break-words text-lg leading-8 text-slate-400">
            {copy.auraSummary}
          </p>
          <div className="mt-7 border-t border-slate-800 pt-5 text-sm text-cyan-200">
            {copy.availability}
          </div>
        </aside>
      </PageContainer>
    </section>
  );
}
