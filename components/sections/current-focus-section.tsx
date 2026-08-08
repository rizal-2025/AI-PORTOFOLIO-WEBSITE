import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";

const focusAreas = ["AI Agent Systems", "Secure Backend Integration", "Incremental Product Development"];

export function CurrentFocusSection() {
  return (
    <section className="bg-slate-950 py-20 sm:py-24">
      <PageContainer>
        <SectionHeading eyebrow="Fokus saat ini" title="Yang sedang saya kembangkan." />
        <div className="mt-10 grid gap-px overflow-hidden border border-slate-800 bg-slate-800 sm:grid-cols-3">
          {focusAreas.map((focus, index) => (
            <article key={focus} className="bg-slate-950 p-6 sm:p-7">
              <p className="text-xs font-semibold text-cyan-300">0{index + 1}</p>
              <h3 className="mt-8 text-lg font-semibold text-white">{focus}</h3>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
