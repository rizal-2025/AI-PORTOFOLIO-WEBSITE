import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";

export function HeroSection() {
  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <PageContainer className="grid min-w-0 min-h-[calc(100svh-4rem)] items-center gap-12 py-20 sm:py-28 lg:min-h-0 lg:pt-16 lg:pb-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
            AI Engineer · Jakarta
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
            Saya membangun sistem AI dan software yang siap digunakan.
          </h1>
          <p className="mt-6 max-w-full break-words text-base leading-8 text-slate-400 sm:max-w-2xl sm:text-lg">
            Saya menggabungkan antarmuka percakapan, logika aplikasi, API, persistence, dan pengamanan yang praktis.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/demo/aura">Coba AURA</ButtonLink>
            <ButtonLink href="/projects" variant="secondary">Lihat Proyek</ButtonLink>
          </div>
        </div>

        <aside className="min-w-0 max-w-full border-l border-slate-800 pl-6 sm:pl-8">
          <p className="text-sm font-medium text-slate-200">Proyek unggulan</p>
          <p className="mt-4 max-w-full break-words text-lg leading-8 text-slate-400">
            AURA adalah proyek AI utama saya untuk percakapan dan alur reservasi yang dapat dicoba melalui demo portofolio.
          </p>
          <div className="mt-7 border-t border-slate-800 pt-5 text-sm text-cyan-200">
            Demo self-hosted tersedia saat backend aktif.
          </div>
        </aside>
      </PageContainer>
    </section>
  );
}
