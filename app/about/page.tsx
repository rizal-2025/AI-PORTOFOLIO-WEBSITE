import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Profil profesional AI Engineer dengan fokus pada agent, backend, dan integrasi LLM.",
};

const strengths = [
  {
    number: "01",
    title: "AI Agent Development",
    description:
      "Merancang agent yang memahami konteks, workflow, dan kapan perlu meminta bantuan manusia.",
    category: "Agent Systems",
  },
  {
    number: "02",
    title: "Backend API Engineering",
    description:
      "Membangun boundary API yang terstruktur untuk integrasi sistem bisnis.",
    category: "Backend",
  },
  {
    number: "03",
    title: "Indonesian NLU",
    description:
      "Memperhatikan variasi bahasa Indonesia dalam percakapan dan intent sehari-hari.",
    category: "Language",
  },
  {
    number: "04",
    title: "LLM Integration",
    description: "Menghubungkan model bahasa dengan tools, data, dan guardrail yang tepat.",
    category: "AI Integration",
  },
  {
    number: "05",
    title: "PostgreSQL Integration",
    description: "Menjaga alur data terstruktur untuk mendukung workflow aplikasi AI.",
    category: "Data",
  },
  {
    number: "06",
    title: "Business Process Automation",
    description: "Menerjemahkan proses berulang menjadi alur yang dapat dipelihara.",
    category: "Operations",
  },
  {
    number: "07",
    title: "System Architecture",
    description: "Membuat batas yang jelas antara channel, agent core, layanan bisnis, dan data.",
    category: "System Design",
  },
  {
    number: "08",
    title: "Human Handoff Design",
    description: "Merancang jalur eskalasi yang jelas ketika agent tidak seharusnya mengambil keputusan sendiri.",
    category: "Safety",
  },
] as const;

