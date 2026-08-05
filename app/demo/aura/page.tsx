import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "AURA Demo",
  description: "Status integrasi web demo AURA.",
};

export default function AuraDemoPage() {
  return (
    <section className="min-h-[calc(100svh-4rem)] bg-slate-950 py-20 sm:py-28">
      <PageContainer>
        <div className="max-w-3xl border border-slate-800 bg-slate-900/30 p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Status</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">AURA Demo</h1>
          <p className="mt-6 text-lg font-medium text-slate-200">Web demo integration is in progress.</p>
          <p className="mt-4 max-w-2xl leading-8 text-slate-400">
            Backend AURA sedang diintegrasikan melalui server-side BFF agar session token dan service credential tidak pernah dikirim ke browser.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/projects/aura">Lihat Proyek AURA</ButtonLink>
            <ButtonLink href="/architecture" variant="secondary">Lihat Architecture</ButtonLink>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
