import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { TerminalPanel } from "@/components/ui/terminal-panel";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "Kerangka arsitektur portofolio dan demo AURA dengan pemisahan environment yang jelas.",
};

const layerCards = [
  {
    number: "01",
    title: "Channel Layer",
    description:
      "Telegram menjadi channel AURA saat ini; web demo direncanakan sebagai channel tambahan.",
    reason: "Memisahkan cara pesan masuk dari logika agent.",
    status: "Current / planned",
  },
  {
    number: "02",
    title: "API Boundary",
    description:
      "FastAPI menjadi boundary untuk request, validasi, dan respons layanan.",
    reason: "Menjaga interface eksternal terpisah dari core aplikasi.",
    status: "Existing core",
  },
  {
    number: "03",
    title: "Conversation Layer",
    description:
      "Authenticated Chat Service mengelola identitas, konteks, dan sesi percakapan.",
    reason: "Konteks perlu tervalidasi sebelum diteruskan ke agent.",
    status: "Design focus",
  },
  {
    number: "04",
    title: "Agent Layer",
    description:
      "Agent Orchestrator memadukan intent detection, Indonesian NLU, dan workflow.",
    reason: "Menjaga keputusan alur tetap dapat diuji dan dijelaskan.",
    status: "Existing core",
  },
  {
    number: "05",
    title: "Business Layer",
    description:
      "Reservation Service menangani operasi create, check, update, dan cancel.",
    reason: "Aturan bisnis tidak bercampur dengan channel atau UI percakapan.",
    status: "Existing core",
  },
  {
    number: "06",
    title: "Data Layer",
    description:
      "PostgreSQL dan repository menyimpan data dengan ownership scope di backend.",
    reason: "Akses data perlu dibatasi dan terkontrol oleh layanan.",
    status: "Existing core",
  },
  {
    number: "07",
    title: "AI Provider Layer",
    description:
      "Ollama atau OpenAI mendukung pemahaman dan respons yang dibatasi aplikasi.",
    reason: "LLM tidak diberi akses langsung ke database atau ownership data.",
    status: "Provider boundary",
  },
  {
    number: "08",
    title: "Human Escalation",
    description:
      "Admin handoff menyediakan jalur ketika pengguna membutuhkan bantuan manusia.",
    reason: "Agent tidak seharusnya mengambil semua keputusan sendiri.",
    status: "Existing core",
  },
] as const;

const requestFlow = [
  "Pengguna mengirim pesan.",
  "Channel meneruskan pesan.",
  "Identitas dan konteks divalidasi.",
  "Intent dan entity diproses.",
  "Agent memilih workflow.",
  "Reservation Service menjalankan operasi.",
  "PostgreSQL menyimpan atau mengambil data.",
  "Agent menyusun respons.",
  "Respons dikirim kembali ke pengguna.",
  "Handoff digunakan bila diperlukan.",
] as const;

const securityPrinciples = [
  ["Demo Database Isolation", "Data demo direncanakan terpisah dari data produksi.", "Planned for Demo"],
  ["Session Isolation", "Setiap sesi demo direncanakan memiliki konteks yang terisolasi.", "Planned for Demo"],
  ["Owner-Scoped Data Access", "Akses data reservation dibatasi berdasarkan kepemilikan di backend.", "Existing Core Principle"],
  ["Rate Limiting", "Permintaan publik akan dibatasi sebelum mencapai layanan demo.", "Planned for Demo"],
  ["Input Validation", "Data masuk divalidasi di boundary layanan sebelum diproses.", "Existing Core Principle"],
  ["Safe Error Responses", "Error dinormalisasi agar detail internal tidak terekspos.", "Planned for Demo"],
  ["No Secrets in Browser", "Credential dan system prompt tidak boleh dikirim ke browser.", "Design Target"],
  ["Simulated Demo Handoff", "Demo publik akan memakai handoff simulasi, bukan admin produksi.", "Planned for Demo"],
  ["Data Expiration", "Data demo sementara akan memiliki kebijakan cleanup yang direncanakan.", "Planned for Demo"],
  ["Least Privilege", "Setiap lapisan dibatasi hanya pada akses yang diperlukan.", "Existing Core Principle"],
] as const;

