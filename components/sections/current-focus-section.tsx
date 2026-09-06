import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CurrentFocusSection({ copy }: Readonly<{ copy: Dictionary["home"] }>) {
  return (
    <section className="home-focus bg-zinc-950 py-20 sm:py-24">
      <PageContainer>
        <SectionHeading eyebrow={copy.currentFocus} title={copy.currentFocusTitle} />
        <div className="home-focus__grid mt-10 grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
          {copy.focusAreas.map((focus, index) => (
            <article
              key={focus}
              className="bg-zinc-950 p-6 sm:p-7"
            >
              <p className="text-xs font-semibold text-violet-300">0{index + 1}</p>
              <h3 className="mt-8 text-lg font-semibold text-white">{focus}</h3>
              <span className="home-focus__watermark" aria-hidden="true">
                0{index + 1}
              </span>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
