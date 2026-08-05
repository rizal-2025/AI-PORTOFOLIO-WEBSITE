import { PageContainer } from "@/components/layout/page-container";

export function IntroductionSection() {
  return (
    <section className="bg-slate-950 py-20 sm:py-24">
      <PageContainer>
        <div className="max-w-3xl border-l border-cyan-300 pl-6 sm:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Approach</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Membangun AI yang berguna, bukan sekadar demo.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400">
            Saya merancang solusi secara bertahap: memahami alur kerja, menjaga batas keamanan, lalu menyederhanakan pengalaman untuk pengguna.
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
