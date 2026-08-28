import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { siteConfig } from "@/config/site";
import { defineLocalizedContent, selectLocalizedContent } from "@/lib/i18n/static-content";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hubungi AI Engineer untuk mendiskusikan proyek AI Agent atau peluang kerja.",
};

const inputStyles = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-500 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-80";

export const contactSectionIds = [
  "contact-hero",
  "contact-methods",
  "contact-form",
  "contact-guidance",
  "contact-privacy",
  "contact-explore",
] as const;

const content = defineLocalizedContent({
  "id-ID": {
    breadcrumbHome: "Beranda",
    breadcrumbCurrent: "Kontak",
    heroEyebrow: "Kanal kontak",
    heroTitle: "Mari diskusikan apa yang bisa dibangun dengan",
    heroDescription: "Kanal kontak dan formulir di halaman ini masih berupa pratinjau statis. Detail yang benar dapat diisi melalui konfigurasi situs.",
    statusLabel: "status kanal",
    statusRows: [
      ["EMAIL", "TERSEDIA"],
      ["LINKEDIN", "AKAN DATANG"],
      ["GITHUB", "AKAN DATANG"],
      ["FORMULIR", "STATIS"],
      ["RESPONS", "MANUAL"],
    ],
    unavailable: "Belum tersedia",
    comingSoon: "Akan datang",
    openChannel: "Buka kanal",
    configureChannel: "Isi data ini di config/site.ts untuk mengaktifkan kanal.",
    formEyebrow: "Formulir kontak statis",
    formTitle: "Ceritakan kebutuhan Anda",
    formHelp: "Pengiriman formulir belum terhubung. Kolom ditampilkan sebagai pratinjau pengalaman; tidak ada data yang dikirim atau disimpan.",
    submissionDisabled: "PENGIRIMAN DINONAKTIFKAN",
    name: "Nama",
    namePlaceholder: "Nama lengkap",
    email: "Email",
    emailPlaceholder: "nama@perusahaan.com",
    organization: "Perusahaan / Organisasi",
    organizationPlaceholder: "Nama organisasi",
    message: "Kebutuhan singkat",
    messagePlaceholder: "Ceritakan konteks, tujuan, atau tantangan yang sedang Anda hadapi.",
    sendDisabled: "Kirim pesan — belum terhubung",
    guidanceEyebrow: "Panduan pertanyaan proyek",
    guidanceTitle: "Informasi yang membantu percakapan awal",
    guidance: [
      "Masalah yang ingin diselesaikan.",
      "Proses bisnis saat ini.",
      "Kanal yang digunakan.",
      "Kebutuhan integrasi.",
      "Target waktu.",
      "Batasan keamanan atau data.",
    ],
    sensitiveWarning: "Jangan mengirim kredensial, kata sandi, API key, atau data pelanggan sensitif melalui formulir ini.",
    availabilityLabel: "ketersediaan",
    availabilityRows: [
      ["Ketersediaan", "Belum ditentukan"],
      ["Jenis proyek", "AI Agent / Backend — placeholder"],
      ["Lokasi", "Lokasi belum diisi"],
      ["Waktu respons", "Belum ditentukan"],
    ],
    privacyEyebrow: "Pemberitahuan privasi",
    privacyText: "Formulir belum aktif, sehingga data tidak dikirim atau disimpan. Jangan mengirim data sensitif. Jika formulir dihubungkan di masa depan, cara pengelolaan data akan dijelaskan secara terpisah.",
    exploreEyebrow: "Jelajahi karya",
    exploreTitle: "Lihat sistem dan konteks di balik AURA.",
    viewProjects: "Lihat Proyek",
    viewAura: "Lihat AURA",
    openDemo: "Buka Demo",
  },
  "en-US": {
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Contact",
    heroEyebrow: "Contact channel",
    heroTitle: "Let's discuss what we can build with",
    heroDescription: "The contact channels and form on this page are still a static preview. Correct details can be supplied through the site configuration.",
    statusLabel: "channel status",
    statusRows: [
      ["EMAIL", "AVAILABLE"],
      ["LINKEDIN", "COMING SOON"],
      ["GITHUB", "COMING SOON"],
      ["FORM", "STATIC"],
      ["RESPONSE", "MANUAL"],
    ],
    unavailable: "Unavailable",
    comingSoon: "Coming soon",
    openChannel: "Open channel",
    configureChannel: "Add this value in config/site.ts to activate the channel.",
    formEyebrow: "Static contact form",
    formTitle: "Tell me what you need",
    formHelp: "Form submission is not connected. The fields preview the experience; no data is sent or stored.",
    submissionDisabled: "SUBMISSION DISABLED",
    name: "Name",
    namePlaceholder: "Full name",
    email: "Email",
    emailPlaceholder: "name@company.com",
    organization: "Company / Organization",
    organizationPlaceholder: "Organization name",
    message: "Project context",
    messagePlaceholder: "Describe the context, goal, or challenge you are working through.",
    sendDisabled: "Send message — not connected",
    guidanceEyebrow: "Project inquiry guidance",
    guidanceTitle: "Information that helps an initial conversation",
    guidance: [
      "The problem you want to solve.",
      "The current business process.",
      "The channels in use.",
      "Integration requirements.",
      "Target timeline.",
      "Security or data constraints.",
    ],
    sensitiveWarning: "Do not send credentials, passwords, API keys, or sensitive customer data through this form.",
    availabilityLabel: "availability",
    availabilityRows: [
      ["Availability", "Not specified"],
      ["Project type", "AI Agent / Backend — placeholder"],
      ["Location", "Location not specified"],
      ["Response time", "Not specified"],
    ],
    privacyEyebrow: "Privacy notice",
    privacyText: "The form is inactive, so no data is sent or stored. Do not submit sensitive data. If the form is connected in the future, its data handling will be explained separately.",
    exploreEyebrow: "Explore the work",
    exploreTitle: "See the system and context behind AURA.",
    viewProjects: "View Projects",
    viewAura: "View AURA",
    openDemo: "Open Demo",
  },
});

