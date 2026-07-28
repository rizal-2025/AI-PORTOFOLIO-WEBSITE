import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";

export function ContactCtaSection() {
  return (
    <section className="bg-[#080e19] py-20 sm:py-28">
      <PageContainer>
        <div className="relative isolate overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-900 px-7 py-12 text-white shadow-2xl shadow-black/20 sm:px-12 sm:py-16 lg:px-16">
          <div
            className="absolute -right-24 -top-40 -z-10 size-[30rem] rounded-full border-[76px] border-cyan-300/10"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-[-10rem] left-1/3 -z-10 size-80 rounded-full bg-blue-600/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Mari berkolaborasi
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
              Punya proses bisnis yang ingin diotomatisasi?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Mari petakan alur yang berulang, hambatan operasional, dan peluang
              membangun AI Agent yang benar-benar membantu tim Anda.
            </p>
            </div>
            <div className="lg:pb-1">
              <ButtonLink href="/contact" variant="light">
                Diskusikan kebutuhan <span className="ml-2" aria-hidden="true">→</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