const workApproach = [
  "Memahami masalah bisnis dan konteks pengguna.",
  "Memetakan alur operasional sebelum memilih teknologi.",
  "Memisahkan business logic dari channel percakapan.",
  "Membangun solusi secara bertahap dan dapat diuji.",
  "Menjaga keamanan serta isolasi data sebagai bagian dari desain.",
  "Mendokumentasikan keputusan teknis dan batasan sistem.",
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div className="absolute -left-40 top-0 -z-10 size-[30rem] rounded-full bg-emerald-500/10 blur-[110px]" aria-hidden="true" />
        <PageContainer className="py-8 sm:py-10"><nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-500"><Link href="/" className="transition-colors hover:text-emerald-300">Home</Link><span className="mx-2 text-slate-700" aria-hidden="true">/</span><span aria-current="page" className="text-slate-300">About</span></nav></PageContainer>
        <PageContainer className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end"><div><p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />Profile node</p><h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-50 sm:text-6xl">Membangun AI Agent dan backend systems untuk operasional yang lebih <span className="text-emerald-300">terstruktur.</span></h1><p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">{siteConfig.owner.summary}</p><div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs text-emerald-300">STATUS: BUILDING PRACTICAL AI SYSTEMS</span><span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-mono text-xs text-slate-400">{siteConfig.owner.availability ?? "OPEN TO OPPORTUNITIES — PLACEHOLDER"}</span></div><div className="mt-9 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects">Lihat Projects</ButtonLink><ButtonLink href="/contact" variant="secondary">Hubungi Saya</ButtonLink></div></div><TerminalPanel label="profile system"><dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">{[["PROFILE", siteConfig.owner.role], ["FOCUS", "AI AGENTS / BACKEND SYSTEMS"], ["PRIMARY PROJECT", "AURA"], ["LANGUAGE", "INDONESIAN / ENGLISH"], ["STATUS", "BUILDING PRACTICAL AI SYSTEMS"]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-800 pb-3 last:border-0 last:pb-0"><dt className="text-slate-500">{label}</dt><dd className="text-right text-emerald-300">{value}</dd></div>)}</dl></TerminalPanel></PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">01 / Professional summary</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">Dari proses berulang ke sistem yang dapat diandalkan.</h2></div><div className="max-w-2xl space-y-5 text-base leading-8 text-slate-400"><p>Fokus profesional saya berada di persimpangan antara AI Agent engineering, backend development, dan integrasi LLM. Tujuannya bukan sekadar membuat percakapan terlihat cerdas, melainkan membantu proses bisnis menjadi lebih jelas dan dapat dijalankan.</p><p>Pendekatan ini mencakup Indonesian NLU, automation, hingga desain sistem end-to-end—dari pesan pengguna sampai batas data dan jalur handoff manusia.</p><p>Setiap solusi dikembangkan dengan perhatian pada konteks operasional, batas keamanan, dan langkah implementasi yang realistis.</p></div></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{strengths.map((strength) => <article key={strength.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl border border-emerald-400/15 bg-emerald-400/5 text-emerald-300"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M12 5v14" /><circle cx="12" cy="12" r="8" /></svg></span><span className="font-mono text-xs text-slate-600">{strength.number}</span></div><h3 className="mt-6 text-lg font-semibold text-slate-100">{strength.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{strength.description}</p><p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-emerald-300">{strength.category}</p></article>)}</div>
        </PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24"><PageContainer className="grid gap-12 lg:grid-cols-2 lg:gap-16"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">02 / Working approach</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50">Membangun dengan konteks, bukan asumsi.</h2><ul className="mt-7 grid gap-4 text-sm leading-6 text-slate-400">{workApproach.map((item, index) => <li key={item} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg border border-emerald-400/15 bg-emerald-400/5 font-mono text-xs text-emerald-300">{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ul></div><TerminalPanel label="current profile"><dl className="grid gap-3 p-5 text-sm"><div className="flex justify-between gap-5"><dt className="text-slate-500">Name</dt><dd className="text-slate-200">{siteConfig.owner.name ?? "Nama Anda"}</dd></div><div className="flex justify-between gap-5"><dt className="text-slate-500">Role</dt><dd className="text-emerald-300">{siteConfig.owner.role}</dd></div><div className="flex justify-between gap-5"><dt className="text-slate-500">Location</dt><dd className="text-slate-200">{siteConfig.owner.location ?? "Lokasi belum diisi"}</dd></div><div className="flex justify-between gap-5"><dt className="text-slate-500">Availability</dt><dd className="text-slate-200">{siteConfig.owner.availability ?? "Open to opportunities — placeholder"}</dd></div></dl></TerminalPanel></PageContainer></section>

      <section className="bg-[#080e19] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">03 / Project focus</p><div className="mt-6 grid gap-8 rounded-3xl border border-emerald-400/15 bg-slate-900/50 p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="font-mono text-sm text-emerald-300">PRIMARY SYSTEM / AURA</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-50">AURA</h2><p className="mt-4 text-sm leading-7 text-slate-400">AI reservation dan customer-service agent berbahasa Indonesia.</p></div><div><p className="text-base leading-8 text-slate-300">AURA menunjukkan fokus membangun agent end-to-end: mengelola reservasi, memproses bahasa Indonesia, menghubungkan FastAPI, PostgreSQL, Telegram, dan LLM, serta menyediakan demo web publik melalui boundary server-side yang aman.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects/aura">Lihat AURA Case Study</ButtonLink><ButtonLink href="/architecture" variant="secondary">Lihat Architecture</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">Coba Demo AURA</ButtonLink></div></div></div></PageContainer></section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24"><PageContainer className="grid gap-12 lg:grid-cols-2"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">04 / Technology snapshot</p><div className="mt-7 grid gap-3">{[["AI & Agent", "Ollama · OpenAI · Indonesian NLU", "Dukungan model bahasa dan pemahaman intent."], ["Backend", "Python · FastAPI", "Boundary layanan dan workflow aplikasi."], ["Data", "PostgreSQL", "Persistence untuk data operasional."], ["Frontend", "Next.js · TypeScript · Tailwind CSS", "Interface portofolio dan demo statis."], ["Integration", "Telegram", "Channel percakapan AURA saat ini."]].map(([title, stack, description]) => <article key={title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"><p className="font-mono text-xs text-emerald-300">{title}</p><h2 className="mt-3 text-lg font-semibold text-slate-100">{stack}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></article>)}</div></div><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">05 / Principles</p><div className="mt-7 grid gap-3">{["Practical over flashy", "Safe by design", "Clear system boundaries", "Human handoff when needed", "Incremental development", "Honest project communication"].map((item) => <article key={item} className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-sm font-medium text-slate-300"><span className="mr-3 font-mono text-emerald-300">{"//"}</span>{item}</article>)}</div></div></PageContainer></section>

      <section className="bg-[#080e19] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">06 / Current direction</p><div className="mt-8 grid gap-5 lg:grid-cols-2"><article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-7"><h2 className="text-xl font-semibold text-slate-100">Sedang dibangun</h2><ul className="mt-5 grid gap-3 text-sm text-slate-400">{["AI portfolio website.", "AURA public demo.", "Isolated demo architecture.", "Additional AI Agents."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}</ul></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7"><h2 className="text-xl font-semibold text-slate-100">Tujuan profesional</h2><ul className="mt-5 grid gap-3 text-sm text-slate-400">{[siteConfig.owner.opportunities.employment ?? "Peluang AI Engineer — placeholder", siteConfig.owner.opportunities.freelance ?? "Proyek freelance AI Agent — placeholder", siteConfig.owner.opportunities.collaboration ?? "Kolaborasi produk AI — placeholder"].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />{item}</li>)}</ul></article></div><div className="mt-10 rounded-3xl border border-emerald-400/20 bg-slate-900 px-7 py-10 sm:px-10"><h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-50">Mari diskusikan bagaimana AI Agent dapat membantu proses bisnis Anda.</h2><div className="mt-7 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/contact">Hubungi Saya</ButtonLink><ButtonLink href="/projects" variant="secondary">Lihat Projects</ButtonLink></div></div></PageContainer></section>
    </>
  );
}