const decisions = [
  ["Channel terpisah dari agent core", "Telegram dan future web demo dapat memakai core yang sama tanpa mencampur interface."],
  ["Service layer untuk aturan bisnis", "Workflow reservasi diposisikan sebagai layanan, bukan detail channel."],
  ["Database tetap di backend", "Browser dan LLM tidak menjadi pemilik kredensial atau koneksi database."],
  ["Deterministic NLU untuk intent eksplisit", "Intent penting dapat menggunakan alur yang terkontrol dan dapat diaudit."],
  ["Peran LLM dibatasi", "LLM membantu interpretasi dan respons, bukan ownership atau otorisasi data."],
  ["BFF untuk demo publik", "Next.js Route Handler direncanakan sebagai boundary publik untuk demo."],
  ["Database demo terpisah", "Demo publik tidak boleh menyentuh database atau kredensial produksi."],
  ["Handoff simulasi di demo", "Jalur demo direncanakan aman tanpa menghubungi admin operasional."],
] as const;

export default function ArchitecturePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div className="absolute left-[-12rem] top-[-10rem] -z-10 size-[32rem] rounded-full bg-emerald-500/10 blur-[120px]" aria-hidden="true" />
        <PageContainer className="py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-500">
            <Link href="/projects" className="transition-colors hover:text-emerald-300">Projects</Link>
            <span className="mx-2 text-slate-700" aria-hidden="true">/</span>
            <span aria-current="page" className="text-slate-300">Architecture</span>
          </nav>
        </PageContainer>
        <PageContainer className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />System architecture</p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-50 sm:text-6xl">Arsitektur AI Agent yang <span className="text-emerald-300">memisahkan tanggung jawab.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">AURA dirancang agar channel, logika percakapan, layanan bisnis, dan data dapat berkembang dengan batas yang jelas.</p>
            <div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs text-emerald-300">STATUS: IN DEVELOPMENT</span><span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-mono text-xs text-slate-400">MODULAR DESIGN TARGET</span></div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects/aura">Lihat AURA Case Study</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">Buka Demo Interface</ButtonLink></div>
          </div>
          <TerminalPanel label="system specification"><dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">{[["SYSTEM", "AURA"], ["ARCHITECTURE", "MODULAR"], ["PRIMARY CHANNEL", "TELEGRAM"], ["WEB DEMO", "IN DEVELOPMENT"], ["DATA LAYER", "POSTGRESQL"], ["AI PROVIDER", "OLLAMA / OPENAI"]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-800 pb-3 last:border-0 last:pb-0"><dt className="text-slate-500">{label}</dt><dd className="text-right text-emerald-300">{value}</dd></div>)}</dl></TerminalPanel>
        </PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">01 / Architecture overview</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">Satu sistem, batas yang dapat dijelaskan.</h2></div><div className="max-w-2xl space-y-5 text-base leading-8 text-slate-400"><p>Channel menerima pesan; service memvalidasi identitas dan konteks; orchestrator menentukan alur agent; Reservation Service menangani aturan bisnis; repository mengakses data.</p><p>LLM membantu memahami dan menyusun respons, tetapi tidak mendapat akses langsung ke database. Admin handoff tetap tersedia sebagai jalur eskalasi ketika bantuan manusia diperlukan.</p></div></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-6"><p className="font-mono text-xs text-emerald-300">INPUT</p><h3 className="mt-3 font-semibold text-slate-100">Channel &amp; context</h3><p className="mt-3 text-sm leading-6 text-slate-400">Pesan masuk dan konteks dipisahkan dari aturan agent.</p></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs text-cyan-300">DECISION</p><h3 className="mt-3 font-semibold text-slate-100">Agent &amp; workflow</h3><p className="mt-3 text-sm leading-6 text-slate-400">Intent diterjemahkan menjadi workflow yang terstruktur.</p></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs text-slate-500">CONTROL</p><h3 className="mt-3 font-semibold text-slate-100">Data &amp; handoff</h3><p className="mt-3 text-sm leading-6 text-slate-400">Akses data dan jalur eskalasi tetap di bawah kendali backend.</p></article></div>
        </PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">02 / Current AURA architecture</p><h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">Alur AURA saat ini, dari channel hingga data.</h2><TerminalPanel label="current flow" className="mt-10"><div className="grid gap-2 p-5 font-mono text-xs sm:p-7 sm:text-sm"><div className="rounded-lg border border-slate-700 p-3 text-slate-200">Telegram</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-slate-700 p-3 text-slate-200">FastAPI / Telegram Adapter</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-slate-700 p-3 text-slate-200">Authenticated Chat Service</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-3 text-emerald-200">Agent Orchestrator</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Indonesian NLU</div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Reservation Workflow</div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Ollama / OpenAI</div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Admin Handoff</div></div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-slate-700 p-3 text-slate-200">Reservation Service</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] p-3 text-cyan-200">PostgreSQL</div></div></TerminalPanel><p className="mt-5 max-w-3xl text-sm leading-7 text-slate-400">Diagram ini menjelaskan lapisan saat ini secara konseptual. Setiap node memiliki label teks sehingga alur tetap dapat dipahami tanpa bergantung pada warna.</p></PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">03 / Layer breakdown</p><div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{layerCards.map((layer) => <article key={layer.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><div className="flex items-center justify-between gap-4"><span className="font-mono text-xs text-emerald-300">{layer.number}</span><span className="rounded-full border border-slate-700 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-slate-400">{layer.status}</span></div><h2 className="mt-6 text-lg font-semibold text-slate-100">{layer.title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{layer.description}</p><p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">{layer.reason}</p></article>)}</div></PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">04 / Request flow</p><div className="mt-9 grid gap-3 md:grid-cols-2">{requestFlow.map((step, index) => <article key={step} className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5"><span className="grid size-8 shrink-0 place-items-center rounded-lg border border-emerald-400/15 bg-emerald-400/5 font-mono text-xs text-emerald-300">{String(index + 1).padStart(2, "0")}</span><p className="pt-1 text-sm leading-6 text-slate-300">{step}</p></article>)}</div><p className="mt-6 max-w-3xl rounded-xl border border-cyan-400/15 bg-cyan-400/[0.035] px-5 py-4 text-sm leading-7 text-slate-400">LLM membantu interpretasi dan respons, tetapi tidak menentukan ownership atau koneksi database.</p></PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">05 / Planned public demo architecture</p><h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">Target desain untuk demo yang benar-benar terisolasi.</h2><TerminalPanel label="planned demo architecture" className="mt-10"><div className="grid gap-2 p-5 font-mono text-xs sm:p-7 sm:text-sm"><div className="rounded-lg border border-slate-700 p-3 text-slate-200">Browser</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-slate-700 p-3 text-slate-200">Next.js Portfolio</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-slate-700 p-3 text-slate-200">Next.js Route Handlers / BFF</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-3 text-emerald-200">AURA Demo FastAPI</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Demo Session Service</div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Rate Limiting</div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">AURA Agent Core</div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Dedicated LLM Configuration</div></div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Simulated Handoff</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] p-3 text-cyan-200">Dedicated Demo PostgreSQL</div></div><div className="border-t border-emerald-400/15 px-5 py-4 sm:px-7"><p className="font-mono text-xs leading-6 text-emerald-300">PLANNED ARCHITECTURE · DESIGN TARGET · IMPLEMENTATION PENDING</p></div></TerminalPanel><div className="mt-5 grid gap-3 sm:grid-cols-3"><p className="rounded-xl border border-red-400/15 bg-red-400/[0.035] px-4 py-3 font-mono text-xs text-red-200">NO SHARED DATABASE</p><p className="rounded-xl border border-red-400/15 bg-red-400/[0.035] px-4 py-3 font-mono text-xs text-red-200">NO PRODUCTION CREDENTIALS</p><p className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] px-4 py-3 font-mono text-xs text-emerald-200">ISOLATED DEMO DATA</p></div></PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">06 / Trust boundaries</p><div className="mt-9 grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="text-lg font-semibold text-slate-100">Browser Boundary</h2><p className="mt-3 text-sm leading-6 text-slate-400">Browser tidak boleh menerima database credential, LLM API key, backend JWT internal, system prompt, atau production URL sensitif.</p></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="text-lg font-semibold text-slate-100">BFF Boundary</h2><p className="mt-3 text-sm leading-6 text-slate-400">Next.js Route Handler direncanakan menerima request publik, mengelola cookie HttpOnly, menormalisasi error, dan menyembunyikan URL backend.</p></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="text-lg font-semibold text-slate-100">Backend Boundary</h2><p className="mt-3 text-sm leading-6 text-slate-400">FastAPI bertanggung jawab memvalidasi session, menegakkan ownership, membatasi tool, mengakses database, dan mengontrol panggilan LLM.</p></article><article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-6"><h2 className="text-lg font-semibold text-slate-100">Data Boundary</h2><p className="mt-3 text-sm leading-6 text-slate-400">Database demo dan production harus benar-benar terpisah agar demo publik tidak menyentuh data operasional.</p></article></div></PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">07 / Security principles</p><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{securityPrinciples.map(([title, description, status]) => <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="text-base font-semibold text-slate-100">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p><p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.11em] text-emerald-300">{status}</p></article>)}</div></PageContainer></section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">08 / Demo vs production</p><div className="mt-9 grid gap-5 lg:grid-cols-2"><article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-7"><h2 className="text-xl font-semibold text-slate-100">Demo Environment</h2><ul className="mt-5 grid gap-3 text-sm text-slate-400">{["Database khusus demo.", "Data sementara dan session anonim.", "Rate limit ketat serta credential khusus demo.", "Simulated handoff dan cleanup otomatis yang direncanakan."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}</ul></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7"><h2 className="text-xl font-semibold text-slate-100">Production Environment</h2><ul className="mt-5 grid gap-3 text-sm text-slate-400">{["Database produksi dan integrasi operasional nyata.", "Telegram admin serta konfigurasi production.", "Tidak dapat diakses oleh demo publik."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />{item}</li>)}</ul></article></div><p className="mt-5 text-sm font-medium text-emerald-300">Demo publik tidak boleh menyentuh database produksi.</p></PageContainer></section>

      <section className="bg-[#080e19] py-16 sm:py-24"><PageContainer className="grid gap-12 lg:grid-cols-2"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">09 / Technology map</p><div className="mt-7 grid gap-3">{[["Frontend Portfolio", "Next.js · TypeScript · Tailwind CSS", "Menyajikan portofolio, studi kasus, dan interface demo statis."], ["AURA Backend", "Python · FastAPI", "Menjadi boundary layanan untuk core AURA."], ["Data", "PostgreSQL", "Persistence untuk reservation workflow."], ["AI", "Ollama · OpenAI · Indonesian NLU", "Provider dan kemampuan pemahaman bahasa yang dibatasi aplikasi."], ["Channel", "Telegram · Future Web Demo", "Channel saat ini dan arah pengembangan berikutnya."]].map(([title, stack, description]) => <article key={title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"><p className="font-mono text-xs text-emerald-300">{title}</p><h2 className="mt-3 text-lg font-semibold text-slate-100">{stack}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></article>)}</div></div><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">10 / Architecture decisions</p><div className="mt-7 grid gap-3">{decisions.map(([title, description], index) => <article key={title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"><div className="flex items-center justify-between gap-4"><h2 className="text-sm font-semibold text-slate-100">{title}</h2>{index > 4 ? <span className="font-mono text-[0.65rem] text-cyan-300">PLANNED</span> : null}</div><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></article>)}</div></div></PageContainer></section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">11 / Current status</p><div className="mt-8 grid gap-5 lg:grid-cols-3"><article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-6"><h2 className="font-semibold text-slate-100">Existing in AURA</h2><p className="mt-3 text-sm leading-6 text-slate-400">FastAPI backend, PostgreSQL persistence, reservation operations, Indonesian NLU, Telegram integration, Ollama/OpenAI support, dan admin handoff.</p></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="font-semibold text-slate-100">Existing in Portfolio</h2><p className="mt-3 text-sm leading-6 text-slate-400">Static website, project pages, case study, dan static demo interface.</p></article><article className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-6"><h2 className="font-semibold text-slate-100">Planned Next</h2><p className="mt-3 text-sm leading-6 text-slate-400">BFF Route Handlers, isolated demo session, demo database, rate limiting, chat integration, simulated handoff, dan deployment.</p></article></div></PageContainer></section>

      <section className="bg-[#080e19] py-16 sm:py-24"><PageContainer><div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-900 px-7 py-12 sm:px-12 sm:py-16"><div className="absolute -right-24 -top-24 size-80 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" /><div className="relative max-w-3xl"><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Next step</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-5xl">Lihat sistem AURA dari konteks yang tepat.</h2><p className="mt-5 text-base leading-7 text-slate-400">Backend integration untuk demo masih dalam pengembangan. Case study dan interface demo tetap dapat dieksplorasi sebagai materi portofolio statis.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects/aura">Lihat AURA Case Study</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">Buka Demo Interface</ButtonLink><ButtonLink href="/contact" variant="secondary">Hubungi Saya</ButtonLink></div></div></div></PageContainer></section>
    </>
  );
}
