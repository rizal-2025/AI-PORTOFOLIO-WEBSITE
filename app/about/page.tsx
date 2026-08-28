import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { siteConfig } from "@/config/site";
import { defineLocalizedContent, selectLocalizedContent } from "@/lib/i18n/static-content";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "About",
  description: "Profil profesional AI Engineer dengan fokus pada agent, backend, dan integrasi LLM.",
};

export const aboutSectionIds = [
  "about-hero",
  "about-summary",
  "about-approach",
  "about-project",
  "about-technology-principles",
  "about-direction",
] as const;

const content = defineLocalizedContent({
  "id-ID": {
    breadcrumbHome: "Beranda",
    breadcrumbCurrent: "Tentang",
    heroEyebrow: "Profil profesional",
    heroTitle: "Membangun AI Agent dan sistem backend untuk operasional yang lebih",
    heroAccent: "terstruktur.",
    heroSummary: "Membangun AI Agent dan sistem backend yang membantu bisnis menangani operasional berulang secara lebih efisien.",
    status: "STATUS: MEMBANGUN SISTEM AI PRAKTIS",
    viewProjects: "Lihat Proyek",
    contactMe: "Hubungi Saya",
    profileLabel: "profil profesional",
    profileRows: [
      ["PROFIL", "AI Engineer"],
      ["FOKUS", "AI AGENT / SISTEM BACKEND"],
      ["PROYEK UTAMA", "AURA"],
      ["BAHASA", "INDONESIA / INGGRIS"],
      ["STATUS", "MEMBANGUN SISTEM AI PRAKTIS"],
    ],
    summaryEyebrow: "01 / Ringkasan profesional",
    summaryTitle: "Dari proses berulang ke sistem yang dapat diandalkan.",
    summaryParagraphs: [
      "Fokus profesional saya berada di persimpangan antara rekayasa AI Agent, pengembangan backend, dan integrasi LLM. Tujuannya bukan sekadar membuat percakapan terlihat cerdas, melainkan membantu proses bisnis menjadi lebih jelas dan dapat dijalankan.",
      "Pendekatan ini mencakup Indonesian NLU, otomasi, hingga desain sistem end-to-end—dari pesan pengguna sampai batas data dan jalur handoff manusia.",
      "Setiap solusi dikembangkan dengan perhatian pada konteks operasional, batas keamanan, dan langkah implementasi yang realistis.",
    ],
    strengths: [
      ["AI Agent Development", "Merancang agen yang memahami konteks, alur kerja, dan kapan perlu meminta bantuan manusia.", "Sistem Agen"],
      ["Backend API Engineering", "Membangun batas API yang terstruktur untuk integrasi sistem bisnis.", "Backend"],
      ["Indonesian NLU", "Memperhatikan variasi bahasa Indonesia dalam percakapan dan intent sehari-hari.", "Bahasa"],
      ["LLM Integration", "Menghubungkan model bahasa dengan alat, data, dan guardrail yang tepat.", "Integrasi AI"],
      ["PostgreSQL Integration", "Menjaga alur data terstruktur untuk mendukung alur kerja aplikasi AI.", "Data"],
      ["Business Process Automation", "Menerjemahkan proses berulang menjadi alur yang dapat dipelihara.", "Operasional"],
      ["System Architecture", "Membuat batas yang jelas antara kanal, inti agen, layanan bisnis, dan data.", "Desain Sistem"],
      ["Human Handoff Design", "Merancang jalur eskalasi yang jelas ketika agen tidak seharusnya mengambil keputusan sendiri.", "Keamanan"],
    ],
    approachEyebrow: "02 / Pendekatan kerja",
    approachTitle: "Membangun dengan konteks, bukan asumsi.",
    approach: [
      "Memahami masalah bisnis dan konteks pengguna.",
      "Memetakan alur operasional sebelum memilih teknologi.",
      "Memisahkan logika bisnis dari kanal percakapan.",
      "Membangun solusi secara bertahap dan dapat diuji.",
      "Menjaga keamanan serta isolasi data sebagai bagian dari desain.",
      "Mendokumentasikan keputusan teknis dan batasan sistem.",
    ],
    currentProfile: "profil saat ini",
    profileLabels: ["Nama", "Peran", "Lokasi", "Ketersediaan"],
    profileFallbacks: ["Nama Anda", "AI Engineer", "Lokasi belum diisi", "Terbuka untuk peluang — placeholder"],
    projectEyebrow: "03 / Fokus proyek",
    primarySystem: "SISTEM UTAMA / AURA",
    projectSummary: "Agen reservasi dan layanan pelanggan AI berbahasa Indonesia.",
    projectDescription: "AURA menunjukkan fokus membangun agen end-to-end: mengelola reservasi, memproses bahasa Indonesia, menghubungkan FastAPI, PostgreSQL, Telegram, dan LLM, serta menyediakan demo web publik melalui batas server-side yang aman.",
    viewCaseStudy: "Lihat Studi Kasus AURA",
    viewArchitecture: "Lihat Arsitektur",
    tryDemo: "Coba Demo AURA",
    technologyEyebrow: "04 / Ringkasan teknologi",
    technologies: [
      ["AI & Agent", "Ollama · OpenAI · Indonesian NLU", "Dukungan model bahasa dan pemahaman intent."],
      ["Backend", "Python · FastAPI", "Batas layanan dan alur kerja aplikasi."],
      ["Data", "PostgreSQL", "Penyimpanan persisten untuk data operasional."],
      ["Frontend", "Next.js · TypeScript · Tailwind CSS", "Antarmuka portofolio dan demo statis."],
      ["Integrasi", "Telegram", "Kanal percakapan AURA saat ini."],
    ],
    principlesEyebrow: "05 / Prinsip",
    principles: [
      "Praktis, bukan sekadar mencolok",
      "Aman sejak tahap desain",
      "Batas sistem yang jelas",
      "Handoff manusia saat diperlukan",
      "Pengembangan bertahap",
      "Komunikasi proyek yang jujur",
    ],
    directionEyebrow: "06 / Arah saat ini",
    buildingTitle: "Sedang dibangun",
    building: ["Situs portofolio AI.", "Demo publik AURA.", "Arsitektur demo terisolasi.", "AI Agent tambahan."],
    goalsTitle: "Tujuan profesional",
    goalFallbacks: ["Peluang AI Engineer — placeholder", "Proyek freelance AI Agent — placeholder", "Kolaborasi produk AI — placeholder"],
    finalTitle: "Mari diskusikan bagaimana AI Agent dapat membantu proses bisnis Anda.",
  },
  "en-US": {
    breadcrumbHome: "Home",
    breadcrumbCurrent: "About",
    heroEyebrow: "Professional profile",
    heroTitle: "Building AI agents and backend systems for more",
    heroAccent: "structured operations.",
    heroSummary: "Building AI agents and backend systems that help businesses handle repetitive operations more efficiently.",
    status: "STATUS: BUILDING PRACTICAL AI SYSTEMS",
    viewProjects: "View Projects",
    contactMe: "Contact Me",
    profileLabel: "professional profile",
    profileRows: [
      ["PROFILE", "AI Engineer"],
      ["FOCUS", "AI AGENTS / BACKEND SYSTEMS"],
      ["PRIMARY PROJECT", "AURA"],
      ["LANGUAGES", "INDONESIAN / ENGLISH"],
      ["STATUS", "BUILDING PRACTICAL AI SYSTEMS"],
    ],
    summaryEyebrow: "01 / Professional summary",
    summaryTitle: "From repetitive processes to dependable systems.",
    summaryParagraphs: [
      "My professional focus sits at the intersection of AI-agent engineering, backend development, and LLM integration. The goal is not merely to make conversations appear intelligent, but to make business processes clearer and executable.",
      "This approach spans Indonesian NLU, automation, and end-to-end system design—from a user's message to data boundaries and a human-handoff path.",
      "Each solution is developed with attention to operational context, security boundaries, and realistic implementation steps.",
    ],
    strengths: [
      ["AI Agent Development", "Designing agents that understand context, workflows, and when to ask a person for help.", "Agent Systems"],
      ["Backend API Engineering", "Building structured API boundaries for business-system integration.", "Backend"],
      ["Indonesian NLU", "Accounting for Indonesian-language variations in everyday conversations and intents.", "Language"],
      ["LLM Integration", "Connecting language models with the right tools, data, and guardrails.", "AI Integration"],
      ["PostgreSQL Integration", "Maintaining structured data flows for AI application workflows.", "Data"],
      ["Business Process Automation", "Turning repetitive processes into maintainable workflows.", "Operations"],
      ["System Architecture", "Creating clear boundaries among channels, the agent core, business services, and data.", "System Design"],
      ["Human Handoff Design", "Designing a clear escalation path when the agent should not decide alone.", "Safety"],
    ],
    approachEyebrow: "02 / Working approach",
    approachTitle: "Build with context, not assumptions.",
    approach: [
      "Understand the business problem and user context.",
      "Map the operational workflow before choosing technology.",
      "Separate business logic from conversation channels.",
      "Build incrementally with testable boundaries.",
      "Treat security and data isolation as design inputs.",
      "Document technical decisions and system constraints.",
    ],
    currentProfile: "current profile",
    profileLabels: ["Name", "Role", "Location", "Availability"],
    profileFallbacks: ["Your name", "AI Engineer", "Location not specified", "Open to opportunities — placeholder"],
    projectEyebrow: "03 / Project focus",
    primarySystem: "PRIMARY SYSTEM / AURA",
    projectSummary: "An Indonesian-language AI reservation and customer-service agent.",
    projectDescription: "AURA demonstrates an end-to-end agent focus: managing reservations, processing Indonesian, connecting FastAPI, PostgreSQL, Telegram, and LLMs, and providing a public web demo through a secure server-side boundary.",
    viewCaseStudy: "View AURA Case Study",
    viewArchitecture: "View Architecture",
    tryDemo: "Try AURA Demo",
    technologyEyebrow: "04 / Technology snapshot",
    technologies: [
      ["AI & Agent", "Ollama · OpenAI · Indonesian NLU", "Language-model support and intent understanding."],
      ["Backend", "Python · FastAPI", "The service boundary and application workflow."],
      ["Data", "PostgreSQL", "Persistent storage for operational data."],
      ["Frontend", "Next.js · TypeScript · Tailwind CSS", "The portfolio and static demo interface."],
      ["Integration", "Telegram", "AURA's current conversation channel."],
    ],
    principlesEyebrow: "05 / Principles",
    principles: [
      "Practical over flashy",
      "Safe by design",
      "Clear system boundaries",
      "Human handoff when needed",
      "Incremental development",
      "Honest project communication",
    ],
    directionEyebrow: "06 / Current direction",
    buildingTitle: "In development",
    building: ["AI portfolio website.", "AURA public demo.", "Isolated demo architecture.", "Additional AI agents."],
    goalsTitle: "Professional goals",
    goalFallbacks: ["AI Engineer opportunities — placeholder", "Freelance AI Agent projects — placeholder", "AI product collaboration — placeholder"],
    finalTitle: "Let's discuss how an AI agent can help your business process.",
  },
});

