import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { capabilities } from "@/config/site";

export function CapabilitiesSection() {
  return (
    <section className="border-y border-slate-800 bg-[#050a13] py-20 sm:py-28">
      <PageContainer>
        <SectionHeading
          eyebrow="Capabilities"
          title="Dari problem operasional menuju sistem AI end-to-end."
          description="Fokus pada engineering yang menghubungkan kebutuhan pengguna, logika bisnis, dan infrastruktur teknis."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <article
              key={capability.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/5 text-cyan-300">
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
                <span className="font-mono text-xs font-semibold text-slate-600">
                  {capability.number}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-semibold text-slate-100">
                {capability.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {capability.description}
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
