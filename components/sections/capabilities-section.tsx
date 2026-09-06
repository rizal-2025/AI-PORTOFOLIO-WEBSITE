import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CapabilitiesSection({ copy }: Readonly<{ copy: Dictionary["home"] }>) {
  return (
    <section className="home-capabilities border-y border-zinc-800 bg-[#07070b] py-20 sm:py-28">
      <PageContainer>
        <SectionHeading
          eyebrow={copy.capabilitiesEyebrow}
          title={copy.capabilitiesTitle}
          description={copy.capabilitiesDescription}
        />
        <div className="capability-depth-grid mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.capabilities.map((capability, index) => (
            <article
              key={capability[0]}
              className="capability-depth-card group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-300/5 text-violet-300">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M8 3.5h8M9 7h6M7 21h10a2 2 0 0 0 2-2v-8a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v8a2 2 0 0 0 2 2Z" />
                    <path d="M9 13h.01M15 13h.01M9.5 17h5" />
                  </svg>
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-semibold text-zinc-100">
                {capability[0]}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {capability[1]}
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