export default async function AboutPage() {
  const locale = await getServerLocale();
  const copy = selectLocalizedContent(content, locale);
  const profileValues = [siteConfig.owner.name ?? copy.profileFallbacks[0], siteConfig.owner.role, siteConfig.owner.location ?? copy.profileFallbacks[2], siteConfig.owner.availability ?? copy.profileFallbacks[3]];
  const goals = [siteConfig.owner.opportunities.employment ?? copy.goalFallbacks[0], siteConfig.owner.opportunities.freelance ?? copy.goalFallbacks[1], siteConfig.owner.opportunities.collaboration ?? copy.goalFallbacks[2]];

  return (
    <>
      <section data-section-id={aboutSectionIds[0]} className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" /><div className="absolute -left-40 top-0 -z-10 size-[30rem] rounded-full bg-emerald-500/10 blur-[110px]" aria-hidden="true" />
        <PageContainer className="py-8 sm:py-10"><nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-500"><Link href="/" className="transition-colors hover:text-emerald-300">{copy.breadcrumbHome}</Link><span className="mx-2 text-slate-700" aria-hidden="true">/</span><span aria-current="page" className="text-slate-300">{copy.breadcrumbCurrent}</span></nav></PageContainer>
        <PageContainer className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end"><div><p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />{copy.heroEyebrow}</p><h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-50 sm:text-6xl">{copy.heroTitle} <span className="text-emerald-300">{copy.heroAccent}</span></h1><p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">{copy.heroSummary}</p><div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs text-emerald-300">{copy.status}</span><span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-mono text-xs text-slate-400">{siteConfig.owner.availability ?? copy.profileFallbacks[3]}</span></div><div className="mt-9 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects">{copy.viewProjects}</ButtonLink><ButtonLink href="/contact" variant="secondary">{copy.contactMe}</ButtonLink></div></div><TerminalPanel label={copy.profileLabel}><dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">{copy.profileRows.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-800 pb-3 last:border-0 last:pb-0"><dt className="text-slate-500">{label}</dt><dd className="text-right text-emerald-300">{value}</dd></div>)}</dl></TerminalPanel></PageContainer>
      </section>

      <section data-section-id={aboutSectionIds[1]} className="bg-[#080e19] py-16 sm:py-24"><PageContainer><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{copy.summaryEyebrow}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">{copy.summaryTitle}</h2></div><div className="max-w-2xl space-y-5 text-base leading-8 text-slate-400">{copy.summaryParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{copy.strengths.map(([title, description, category], index) => <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl border border-emerald-400/15 bg-emerald-400/5 text-emerald-300"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M12 5v14" /><circle cx="12" cy="12" r="8" /></svg></span><span className="font-mono text-xs text-slate-600">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-6 text-lg font-semibold text-slate-100">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p><p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-emerald-300">{category}</p></article>)}</div></PageContainer></section>

      <section data-section-id={aboutSectionIds[2]} className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24"><PageContainer className="grid gap-12 lg:grid-cols-2 lg:gap-16"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{copy.approachEyebrow}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50">{copy.approachTitle}</h2><ul className="mt-7 grid gap-4 text-sm leading-6 text-slate-400">{copy.approach.map((item, index) => <li key={item} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg border border-emerald-400/15 bg-emerald-400/5 font-mono text-xs text-emerald-300">{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ul></div><TerminalPanel label={copy.currentProfile}><dl className="grid gap-3 p-5 text-sm">{copy.profileLabels.map((label, index) => <div key={label} className="flex justify-between gap-5"><dt className="text-slate-500">{label}</dt><dd className={index === 1 ? "text-emerald-300" : "text-slate-200"}>{profileValues[index]}</dd></div>)}</dl></TerminalPanel></PageContainer></section>

      <section data-section-id={aboutSectionIds[3]} className="bg-[#080e19] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{copy.projectEyebrow}</p><div className="mt-6 grid gap-8 rounded-3xl border border-emerald-400/15 bg-slate-900/50 p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="font-mono text-sm text-emerald-300">{copy.primarySystem}</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-50">AURA</h2><p className="mt-4 text-sm leading-7 text-slate-400">{copy.projectSummary}</p></div><div><p className="text-base leading-8 text-slate-300">{copy.projectDescription}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects/aura">{copy.viewCaseStudy}</ButtonLink><ButtonLink href="/architecture" variant="secondary">{copy.viewArchitecture}</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">{copy.tryDemo}</ButtonLink></div></div></div></PageContainer></section>

      <section data-section-id={aboutSectionIds[4]} className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24"><PageContainer className="grid gap-12 lg:grid-cols-2"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{copy.technologyEyebrow}</p><div className="mt-7 grid gap-3">{copy.technologies.map(([title, stack, description]) => <article key={title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"><p className="font-mono text-xs text-emerald-300">{title}</p><h2 className="mt-3 text-lg font-semibold text-slate-100">{stack}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></article>)}</div></div><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{copy.principlesEyebrow}</p><div className="mt-7 grid gap-3">{copy.principles.map((item) => <article key={item} className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-sm font-medium text-slate-300"><span className="mr-3 font-mono text-emerald-300">{"//"}</span>{item}</article>)}</div></div></PageContainer></section>

      <section data-section-id={aboutSectionIds[5]} className="bg-[#080e19] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{copy.directionEyebrow}</p><div className="mt-8 grid gap-5 lg:grid-cols-2"><article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-7"><h2 className="text-xl font-semibold text-slate-100">{copy.buildingTitle}</h2><ul className="mt-5 grid gap-3 text-sm text-slate-400">{copy.building.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}</ul></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7"><h2 className="text-xl font-semibold text-slate-100">{copy.goalsTitle}</h2><ul className="mt-5 grid gap-3 text-sm text-slate-400">{goals.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />{item}</li>)}</ul></article></div><div className="mt-10 rounded-3xl border border-emerald-400/20 bg-slate-900 px-7 py-10 sm:px-10"><h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-50">{copy.finalTitle}</h2><div className="mt-7 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/contact">{copy.contactMe}</ButtonLink><ButtonLink href="/projects" variant="secondary">{copy.viewProjects}</ButtonLink></div></div></PageContainer></section>
    </>
  );
}
