import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
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
    heroDescription: "Ceritakan ide, kebutuhan integrasi, atau peluang kolaborasi Anda. Hubungi saya melalui email atau siapkan draf menggunakan formulir di bawah.",
    statusLabel: "status kanal",
    statusRows: [
      ["EMAIL", "TERSEDIA"],
      ["LINKEDIN", "AKAN DATANG"],
      ["GITHUB", "AKAN DATANG"],
      ["FORMULIR", "DRAF EMAIL"],
      ["RESPONS", "MANUAL"],
    ],
    unavailable: "Belum tersedia",
    comingSoon: "Akan datang",
    openChannel: "Buka kanal",
    configureChannel: "Kanal ini belum tersedia. Silakan gunakan email.",
    formEyebrow: "Hubungi melalui email",
    formTitle: "Ceritakan kebutuhan Anda",
    formHelp: "Isi formulir untuk menyiapkan draf. Anda mengirimkannya sendiri melalui aplikasi email; website tidak mengirim pesan secara otomatis.",
    submissionDisabled: "KIRIM VIA APLIKASI EMAIL",
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
      ["Jenis proyek", "AI Agent / Backend"],
      ["Lokasi", "Lokasi belum diisi"],
      ["Waktu respons", "Belum ditentukan"],
    ],
    privacyEyebrow: "Pemberitahuan privasi",
    privacyText: "Isian diproses di browser dan tidak dikirim ke server website atau disimpan oleh formulir. Draf diteruskan ke aplikasi email saat Anda membuka tautannya. Pengiriman dan penyimpanan email mengikuti layanan email yang Anda gunakan.",
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
    heroDescription: "Share your idea, integration needs, or collaboration opportunity. Contact me by email or prepare a draft using the form below.",
    statusLabel: "channel status",
    statusRows: [
      ["EMAIL", "AVAILABLE"],
      ["LINKEDIN", "COMING SOON"],
      ["GITHUB", "COMING SOON"],
      ["FORM", "EMAIL DRAFT"],
      ["RESPONSE", "MANUAL"],
    ],
    unavailable: "Unavailable",
    comingSoon: "Coming soon",
    openChannel: "Open channel",
    configureChannel: "This channel is not available yet. Please use email.",
    formEyebrow: "Contact by email",
    formTitle: "Tell me what you need",
    formHelp: "Fill out the form to prepare a draft. You send it through your email app; this website does not send messages automatically.",
    submissionDisabled: "SEND VIA EMAIL APP",
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
      ["Project type", "AI Agent / Backend"],
      ["Location", "Location not specified"],
      ["Response time", "Not specified"],
    ],
    privacyEyebrow: "Privacy notice",
    privacyText: "Fields are processed in your browser and are not sent to the website server or saved by this form. The draft is passed to your email app when you open its link. Email delivery and storage follow the email service you use.",
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
  const whatsappMessage = locale === "en-US"
    ? "Hi Rizal, I found your portfolio and would like to discuss a project."
    : "Halo Rizal, saya melihat website portofolio Anda dan ingin berdiskusi tentang proyek.";
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
      <section data-section-id={contactSectionIds[0]} className="relative isolate overflow-hidden border-b border-zinc-800 bg-[#07070b]">
        <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
        <div className="absolute right-[-10rem] top-[-12rem] -z-10 size-[32rem] rounded-full bg-violet-500/10 blur-[120px]" aria-hidden="true" />
        <PageContainer className="py-8 sm:py-10"><nav aria-label="Breadcrumb" className="font-mono text-xs text-zinc-500"><Link href="/" className="transition-colors hover:text-violet-300">{copy.breadcrumbHome}</Link><span className="mx-2 text-zinc-700" aria-hidden="true">/</span><span aria-current="page" className="text-zinc-300">{copy.breadcrumbCurrent}</span></nav></PageContainer>
        <PageContainer className="grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end"><div><p className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-violet-300"><span className="size-1.5 rounded-full bg-violet-400" aria-hidden="true" />{copy.heroEyebrow}</p><h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-zinc-50 sm:text-6xl">{copy.heroTitle} <span className="text-violet-300">AI.</span></h1><p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">{copy.heroDescription}</p></div><TerminalPanel label={copy.statusLabel}><dl className="grid gap-3 p-5 font-mono text-xs sm:text-sm">{copy.statusRows.map(([label, value], index) => <div key={label} className="flex items-start justify-between gap-5 border-b border-zinc-800 pb-3 last:border-0 last:pb-0"><dt className="text-zinc-500">{label}</dt><dd className="text-right text-violet-300">{index === 0 && !siteConfig.contact.email ? copy.unavailable.toUpperCase() : value}</dd></div>)}</dl></TerminalPanel></PageContainer>
      </section>

      <section className="bg-[#0b0a0f] py-16 sm:py-24">
        <PageContainer>
          {siteConfig.contact.whatsapp && (
            <section className="mb-8 flex flex-col gap-6 rounded-3xl border border-emerald-400/25 bg-emerald-400/5 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between" aria-label="WhatsApp">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-300">WhatsApp</p>
                <h2 className="mt-3 text-2xl font-semibold text-zinc-50">{locale === "en-US" ? "Start with a conversation." : "Mulai dari percakapan."}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">{locale === "en-US" ? "Open WhatsApp, review the opening message, then send it when you're ready." : "Buka WhatsApp, periksa pesan pembuka, lalu kirim saat Anda siap."}</p>
              </div>
              <a href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-emerald-300 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-200">
                {locale === "en-US" ? "Chat on WhatsApp" : "Hubungi via WhatsApp"}<span aria-hidden="true">↗</span>
              </a>
            </section>
          )}
          <div data-section-id={contactSectionIds[1]} className="grid gap-5 md:grid-cols-3">{methods.map(([label, value, href, fallback]) => <article key={label} className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-violet-300">{label}</p><p className="mt-4 break-words text-lg font-semibold text-zinc-100">{value ?? fallback}</p>{href ? <a href={href} className="mt-5 inline-flex text-sm font-semibold text-violet-300 hover:text-violet-200" {...(label === "Email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}>{copy.openChannel} <span className="ml-2" aria-hidden="true">↗</span></a> : <p className="mt-5 text-sm leading-6 text-zinc-500">{copy.configureChannel}</p>}</article>)}</div>

          <section data-section-id={contactSectionIds[2]} className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-7 sm:p-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-violet-300">{copy.formEyebrow}</p><h2 className="mt-3 text-2xl font-semibold text-zinc-50">{copy.formTitle}</h2><p id="form-help" className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{copy.formHelp}</p></div><span className="rounded-full border border-zinc-700 px-3 py-1 font-mono text-[0.65rem] text-zinc-400">{copy.submissionDisabled}</span></div><ContactForm email={siteConfig.contact.email} locale={locale} /></section>

          <div data-section-id={contactSectionIds[3]} className="mt-8 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-6"><p className="font-mono text-xs uppercase tracking-[0.15em] text-violet-300">{copy.guidanceEyebrow}</p><h2 className="mt-4 text-xl font-semibold text-zinc-100">{copy.guidanceTitle}</h2><ul className="mt-5 grid gap-3 text-sm leading-6 text-zinc-400">{copy.guidance.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-400" aria-hidden="true" />{item}</li>)}</ul><p className="mt-5 text-xs leading-5 text-zinc-500">{copy.sensitiveWarning}</p></section><TerminalPanel label={copy.availabilityLabel}><dl className="grid gap-3 p-5 text-sm">{copy.availabilityRows.map(([label], index) => <div key={label} className="flex justify-between gap-5"><dt className="text-zinc-500">{label}</dt><dd className="text-right text-zinc-200">{availabilityValues[index]}</dd></div>)}</dl></TerminalPanel></div>

          <aside data-section-id={contactSectionIds[4]} className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-6 py-5"><p className="font-mono text-xs uppercase tracking-[0.15em] text-violet-300">{copy.privacyEyebrow}</p><p className="mt-3 text-sm leading-7 text-zinc-400">{copy.privacyText}</p></aside>

          <section data-section-id={contactSectionIds[5]} className="mt-10 rounded-3xl border border-violet-400/20 bg-zinc-900 px-7 py-10 sm:px-10"><p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-300">{copy.exploreEyebrow}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-50">{copy.exploreTitle}</h2><div className="mt-7 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects">{copy.viewProjects}</ButtonLink><ButtonLink href="/projects/aura" variant="secondary">{copy.viewAura}</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">{copy.openDemo}</ButtonLink></div></section>
        </PageContainer>
      </section>
    </>
  );
}
