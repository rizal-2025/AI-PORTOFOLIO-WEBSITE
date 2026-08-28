import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { ProjectCard } from "@/components/ui/project-card";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { siteConfig } from "@/config/site";
import {
  defineLocalizedContent,
  selectLocalizedContent,
} from "@/lib/i18n/static-content";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Projects",
  description: "Kumpulan proyek AI Agent dan backend engineering.",
};

export const projectsSectionIds = ["projects-hero", "projects-featured", "projects-queue"] as const;

const content = defineLocalizedContent({
  "id-ID": {
    archive: "Arsip proyek",
    titleLead: "Sistem AI &",
    titleAccent: "Agen Cerdas",
    introduction:
      "Kumpulan proyek AI yang dirancang dari kebutuhan operasional nyata: percakapan yang lebih natural, alur yang lebih terstruktur, dan integrasi yang siap dikembangkan bersama sistem bisnis.",
    indexLabel: "indeks proyek",
    indexRows: [
      ["SISTEM TERDOKUMENTASI", "01"],
      ["AGEN UTAMA", "AURA"],
      ["STATUS", "DALAM PENGEMBANGAN"],
    ],
    featuredEyebrow: "Sistem unggulan",
    featuredTitle: "Proyek yang sedang dikembangkan",
    indexValue: "INDEKS / 01",
    project: {
      category: "Agen Reservasi & Layanan Pelanggan AI",
      status: "Demo aktif",
      role: "AI Agent & Backend Engineering",
      description:
        "Asisten AI berbahasa Indonesia untuk alur reservasi dan layanan pelanggan, dengan demo publik serta jalur handoff yang jelas ke admin.",
      features: [
        "Membuat reservasi",
        "Memperbarui reservasi",
        "Membatalkan reservasi",
        "Mengecek reservasi",
        "Handoff ke admin",
        "Pemahaman bahasa Indonesia",
      ],
      businessValue: [
        "Mengurangi pekerjaan reservasi berulang.",
        "Membantu layanan pelanggan menangani permintaan umum.",
        "Menyediakan jalur handoff saat agen membutuhkan bantuan manusia.",
      ],
    },
    cardLabels: {
      featuredProject: "Proyek unggulan",
      businessValue: "Nilai bisnis",
      coreCapabilities: "Kemampuan utama",
      technologyStack: "Tumpukan teknologi",
      caseStudy: "Lihat studi kasus",
      demo: "Coba demo AURA",
    },
    queueEyebrow: "Antrean sistem",
    queueTitle: "Ruang untuk agen berikutnya.",
    queueDescription:
      "Struktur portofolio ini disiapkan untuk proyek AI lain yang relevan dengan kebutuhan internal maupun kebutuhan pelanggan.",
    queue: [
      ["Agen AI Masa Depan", "Konsep", "Eksplorasi agen untuk alur kerja yang spesifik."],
      ["Agen Otomasi Internal", "Direncanakan", "Konsep otomasi untuk proses tim yang berulang."],
      ["Asisten Pengetahuan", "Akan datang", "Ruang untuk asisten berbasis pengetahuan terkurasi."],
    ],
  },
  "en-US": {
    archive: "Project archive",
    titleLead: "AI Systems &",
    titleAccent: "Intelligent Agents",
    introduction:
      "A collection of AI projects designed around real operational needs: more natural conversations, more structured workflows, and integrations ready to grow with business systems.",
    indexLabel: "projects index",
    indexRows: [
      ["DOCUMENTED SYSTEMS", "01"],
      ["PRIMARY AGENT", "AURA"],
      ["STATUS", "IN DEVELOPMENT"],
    ],
    featuredEyebrow: "Featured system",
    featuredTitle: "Project currently in development",
    indexValue: "INDEX / 01",
    project: {
      category: "AI Reservation & Customer-Service Agent",
      status: "Live demo",
      role: "AI Agent & Backend Engineering",
      description:
        "An Indonesian-language AI assistant for reservation and customer-service workflows, with a public demo and a clear admin-handoff path.",
      features: [
        "Create reservations",
        "Update reservations",
        "Cancel reservations",
        "Check reservations",
        "Admin handoff",
        "Indonesian-language understanding",
      ],
      businessValue: [
        "Reduces repetitive reservation work.",
        "Helps customer service handle common requests.",
        "Provides a handoff path when the agent needs human assistance.",
      ],
    },
    cardLabels: {
      featuredProject: "Featured project",
      businessValue: "Business value",
      coreCapabilities: "Core capabilities",
      technologyStack: "Technology stack",
      caseStudy: "View case study",
      demo: "Try AURA demo",
    },
    queueEyebrow: "System queue",
    queueTitle: "Room for the next agent.",
    queueDescription:
      "This portfolio structure is prepared for additional AI projects relevant to internal and customer-facing needs.",
    queue: [
      ["Future AI Agent", "Concept", "Exploration of an agent for a specific workflow."],
      ["Internal Automation Agent", "Planned", "An automation concept for repetitive team processes."],
      ["Knowledge Assistant", "Coming later", "Space for an assistant backed by curated knowledge."],
    ],
  },
});

export default async function ProjectsPage() {
  const locale = await getServerLocale();
  const copy = selectLocalizedContent(content, locale);
  const project = {
    name: siteConfig.featuredProject.name,
    category: copy.project.category,
    status: copy.project.status,
    role: copy.project.role,
    description: copy.project.description,
    features: copy.project.features,
    businessValue: copy.project.businessValue,
    technologies: siteConfig.featuredProject.technologies,
    caseStudyHref: siteConfig.featuredProject.caseStudyHref,
    demoHref: siteConfig.featuredProject.demoHref,
  };

  return (
    <>
      <section data-section-id={projectsSectionIds[0]} className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div className="absolute -left-40 top-0 -z-10 size-[28rem] rounded-full bg-emerald-500/10 blur-[110px]" aria-hidden="true" />
        <PageContainer className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />{copy.archive}
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-50 sm:text-6xl">
              {copy.titleLead} <span className="text-emerald-300">{copy.titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">{copy.introduction}</p>
          </div>
          <TerminalPanel label={copy.indexLabel}>
            <dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">
              {copy.indexRows.map(([label, value], index) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className={index === 1 ? "text-cyan-300" : "text-emerald-300"}>
                    {index === 2 ? <span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> : null}{value}
                  </dd>
                </div>
              ))}
            </dl>
          </TerminalPanel>
        </PageContainer>
      </section>

      <section data-section-id={projectsSectionIds[1]} className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{copy.featuredEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">{copy.featuredTitle}</h2>
            </div>
            <p className="font-mono text-xs text-slate-500">{copy.indexValue}</p>
          </div>
          <ProjectCard {...project} labels={copy.cardLabels} />
        </PageContainer>
      </section>

      <section data-section-id={projectsSectionIds[2]} className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{copy.queueEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">{copy.queueTitle}</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">{copy.queueDescription}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.queue.map(([title, status, description], index) => (
              <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-10 place-items-center rounded-xl border border-emerald-400/15 bg-emerald-400/5 font-mono text-xs text-emerald-300">0{index + 2}</span>
                  <span className="rounded-full border border-slate-700 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-slate-400">{status}</span>
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