export default async function ContactPage() {
  const locale = await getServerLocale();
  const copy = selectLocalizedContent(content, locale);
  const methods = [
    ["Email", siteConfig.contact.email, siteConfig.contact.email ? `mailto:${siteConfig.contact.email}` : null, copy.unavailable],
    ["LinkedIn", siteConfig.contact.linkedin, siteConfig.contact.linkedin, copy.comingSoon],
    ["GitHub", siteConfig.contact.github, siteConfig.contact.github, copy.comingSoon],
  ] as const;
  const availabilityValues = [
    siteConfig.owner.availability ?? copy.availabilityRows[0][1],
    copy.availabilityRows[1][1],
    siteConfig.owner.location ?? copy.availabilityRows[2][1],
    copy.availabilityRows[3][1],
  ];

  return (
    <>
      <section data-section-id={contactSectionIds[0]} className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div className="absolute right-[-10rem] top-[-12rem] -z-10 size-[32rem] rounded-full bg-emerald-500/10 blur-[120px]" aria-hidden="true" />
        <PageContainer className="py-8 sm:py-10"><nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-500"><Link href="/" className="transition-colors hover:text-emerald-300">{copy.breadcrumbHome}</Link><span className="mx-2 text-slate-700" aria-hidden="true">/</span><span aria-current="page" className="text-slate-300">{copy.breadcrumbCurrent}</span></nav></PageContainer>
        <PageContainer className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end"><div><p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />{copy.heroEyebrow}</p><h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-50 sm:text-6xl">{copy.heroTitle} <span className="text-emerald-300">AI.</span></h1><p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">{copy.heroDescription}</p></div><TerminalPanel label={copy.statusLabel}><dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">{copy.statusRows.map(([label, value], index) => <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-800 pb-3 last:border-0 last:pb-0"><dt className="text-slate-500">{label}</dt><dd className="text-right text-emerald-300">{index === 0 && !siteConfig.contact.email ? copy.unavailable.toUpperCase() : value}</dd></div>)}</dl></TerminalPanel></PageContainer>
      </section>

      <section className="bg-[#080e19] py-16 sm:py-24">
        <PageContainer>
          <div data-section-id={contactSectionIds[1]} className="grid gap-5 md:grid-cols-3">{methods.map(([label, value, href, fallback]) => <article key={label} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">{label}</p><p className="mt-4 break-words text-lg font-semibold text-slate-100">{value ?? fallback}</p>{href ? <a href={href} className="mt-5 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200" {...(label === "Email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}>{copy.openChannel} <span className="ml-2" aria-hidden="true">↗</span></a> : <p className="mt-5 text-sm leading-6 text-slate-500">{copy.configureChannel}</p>}</article>)}</div>

          <section data-section-id={contactSectionIds[2]} className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-7 sm:p-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">{copy.formEyebrow}</p><h2 className="mt-3 text-2xl font-semibold text-slate-50">{copy.formTitle}</h2><p id="form-help" className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{copy.formHelp}</p></div><span className="rounded-full border border-slate-700 px-3 py-1 font-mono text-[0.65rem] text-slate-400">{copy.submissionDisabled}</span></div><form className="mt-8 space-y-6" aria-describedby="form-help"><div className="grid gap-6 sm:grid-cols-2"><label className="text-sm font-medium text-slate-300">{copy.name}<input type="text" name="name" disabled aria-disabled="true" placeholder={copy.namePlaceholder} className={inputStyles} /></label><label className="text-sm font-medium text-slate-300">{copy.email}<input type="email" name="email" disabled aria-disabled="true" placeholder={copy.emailPlaceholder} className={inputStyles} /></label></div><label className="block text-sm font-medium text-slate-300">{copy.organization}<input type="text" name="organization" disabled aria-disabled="true" placeholder={copy.organizationPlaceholder} className={inputStyles} /></label><label className="block text-sm font-medium text-slate-300">{copy.message}<textarea name="message" rows={6} disabled aria-disabled="true" placeholder={copy.messagePlaceholder} className={inputStyles} /></label><button type="button" disabled aria-disabled="true" className="rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-400 disabled:cursor-not-allowed">{copy.sendDisabled}</button></form></section>

          <div data-section-id={contactSectionIds[3]} className="mt-8 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">{copy.guidanceEyebrow}</p><h2 className="mt-4 text-xl font-semibold text-slate-100">{copy.guidanceTitle}</h2><ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-400">{copy.guidance.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{item}</li>)}</ul><p className="mt-5 text-xs leading-5 text-slate-500">{copy.sensitiveWarning}</p></section><TerminalPanel label={copy.availabilityLabel}><dl className="grid gap-3 p-5 text-sm">{copy.availabilityRows.map(([label], index) => <div key={label} className="flex justify-between gap-5"><dt className="text-slate-500">{label}</dt><dd className="text-right text-slate-200">{availabilityValues[index]}</dd></div>)}</dl></TerminalPanel></div>

          <aside data-section-id={contactSectionIds[4]} className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 px-6 py-5"><p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">{copy.privacyEyebrow}</p><p className="mt-3 text-sm leading-7 text-slate-400">{copy.privacyText}</p></aside>

          <section data-section-id={contactSectionIds[5]} className="mt-10 rounded-3xl border border-emerald-400/20 bg-slate-900 px-7 py-10 sm:px-10"><p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-300">{copy.exploreEyebrow}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-50">{copy.exploreTitle}</h2><div className="mt-7 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects">{copy.viewProjects}</ButtonLink><ButtonLink href="/projects/aura" variant="secondary">{copy.viewAura}</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">{copy.openDemo}</ButtonLink></div></section>
        </PageContainer>
      </section>
    </>
  );
}
