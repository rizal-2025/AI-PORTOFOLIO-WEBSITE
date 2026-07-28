import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";

export function HeroSection() {
  const capabilities = [
    "Create reservation",
    "Update reservation",
    "Cancel reservation",
    "Admin handoff",
  ];

  const technologies = ["LLM Integration", "Indonesian NLU", "FastAPI"];

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
      <div className="hero-grid absolute inset-0 -z-20" aria-hidden="true" />
      <div
        className="absolute left-[-12rem] top-[-8rem] -z-10 size-[34rem] rounded-full bg-blue-600/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-12rem] right-[-10rem] -z-10 size-[32rem] rounded-full bg-cyan-500/10 blur-[110px]"
        aria-hidden="true"
      />

      <PageContainer className="relative grid min-h-[calc(100svh-4rem)] items-center gap-14 py-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.72fr)] lg:gap-20 lg:py-28">
        <div className="max-w-4xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full rounded-full bg-cyan-300 opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan-300" />
            </span>
            AI Agent Engineer
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-slate-50 sm:text-6xl lg:text-[4.5rem]">
            Membangun AI Agent untuk Operasional Bisnis yang{" "}
            <span className="text-gradient">Lebih Efisien</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Saya membangun AI Agent praktis untuk customer service, reservasi,
            dan otomasi operasional—dari percakapan yang natural hingga integrasi
            backend yang dapat diandalkan.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/demo/aura">
              Coba Demo AURA <span className="ml-2" aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink href="/projects/aura" variant="secondary">
              Lihat Studi Kasus
            </ButtonLink>
          </div>
          <ul
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-800 pt-6"
            aria-label="Teknologi dan kemampuan utama"
          >
            {technologies.map((technology) => (
              <li
                key={technology}
                className="flex items-center gap-2 text-xs font-medium text-slate-400 sm:text-sm"
              >
                <span className="size-1 rounded-full bg-cyan-400" aria-hidden="true" />
                {technology}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
          <div
            className="absolute -inset-10 rounded-full bg-cyan-400/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950/80 p-1 shadow-2xl shadow-black/50 backdrop-blur">
            <div
              className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.035]"
              aria-hidden="true"
            />
            <div className="relative rounded-[1.25rem] border border-white/5 bg-slate-900/80 p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-5">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-500">
                    agent://reservation
                  </p>
                  <p className="mt-1.5 text-base font-semibold text-slate-50">
                    AURA Agent
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <span
                    className="size-1.5 rounded-full bg-emerald-400"
                    aria-hidden="true"
                  />
                  Core preview
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-4 border-b border-slate-700/70 py-5 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Language</dt>
                  <dd className="mt-1 font-medium text-slate-200">Indonesian</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Mode</dt>
                  <dd className="mt-1 font-medium text-slate-200">Task-oriented</dd>
                </div>
              </dl>

              <div className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Capabilities
                </p>
                <ul className="mt-4 grid gap-2.5">
                  {capabilities.map((capability, index) => (
                    <li
                      key={capability}
                      className="flex items-center justify-between rounded-xl border border-slate-700/70 bg-slate-950/60 px-3.5 py-3 text-sm text-slate-300"
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid size-6 place-items-center rounded-md bg-cyan-400/10 font-mono text-[0.65rem] text-cyan-300">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {capability}
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        className="size-4 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="m5 10 3 3 7-7" />
                      </svg>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-blue-500/10 px-3.5 py-3 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full bg-cyan-400"
                    aria-hidden="true"
                  />
                  <span className="text-slate-400">Interface state</span>
                </div>
                <span className="font-mono text-cyan-300">static preview</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
