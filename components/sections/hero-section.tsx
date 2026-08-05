import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";

export function HeroSection() {
  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <PageContainer className="grid min-h-[calc(100svh-4rem)] items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
            AI Engineer · Jakarta
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
            Saya membangun sistem AI yang dapat digunakan di dunia nyata.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Saya fokus pada AI agent, backend yang aman, dan pengalaman pengguna yang sederhana.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/projects">Lihat Proyek</ButtonLink>
            <ButtonLink href="/about" variant="secondary">Tentang Saya</ButtonLink>
          </div>
          <p className="mt-6 text-sm text-slate-500">Available for selected projects.</p>
        </div>

        <aside className="border-l border-slate-800 pl-6 sm:pl-8">
          <p className="text-sm font-medium text-slate-200">Current work</p>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            Saat ini saya sedang mengembangkan AURA, AI reservation agent dengan arsitektur backend terisolasi dan integrasi web yang aman.
          </p>
          <div className="mt-7 border-t border-slate-800 pt-5 text-sm text-cyan-200">
            AURA · web integration in progress
          </div>
        </aside>
      </PageContainer>
    </section>
  );
}
