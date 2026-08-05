import type { Metadata } from "next";
import { AuraDemoConsole } from "@/components/demo/aura-demo-console";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "AURA Demo",
  description: "Coba percakapan dan alur reservasi AURA melalui BFF yang aman.",
};

export default function AuraDemoPage() {
  return (
    <section className="min-h-[calc(100svh-4rem)] bg-slate-950 py-12 sm:py-16">
      <PageContainer>
        <header className="mb-10 max-w-3xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Interactive case study
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            AURA Demo
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Uji percakapan dan alur reservasi dalam sesi sementara. Semua akses backend melewati BFF; kredensial layanan dan token sesi tidak pernah tersedia bagi browser.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Gunakan data contoh saja. Demo ini tidak menghubungi operator manusia atau membuat reservasi nyata.
          </p>
        </header>
        <AuraDemoConsole />
      </PageContainer>
    </section>
  );
}
