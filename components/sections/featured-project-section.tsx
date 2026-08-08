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
              AURA adalah flagship AI assistant untuk percakapan dan alur reservasi. Demo publiknya mendukung sesi, workflow reservasi, rate limiting, dan boundary aman antara browser dan layanan aplikasi.
            </p>
            <p className="mt-5 text-sm font-medium text-cyan-200">
              Live self-hosted demo. Availability may vary when the backend is offline.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <ButtonLink href="/demo/aura">Coba Demo Live</ButtonLink>
            <ButtonLink href="/projects/aura" variant="secondary">Lihat Case Study</ButtonLink>
          </div>
        </article>
      </PageContainer>
    </section>
  );
}
