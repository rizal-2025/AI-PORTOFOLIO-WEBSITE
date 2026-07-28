import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { ProjectCard } from "@/components/ui/project-card";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { projects } from "@/config/site";

export const metadata: Metadata = {
  title: "Projects",
  description: "Kumpulan proyek AI Agent dan backend engineering.",
};

export default function ProjectsPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div
          className="absolute -left-40 top-0 -z-10 size-[28rem] rounded-full bg-emerald-500/10 blur-[110px]"
          aria-hidden="true"
        />
        <PageContainer className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Project archive
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-50 sm:text-6xl">
              AI Systems &amp; <span className="text-emerald-300">Intelligent Agents</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Kumpulan proyek AI yang dirancang dari kebutuhan operasional nyata:
              percakapan yang lebih natural, alur yang lebih terstruktur, dan
              integrasi yang siap dikembangkan bersama sistem bisnis.
            </p>
          </div>
          <TerminalPanel label="projects index">
            <dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">DOCUMENTED SYSTEMS</dt>
                <dd className="text-emerald-300">0{projects.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">PRIMARY AGENT</dt>
                <dd className="text-cyan-300">AURA</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">STATUS</dt>
                <dd className="flex items-center gap-2 text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  DEVELOPMENT
                </dd>
              </div>
            </dl>
          </TerminalPanel>
        </PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Featured system
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">
                Proyek yang sedang dikembangkan
              </h2>
            </div>
            <p className="font-mono text-xs text-slate-500">INDEX / 01</p>
          </div>
          <div className="grid gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              System queue
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">
              Ruang untuk agent berikutnya.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Struktur portofolio ini disiapkan untuk proyek AI lain yang relevan
              dengan kebutuhan internal maupun customer-facing.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Future AI Agent", "Concept", "Eksplorasi agent untuk alur kerja yang spesifik."],
              ["Internal Automation Agent", "Planned", "Konsep otomasi untuk proses tim yang berulang."],
              ["Knowledge Assistant", "Coming later", "Ruang untuk assistant berbasis pengetahuan terkurasi."],
            ].map(([title, status, description], index) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-10 place-items-center rounded-xl border border-emerald-400/15 bg-emerald-400/5 font-mono text-xs text-emerald-300">
                    0{index + 2}
                  </span>
                  <span className="rounded-full border border-slate-700 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-slate-400">
                    {status}
                  </span>
                </div>
                <h3 className="mt-7 text-lg font-semibold text-slate-100">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
