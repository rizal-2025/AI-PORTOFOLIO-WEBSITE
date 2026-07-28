import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Hubungi AI Engineer untuk mendiskusikan proyek AI Agent atau peluang kerja.",
};

const inputStyles =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-500 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-80";

export default function ContactPage() {
  const contactMethods = [
    {
      label: "Email",
      value: siteConfig.contact.email,
      href: siteConfig.contact.email ? `mailto:${siteConfig.contact.email}` : null,
      fallback: "Belum tersedia",
    },
    {
      label: "LinkedIn",
      value: siteConfig.contact.linkedin,
      href: siteConfig.contact.linkedin,
      fallback: "Coming soon",
    },
    {
      label: "GitHub",
      value: siteConfig.contact.github,
      href: siteConfig.contact.github,
      fallback: "Coming soon",
    },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div className="absolute right-[-10rem] top-[-12rem] -z-10 size-[32rem] rounded-full bg-emerald-500/10 blur-[120px]" aria-hidden="true" />
        <PageContainer className="py-8 sm:py-10"><nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-500"><Link href="/" className="transition-colors hover:text-emerald-300">Home</Link><span className="mx-2 text-slate-700" aria-hidden="true">/</span><span aria-current="page" className="text-slate-300">Contact</span></nav></PageContainer>
        <PageContainer className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end"><div><p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />Contact channel</p><h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-50 sm:text-6xl">Mari diskusikan apa yang bisa dibangun dengan <span className="text-emerald-300">AI.</span></h1><p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">Kanal kontak dan form di halaman ini masih berupa preview statis. Detail yang benar dapat diisi melalui konfigurasi situs.</p></div><TerminalPanel label="channel status"><dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">{[["EMAIL", siteConfig.contact.email ? "AVAILABLE" : "PLACEHOLDER"], ["LINKEDIN", siteConfig.contact.linkedin ? "AVAILABLE" : "COMING SOON"], ["GITHUB", siteConfig.contact.github ? "AVAILABLE" : "COMING SOON"], ["FORM", "STATIC"], ["RESPONSE", "MANUAL"]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-800 pb-3 last:border-0 last:pb-0"><dt className="text-slate-500">{label}</dt><dd className="text-right text-emerald-300">{value}</dd></div>)}</dl></TerminalPanel></PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <div className="grid gap-5 md:grid-cols-3">{contactMethods.map((method) => <article key={method.label} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">{method.label}</p><p className="mt-4 break-words text-lg font-semibold text-slate-100">{method.value ?? method.fallback}</p>{method.href ? <a href={method.href} className="mt-5 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200" {...(method.label === "Email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}>Buka kanal <span className="ml-2" aria-hidden="true">↗</span></a> : <p className="mt-5 text-sm leading-6 text-slate-500">Isi data ini di <code className="break-all font-mono text-cyan-300">config/site.ts</code> untuk mengaktifkan kanal.</p>}</article>)}</div>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-7 sm:p-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">Static contact form</p><h2 className="mt-3 text-2xl font-semibold text-slate-50">Ceritakan kebutuhan Anda</h2><p id="form-help" className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Form submission belum terhubung. Field ditampilkan untuk preview pengalaman; tidak ada data dikirim atau disimpan.</p></div><span className="rounded-full border border-slate-700 px-3 py-1 font-mono text-[0.65rem] text-slate-400">SUBMISSION DISABLED</span></div><form className="mt-8 space-y-6" aria-describedby="form-help"><div className="grid gap-6 sm:grid-cols-2"><label className="text-sm font-medium text-slate-300">Nama<input type="text" name="name" disabled aria-disabled="true" placeholder="Nama lengkap" className={inputStyles} /></label><label className="text-sm font-medium text-slate-300">Email<input type="email" name="email" disabled aria-disabled="true" placeholder="nama@perusahaan.com" className={inputStyles} /></label></div><label className="block text-sm font-medium text-slate-300">Perusahaan / Organisasi<input type="text" name="organization" disabled aria-disabled="true" placeholder="Nama organisasi" className={inputStyles} /></label><label className="block text-sm font-medium text-slate-300">Kebutuhan singkat<textarea name="message" rows={6} disabled aria-disabled="true" placeholder="Ceritakan konteks, tujuan, atau tantangan yang sedang Anda hadapi." className={inputStyles} /></label><button type="button" disabled aria-disabled="true" className="rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-400 disabled:cursor-not-allowed">Kirim pesan — belum terhubung</button></form></section>

          <div className="mt-8 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">Project inquiry guidance</p><h2 className="mt-4 text-xl font-semibold text-slate-100">Informasi yang membantu percakapan awal</h2><ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-400">{["Masalah yang ingin diselesaikan.", "Proses bisnis saat ini.", "Channel yang digunakan.", "Kebutuhan integrasi.", "Target waktu.", "Batasan keamanan atau data."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}</ul><p className="mt-5 text-xs leading-5 text-slate-500">Jangan mengirim credential, password, API key, atau data pelanggan sensitif melalui form ini.</p></section><TerminalPanel label="availability"><dl className="grid gap-3 p-5 text-sm"><div className="flex justify-between gap-5"><dt className="text-slate-500">Availability</dt><dd className="text-slate-200">{siteConfig.owner.availability ?? "Belum ditentukan"}</dd></div><div className="flex justify-between gap-5"><dt className="text-slate-500">Project type</dt><dd className="text-right text-slate-200">AI Agent / Backend — placeholder</dd></div><div className="flex justify-between gap-5"><dt className="text-slate-500">Location</dt><dd className="text-slate-200">{siteConfig.owner.location ?? "Lokasi belum diisi"}</dd></div><div className="flex justify-between gap-5"><dt className="text-slate-500">Response time</dt><dd className="text-slate-200">Belum ditentukan</dd></div></dl></TerminalPanel></div>

          <aside className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 px-6 py-5"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">Privacy notice</p><p className="mt-3 text-sm leading-7 text-slate-400">Form belum aktif, sehingga data tidak dikirim atau disimpan. Jangan mengirim data sensitif. Jika form dihubungkan di masa depan, cara pengelolaan data akan dijelaskan secara terpisah.</p></aside>

          <section className="mt-10 rounded-3xl border border-emerald-400/20 bg-slate-900 px-7 py-10 sm:px-10"><p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-300">Explore the work</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50">Lihat sistem dan konteks di balik AURA.</h2><div className="mt-7 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects">Lihat Projects</ButtonLink><ButtonLink href="/projects/aura" variant="secondary">Lihat AURA</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">Buka Demo Interface</ButtonLink></div></section>
        </PageContainer>
      </section>
    </>
  );
}
