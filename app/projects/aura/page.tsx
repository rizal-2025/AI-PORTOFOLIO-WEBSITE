import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "AURA Case Study",
  description:
    "Kerangka studi kasus AURA, AI reservation dan customer-service agent berbahasa Indonesia.",
};

const featureCards = [
  ["Create Reservation", "Membantu menyusun detail reservasi dari percakapan pengguna.", "Core capability"],
  ["Check Reservation", "Mengarahkan pengecekan reservasi berdasarkan detail yang tersedia.", "Core capability"],
  ["Update Reservation", "Menyiapkan perubahan reservasi setelah detailnya dikonfirmasi.", "Implemented in AURA"],
  ["Cancel Reservation", "Mendukung alur pembatalan dengan pengecekan data yang relevan.", "Implemented in AURA"],
  ["Indonesian NLU", "Memahami variasi bahasa Indonesia dalam intent yang umum digunakan.", "Core capability"],
  ["Admin Handoff", "Menyediakan jalur aman ketika percakapan membutuhkan bantuan manusia.", "Demo integration pending"],
] as const;

const solutionFlow = [
  "User message",
  "Indonesian NLU",
  "Intent detection",
  "Reservation workflow",
  "PostgreSQL",
  "Agent response",
  "Optional admin handoff",
] as const;

const stackGroups = [
  ["Agent & Backend", "Python · FastAPI · Indonesian NLU", "Menangani API boundary, pemahaman intent, dan alur agent."],
  ["Data", "PostgreSQL", "Menyediakan persistence untuk data reservasi yang diperlukan oleh layanan."],
  ["AI Provider", "Ollama · OpenAI", "Pilihan provider untuk dukungan model bahasa sesuai kebutuhan pengembangan."],
  ["Channel", "Telegram · Web demo dalam pengembangan", "Channel percakapan dipisahkan dari core agar dapat dikembangkan bertahap."],
] as const;

const challenges = [
  "Memahami variasi bahasa Indonesia dan detail yang tidak selalu lengkap.",
  "Menjaga konteks percakapan saat pengguna mengubah permintaan.",
  "Memastikan operasi reservasi mengikuti intent dan konfirmasi yang tepat.",
  "Menjaga ownership data serta batas akses reservasi.",
  "Memisahkan agent core dari channel Telegram agar extensible.",
  "Menyediakan handoff yang jelas ke manusia saat diperlukan.",
] as const;

const decisions = [
  ["FastAPI boundary", "Memisahkan interface API dari logika agent dan layanan reservasi."],
  ["PostgreSQL persistence", "Menjadi lapisan data terstruktur untuk kebutuhan reservation workflow."],
  ["Deterministic NLU", "Digunakan untuk intent eksplisit yang membutuhkan alur terkontrol."],
  ["LLM with guardrails", "Mendukung percakapan tanpa memberi model akses langsung ke database."],
  ["Shared service layer", "Membuka jalur agar Telegram dan web memakai core yang sama."],
  ["Owner-scoped access", "Fokus desain untuk menjaga akses reservasi tetap sesuai kepemilikan."],
] as const;

