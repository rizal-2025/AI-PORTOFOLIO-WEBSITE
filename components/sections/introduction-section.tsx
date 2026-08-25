import { PageContainer } from "@/components/layout/page-container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function IntroductionSection({ copy }: Readonly<{ copy: Dictionary["home"] }>) {
  return (
    <section className="bg-slate-950 py-20 sm:py-24">
      <PageContainer>
        <div className="max-w-3xl border-l border-cyan-300 pl-6 sm:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{copy.approach}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            {copy.approachTitle}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400">
            {copy.approachDescription}
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
