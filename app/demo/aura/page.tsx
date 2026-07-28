import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { TerminalPanel } from "@/components/ui/terminal-panel";

export const metadata: Metadata = {
  title: "AURA Demo",
  description:
    "Placeholder interface untuk demo interaktif AURA yang akan diintegrasikan pada tahap berikutnya.",
};

const suggestedPrompts = [
  "Buat reservasi untuk besok jam 7 malam.",
  "Cek reservasi saya.",
  "Ubah reservasi menjadi jam 8 malam.",
  "Batalkan reservasi saya.",
  "Saya ingin bicara dengan admin.",
] as const;

const availableCapabilities = [
  "Create Reservation",
  "Check Reservation",
  "Update Reservation",
  "Cancel Reservation",
  "Indonesian NLU",
  "Admin Handoff",
] as const;

const plannedWebDemo = [
  "Session isolation",
  "Demo database",
  "Rate limiting",
  "Live chat API",
  "Simulated handoff",
] as const;

export default function AuraDemoPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div className="absolute right-[-10rem] top-[-12rem] -z-10 size-[32rem] rounded-full bg-emerald-500/10 blur-[120px]" aria-hidden="true" />
        <PageContainer className="py-8 sm:py-10"><nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-500"><Link href="/projects/aura" className="transition-colors hover:text-emerald-300">AURA</Link><span className="mx-2 text-slate-700" aria-hidden="true">/</span><span aria-current="page" className="text-slate-300">Demo</span></nav></PageContainer>
        <PageContainer className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />AURA demo interface</p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-50 sm:text-6xl">Preview pengalaman percakapan dengan <span className="text-emerald-300">AURA.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">Tampilan produk statis untuk memperlihatkan bagaimana AURA dapat menangani reservasi dan customer service dalam bahasa Indonesia.</p>
            <div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs text-emerald-300">INTERFACE: READY</span><span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-mono text-xs text-slate-400">BACKEND: NOT CONNECTED</span></div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects/aura">Lihat AURA Case Study</ButtonLink><ButtonLink href="/architecture" variant="secondary">Lihat Architecture</ButtonLink></div>
          </div>
          <TerminalPanel label="demo status"><dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">{[["INTERFACE", "READY"], ["BACKEND", "NOT CONNECTED"], ["DATABASE", "NOT CONNECTED"], ["SESSION", "STATIC PREVIEW"], ["MODE", "SAFE DEMO"]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-800 pb-3 last:border-0 last:pb-0"><dt className="text-slate-500">{label}</dt><dd className="text-right text-emerald-300">{value}</dd></div>)}</dl></TerminalPanel>
        </PageContainer>
      </section>

      <section className="bg-[#080e19] py-12 sm:py-16">
        <PageContainer>
          <aside className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.045] px-5 py-5 sm:px-6" aria-labelledby="demo-safety-title">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p id="demo-safety-title" className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Static preview notice</p><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">Halaman ini belum terhubung ke backend. Tidak ada reservasi nyata dibuat, data tidak dikirim atau disimpan, dan jangan memasukkan data pribadi. Backend demo yang aman masih dalam pengembangan.</p></div><span className="rounded-full border border-amber-300/20 px-3 py-1 font-mono text-[0.65rem] text-amber-200">SAFE TO EXPLORE</span></div>
          </aside>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950/80 shadow-2xl shadow-black/20" aria-labelledby="chat-title">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/70 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-xs font-bold text-emerald-300" aria-hidden="true">AU</span><div><h2 id="chat-title" className="text-sm font-semibold text-slate-100">AURA Assistant</h2><p className="mt-0.5 text-xs text-slate-500">Reservation support · illustration</p></div></div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 font-mono text-xs text-slate-400"><span className="size-1.5 rounded-full bg-slate-500" aria-hidden="true" />OFFLINE PREVIEW</span>
              </header>

              <div className="space-y-5 bg-[#080e19] p-5 sm:p-7" aria-label="Contoh percakapan AURA statis">
                <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-700 bg-slate-900 px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">User</p><p className="mt-2 text-sm leading-6 text-slate-200">Saya ingin reservasi besok jam 7 malam untuk 4 orang.</p></div>
                <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-sm border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-emerald-300">AURA</p><p className="mt-2 text-sm leading-6 text-slate-200">Baik. Saya mencatat reservasi untuk 4 orang besok pukul 19.00. Apakah detailnya sudah benar?</p></div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-700 bg-slate-900 px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">User</p><p className="mt-2 text-sm leading-6 text-slate-200">Ya, benar.</p></div>
                <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-sm border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-emerald-300">AURA</p><p className="mt-2 text-sm leading-6 text-slate-200">Dalam demo aktif, reservasi akan dibuat setelah konfirmasi. Saat ini halaman masih berupa preview statis.</p></div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-700 bg-slate-900 px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">User</p><p className="mt-2 text-sm leading-6 text-slate-200">Tolong ubah menjadi jam 8 malam.</p></div>
                <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-sm border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3"><p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-emerald-300">AURA</p><p className="mt-2 text-sm leading-6 text-slate-200">Dalam demo aktif, saya akan mencari reservasi sesi Anda dan meminta konfirmasi sebelum memperbaruinya.</p></div>
              </div>

              <form className="border-t border-slate-700/70 p-4 sm:p-5" aria-describedby="composer-help">
                <label htmlFor="demo-message" className="sr-only">Pesan untuk AURA</label>
                <div className="flex flex-col gap-3 sm:flex-row"><textarea id="demo-message" disabled aria-disabled="true" placeholder="Ketik pesan untuk AURA..." rows={2} className="min-h-12 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-500 disabled:cursor-not-allowed disabled:opacity-80" /><div className="flex gap-3 sm:flex-col"><button type="button" disabled aria-disabled="true" className="flex-1 rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-400 disabled:cursor-not-allowed">Kirim</button><button type="button" disabled aria-disabled="true" className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed">Reset Demo</button></div></div>
                <p id="composer-help" className="mt-3 font-mono text-[0.68rem] text-slate-500">BACKEND INTEGRATION COMING NEXT</p>
              </form>
            </section>

            <aside className="space-y-5" aria-label="Informasi demo">
              <TerminalPanel label="session status"><dl className="grid gap-3 p-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">State</dt><dd className="font-mono text-emerald-300">Preview</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Isolation</dt><dd className="font-mono text-slate-400">Planned</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Expiry</dt><dd className="font-mono text-slate-400">Planned</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Rate limit</dt><dd className="font-mono text-slate-400">Planned</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Database</dt><dd className="font-mono text-slate-400">Not connected</dd></div></dl></TerminalPanel>
              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">Reservation preview</p><dl className="mt-5 grid gap-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">Nama</dt><dd className="text-slate-200">Dimas</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Tanggal</dt><dd className="text-slate-200">Besok</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Waktu</dt><dd className="text-slate-200">19.00</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Jumlah</dt><dd className="text-slate-200">4 orang</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Status</dt><dd className="text-right text-amber-200">Pending confirmation</dd></div></dl><p className="mt-5 border-t border-slate-800 pt-4 font-mono text-[0.65rem] text-slate-500">ILLUSTRATION ONLY · NO ACTIVE RESERVATION IN LIVE DEMO YET</p></section>
            </aside>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">Suggested prompts</p><div className="mt-5 flex flex-wrap gap-2">{suggestedPrompts.map((prompt) => <button key={prompt} type="button" disabled aria-disabled="true" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-left text-xs leading-5 text-slate-500 disabled:cursor-not-allowed">{prompt}</button>)}</div></section>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">Demo limitations</p><p className="mt-4 text-sm leading-7 text-slate-400">Preview ini tidak membuat reservasi, tidak mengirim notifikasi, tidak menyimpan data, dan tidak menghubungi sistem AURA produksi.</p></section>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">Available in AURA core</p><ul className="mt-5 grid gap-3 text-sm text-slate-400">{availableCapabilities.map((capability) => <li key={capability} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{capability}</li>)}</ul></section><section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-cyan-300">Not connected in web demo yet</p><ul className="mt-5 grid gap-3 text-sm text-slate-400">{plannedWebDemo.map((capability) => <li key={capability} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />{capability}</li>)}</ul></section></div>

          <section className="mt-8"><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Planned integration flow</p><div className="mt-5 flex flex-wrap items-center gap-3" aria-label="Alur integrasi demo yang direncanakan">{["User Message", "Demo Interface", "Planned BFF", "Planned AURA Demo API", "Planned Demo Database", "Safe Response"].map((step, index, steps) => <div key={step} className="flex items-center gap-3"><span className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">{step}</span>{index < steps.length - 1 ? <span className="font-mono text-emerald-300" aria-hidden="true">→</span> : null}</div>)}</div></section>

          <section className="mt-10"><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">UI state preview</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Loading", "AURA sedang memproses pesan..."], ["Error", "Demo belum dapat terhubung ke backend."], ["Rate Limit", "Terlalu banyak permintaan. Silakan coba beberapa saat lagi."], ["Session Expired", "Sesi demo telah berakhir. Mulai sesi baru untuk melanjutkan."]].map(([title, text]) => <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"><h2 className="font-semibold text-slate-100">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p><p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-slate-500">Static UI state</p></article>)}</div></section>

          <div className="mt-8 grid gap-5 lg:grid-cols-2"><TerminalPanel label="simulated handoff"><dl className="grid gap-3 p-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Handoff status</dt><dd className="text-emerald-300">Simulated</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Reference</dt><dd className="font-mono text-slate-300">DEMO-HO-0001</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Admin notification</dt><dd className="text-slate-400">Not sent</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Production Telegram</dt><dd className="text-slate-400">Not connected</dd></div></dl></TerminalPanel><section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">Privacy & data notice</p><ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-400">{["Gunakan data fiktif saat mengeksplorasi demo.", "Data demo nantinya bersifat sementara.", "Database demo akan terpisah dari production.", "Credential produksi tidak akan digunakan.", "Chat tidak digunakan sebagai data training tanpa persetujuan."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}</ul><p className="mt-5 text-xs leading-5 text-slate-500">Pernyataan ini menjelaskan arah desain, bukan kebijakan legal atau compliance.</p></section></div>

          <section className="mt-12"><div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-900 px-7 py-12 sm:px-12 sm:py-16"><div className="absolute -right-24 -top-24 size-80 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" /><div className="relative max-w-3xl"><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Explore the system</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50 sm:text-5xl">Tinjau konteks di balik interface demo.</h2><p className="mt-5 text-base leading-7 text-slate-400">Backend integration masih dalam pengembangan. Lihat studi kasus dan arsitektur untuk memahami arah pengembangan AURA.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects/aura">Lihat AURA Case Study</ButtonLink><ButtonLink href="/architecture" variant="secondary">Lihat Architecture</ButtonLink><ButtonLink href="/contact" variant="secondary">Hubungi Saya</ButtonLink></div></div></div></section>
        </PageContainer>
      </section>
    </>
  );
}