export default function AuraCaseStudyPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13] text-white">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div className="absolute right-[-10rem] top-[-12rem] -z-10 size-[34rem] rounded-full bg-emerald-500/10 blur-[120px]" aria-hidden="true" />
        <PageContainer className="py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-500">
            <Link href="/projects" className="transition-colors hover:text-emerald-300">Projects</Link>
            <span className="mx-2 text-slate-700" aria-hidden="true">/</span>
            <span aria-current="page" className="text-slate-300">AURA</span>
          </nav>
        </PageContainer>
        <PageContainer className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Featured AI agent
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.055em] text-slate-50 sm:text-7xl">
              AURA
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-200 sm:text-2xl">
              AI reservation dan customer-service agent untuk percakapan berbahasa Indonesia.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              Studi kasus ini merangkum pendekatan produk dan engineering AURA—dari
              intent pengguna, workflow reservasi, hingga jalur handoff ke admin.
            </p>
            <div className="mt-8 flex flex-wrap gap-2" aria-label="Metadata proyek">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs text-emerald-300">STATUS: DEVELOPMENT</span>
              <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-mono text-xs text-slate-400">ROLE: {siteConfig.featuredProject.role}</span>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/demo/aura">
                Coba interface demo <span className="ml-2" aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink href="/projects" variant="secondary">
                Kembali ke projects
              </ButtonLink>
            </div>
          </div>
          <TerminalPanel label="aura system">
            <dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">
              {[
                ["MODE", "RESERVATION AGENT"],
                ["LANGUAGE", "INDONESIAN"],
                ["CHANNEL", "TELEGRAM / WEB PLANNED"],
                ["STATE", "DEVELOPMENT"],
                ["CORE", "ACTIVE"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right text-emerald-300">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="border-t border-slate-800 px-5 py-3 text-xs leading-5 text-slate-500">
              Web demo interface dalam pengembangan.
            </p>
          </TerminalPanel>
        </PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">01 / Overview</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">Menerjemahkan percakapan ke alur yang jelas.</h2>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-8 text-slate-400">
              <p>AURA adalah AI reservation dan customer-service agent yang membantu pengguna menyampaikan kebutuhan reservasi melalui percakapan berbahasa Indonesia.</p>
              <p>Sistem ini relevan bagi operasional yang menangani pertanyaan umum, perubahan jadwal, pembatalan, dan kebutuhan eskalasi ke customer service.</p>
              <p>Bahasa yang natural penting karena pelanggan tidak selalu menyampaikan detail dengan format yang sama. AURA difokuskan untuk memahami intent, mengumpulkan informasi yang dibutuhkan, dan menjaga jalur bantuan manusia tetap tersedia.</p>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">02 / Business problem</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-100">Masalah yang ditangani</h2>
              <ul className="mt-6 grid gap-4 text-sm leading-6 text-slate-400">
                {["Reservasi dan pertanyaan umum dilakukan secara berulang.", "Pelanggan menggunakan bahasa dan detail permintaan yang bervariasi.", "Perubahan atau pembatalan membutuhkan pengecekan data.", "Customer service membutuhkan jalur eskalasi yang jelas."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}
              </ul>
            </article>
            <article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-7 sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-100">Dampak operasional</h2>
              <p className="mt-6 text-sm leading-7 text-slate-400">Alur manual dapat melambat ketika informasi perlu dicek ulang atau berpindah antar anggota tim. Tanpa pola percakapan yang konsisten, kebutuhan pelanggan juga lebih mudah kehilangan konteks.</p>
              <p className="mt-4 text-sm leading-7 text-slate-400">AURA menjadi pendekatan untuk membangun alur yang lebih terstruktur tanpa menghilangkan titik kontrol manusia.</p>
            </article>
          </div>
        </PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">03 / Solution flow</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">Satu pesan, beberapa lapisan keputusan yang dapat dijelaskan.</h2>
          <div className="mt-10 flex flex-wrap items-stretch gap-3" aria-label="Alur solusi AURA dari pesan pengguna hingga handoff admin opsional">
            {solutionFlow.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="min-w-36 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-center text-sm font-medium text-slate-200">{step}</div>
                {index < solutionFlow.length - 1 ? <span className="font-mono text-emerald-300" aria-hidden="true">→</span> : null}
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-400">Setiap node menjelaskan langkah dalam alur; admin handoff tetap tersedia sebagai jalur opsional ketika agent tidak seharusnya menyelesaikan permintaan sendiri.</p>
        </PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">04 / Core features</p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map(([title, description, status], index) => (
              <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl border border-emerald-400/15 bg-emerald-400/5 text-emerald-300"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14M12 5v14" /><circle cx="12" cy="12" r="8" /></svg></span><span className="font-mono text-xs text-slate-600">0{index + 1}</span></div>
                <h2 className="mt-6 text-lg font-semibold text-slate-100">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
                <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-emerald-300">{status}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">05 / Conversation flow</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">Contoh percakapan yang terarah.</h2><p className="mt-5 text-base leading-7 text-slate-400">Ilustrasi ini menunjukkan bentuk pengalaman percakapan, bukan interface aktif atau hasil dari server live.</p></div>
          <TerminalPanel label="conversation sample">
            <div className="space-y-4 p-5 sm:p-6" aria-label="Contoh percakapan AURA">
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-700 bg-slate-900 px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">Pengguna</p><p className="mt-2 text-sm leading-6 text-slate-200">Saya ingin reservasi untuk besok jam 7 malam, 4 orang.</p></div>
              <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-sm border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-emerald-300">AURA</p><p className="mt-2 text-sm leading-6 text-slate-200">Baik. Reservasi akan dibuat untuk 4 orang besok pukul 19.00. Apakah detailnya sudah benar?</p></div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-700 bg-slate-900 px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">Pengguna</p><p className="mt-2 text-sm leading-6 text-slate-200">Ya, benar.</p></div>
              <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-sm border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-emerald-300">AURA</p><p className="mt-2 text-sm leading-6 text-slate-200">Reservasi berhasil dicatat.</p></div>
            </div>
          </TerminalPanel>
        </PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">06 / Technology stack</p>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {stackGroups.map(([title, technology, description]) => <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">{title}</p><h2 className="mt-4 text-xl font-semibold text-slate-100">{technology}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p></article>)}
          </div>
        </PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">07 / Architecture preview</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-4xl">Boundary yang jelas antara channel, agent, dan data.</h2><p className="mt-5 text-base leading-7 text-slate-400">Halaman Architecture menyediakan penjelasan lebih mendalam tentang rancangan sistem ini.</p><Link href="/architecture" className="mt-6 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200">Lihat arsitektur lengkap <span className="ml-2" aria-hidden="true">→</span></Link></div>
          <TerminalPanel label="architecture preview"><div className="grid gap-2 p-5 font-mono text-xs sm:p-6 sm:text-sm"><div className="rounded-lg border border-slate-700 p-3 text-slate-200">Telegram / Future Web Demo</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-slate-700 p-3 text-slate-200">FastAPI Boundary</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-slate-700 p-3 text-slate-200">Authenticated Chat Service</div><span className="text-center text-emerald-300" aria-hidden="true">↓</span><div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-3 text-emerald-200">Agent Orchestrator</div><div className="grid gap-2 sm:grid-cols-3"><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Reservation Service ↓ PostgreSQL</div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Ollama / OpenAI</div><div className="rounded-lg border border-slate-700 p-3 text-slate-300">Admin Handoff</div></div></div></TerminalPanel>
        </PageContainer>
      </section>

      <section className="border-y border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">08 / Technical challenges</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50">Area yang terus dikembangkan.</h2><ul className="mt-7 grid gap-4 text-sm leading-6 text-slate-400">{challenges.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}</ul><p className="mt-6 text-sm leading-7 text-slate-500">Ini adalah fokus desain dan pengembangan berkelanjutan, bukan klaim bahwa seluruh tantangan telah terselesaikan sempurna.</p></div>
          <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">09 / Design decisions</p><div className="mt-7 grid gap-3">{decisions.map(([title, description]) => <article key={title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"><h2 className="text-sm font-semibold text-slate-100">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></article>)}</div></div>
        </PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">10 / Current status</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2"><article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-7"><h2 className="text-xl font-semibold text-slate-100">Sudah tersedia pada AURA</h2><ul className="mt-5 grid gap-3 text-sm text-slate-400">{["Create, update, cancel, dan check reservation.", "Indonesian NLU.", "Telegram integration.", "Admin handoff."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}</ul></article><article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7"><h2 className="text-xl font-semibold text-slate-100">Sedang dikembangkan untuk portofolio</h2><ul className="mt-5 grid gap-3 text-sm text-slate-400">{["Public web demo dan isolated demo session.", "Demo database serta rate limiting.", "Demo-specific handoff.", "Deployment."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />{item}</li>)}</ul></article></div>
        </PageContainer>
      </section>

      <section className="border-t border-slate-800 bg-[#050a13] py-16 sm:py-24">
        <PageContainer><div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-900 px-7 py-12 sm:px-12 sm:py-16"><div className="absolute -right-24 -top-24 size-80 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" /><div className="relative max-w-3xl"><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Continue the exploration</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-5xl">Ingin melihat arah pengembangan AURA?</h2><p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">Interface demo masih dalam pengembangan backend integration. Anda tetap dapat melihat placeholder interface, arsitektur, atau memulai percakapan.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/demo/aura">Coba interface demo</ButtonLink><ButtonLink href="/architecture" variant="secondary">Lihat arsitektur</ButtonLink><ButtonLink href="/contact" variant="secondary">Hubungi saya</ButtonLink></div></div></div></PageContainer>
      </section>
    </>
  );
}
