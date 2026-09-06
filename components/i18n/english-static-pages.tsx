import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import { siteConfig } from "@/config/site";

function Breadcrumb({ current, parent }: Readonly<{ current: string; parent?: { href: string; label: string } }>) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-xs text-zinc-500">
      <Link href={parent?.href ?? "/"} className="transition-colors hover:text-violet-300">{parent?.label ?? "Home"}</Link>
      <span className="mx-2 text-zinc-700" aria-hidden="true">/</span>
      <span aria-current="page" className="text-zinc-300">{current}</span>
    </nav>
  );
}

function PageHero({ current, eyebrow, title, description, parent, actions }: Readonly<{
  current: string;
  eyebrow: string;
  title: string;
  description: string;
  parent?: { href: string; label: string };
  actions?: React.ReactNode;
}>) {
  return (
    <section className="relative isolate overflow-hidden border-b border-zinc-800 bg-[#07070b]">
      <div className="matrix-grid absolute inset-0 -z-20" aria-hidden="true" />
      <PageContainer className="py-8 sm:py-10"><Breadcrumb current={current} parent={parent} /></PageContainer>
      <PageContainer className="pb-20 sm:pb-28">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">{eyebrow}</p>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-zinc-50 sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">{description}</p>
        {actions ? <div className="mt-9 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </PageContainer>
    </section>
  );
}

const cardClass = "rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6";

export function EnglishProjectsPage() {
  return (
    <>
      <PageHero current="Projects" eyebrow="Project portfolio" title="AI Systems & Intelligent Agents" description="Selected work focused on practical AI agents, secure backend integration, and maintainable operational workflows." />
      <section className="bg-[#0b0a0f] py-16 sm:py-24">
        <PageContainer>
          <article className="grid gap-8 rounded-3xl border border-violet-400/20 bg-zinc-900/50 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><p className="font-mono text-xs text-violet-300">FEATURED SYSTEM / 01</p><h2 className="mt-4 text-4xl font-semibold text-zinc-50">AURA</h2><p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">A bilingual AI reservation and customer-service agent with session isolation, secure public references, reservation workflows, rate limiting, and a server-side BFF boundary.</p></div>
            <div className="flex flex-col gap-3"><ButtonLink href="/projects/aura">View Case Study</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">Try AURA Demo</ButtonLink></div>
          </article>
        </PageContainer>
      </section>
    </>
  );
}

export function EnglishAuraProjectPage() {
  const features = ["Create reservations", "View reservations", "Update reservations", "Cancel reservations", "Safe human-handoff simulation", "Indonesian and English presentation"];
  return (
    <>
      <PageHero current="AURA" parent={{ href: "/projects", label: "Projects" }} eyebrow="Live AI agent case study" title="AURA — Conversational Reservation Agent" description="AURA turns natural conversation into structured reservation workflows while preserving clear backend, security, and data boundaries." actions={<><ButtonLink href="/demo/aura">Try Live Demo</ButtonLink><ButtonLink href="/architecture" variant="secondary">View Architecture</ButtonLink></>} />
      <section className="bg-[#0b0a0f] py-16 sm:py-24"><PageContainer className="grid gap-12 lg:grid-cols-2"><div><p className="font-mono text-xs text-violet-300">01 / OVERVIEW</p><h2 className="mt-4 text-3xl font-semibold text-zinc-50">From conversation to a clear workflow.</h2><p className="mt-5 text-base leading-8 text-zinc-400">AURA helps customers create and manage reservations in natural language. Canonical workflow state stays language-neutral while every user-facing prompt follows the selected presentation language.</p></div><TerminalPanel label="system scope"><dl className="grid gap-3 p-5 text-sm">{[["CHANNELS", "Web demo / Telegram"], ["BACKEND", "FastAPI"], ["DATA", "PostgreSQL"], ["LANGUAGES", "Indonesian / English"]].map(([key, value]) => <div key={key} className="flex justify-between gap-5"><dt className="text-zinc-500">{key}</dt><dd className="text-right text-violet-300">{value}</dd></div>)}</dl></TerminalPanel></PageContainer></section>
      <section className="border-y border-zinc-800 bg-[#07070b] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs text-violet-300">02 / CORE FEATURES</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map((feature) => <article key={feature} className={cardClass}><h2 className="font-semibold text-zinc-100">{feature}</h2></article>)}</div></PageContainer></section>
      <section className="bg-[#0b0a0f] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs text-violet-300">03 / SOLUTION FLOW</p><h2 className="mt-4 text-3xl font-semibold text-zinc-50">One message, explicit decision boundaries.</h2><div className="mt-8 grid gap-3 md:grid-cols-2">{["The browser sends a message through the Next.js BFF.", "AURA validates the session and selected locale.", "The orchestrator routes canonical workflow intent and state.", "Reservation services apply owner-scoped business rules.", "PostgreSQL persists canonical data and status values.", "AURA renders the response in the selected language."].map((step, index) => <article key={step} className={`${cardClass} flex gap-4`}><span className="font-mono text-violet-300">0{index + 1}</span><p className="text-sm leading-6 text-zinc-300">{step}</p></article>)}</div></PageContainer></section>
      <section className="border-y border-zinc-800 bg-[#07070b] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs text-violet-300">04 / TECHNOLOGY</p><div className="mt-8 flex flex-wrap gap-3">{["Python", "FastAPI", "PostgreSQL", "Next.js", "TypeScript", "Telegram", "Ollama", "OpenAI"].map((item) => <span key={item} className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">{item}</span>)}</div></PageContainer></section>
      <section className="bg-[#0b0a0f] py-16 sm:py-24"><PageContainer><div className="rounded-3xl border border-violet-400/20 bg-zinc-900 p-8 sm:p-12"><p className="font-mono text-xs text-violet-300">CONTINUE EXPLORING</p><h2 className="mt-4 text-3xl font-semibold text-zinc-50">Try AURA in the public demo.</h2><p className="mt-5 max-w-2xl text-zinc-400">The portfolio is the browser interface; the server-side BFF protects credentials and the backend session boundary.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/demo/aura">Try Live Demo</ButtonLink><ButtonLink href="/contact" variant="secondary">Contact Me</ButtonLink></div></div></PageContainer></section>
    </>
  );
}

export function EnglishArchitecturePage() {
  const layers = [
    ["Channel Layer", "Accepts browser or Telegram messages without owning business logic."],
    ["BFF / API Boundary", "Validates requests, isolates credentials, and forwards trusted context."],
    ["Conversation Layer", "Maintains owner-scoped session and canonical workflow state."],
    ["Agent Layer", "Routes intent and coordinates deterministic workflows."],
    ["Business Layer", "Applies reservation rules independently of presentation language."],
    ["Data Layer", "Stores canonical records and status values in PostgreSQL."],
  ];
  return (
    <>
      <PageHero current="Architecture" eyebrow="System architecture" title="An AI agent architecture with clear responsibilities." description="AURA separates channels, conversation logic, business services, presentation language, and data so each boundary can evolve safely." actions={<><ButtonLink href="/projects/aura">View AURA Case Study</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">Open Demo</ButtonLink></>} />
      <section className="bg-[#0b0a0f] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs text-violet-300">01 / LAYER BREAKDOWN</p><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{layers.map(([title, description], index) => <article key={title} className={cardClass}><span className="font-mono text-xs text-violet-300">0{index + 1}</span><h2 className="mt-5 text-lg font-semibold text-zinc-100">{title}</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p></article>)}</div></PageContainer></section>
      <section className="border-y border-zinc-800 bg-[#07070b] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs text-violet-300">02 / PRODUCTION REQUEST FLOW</p><TerminalPanel label="production path" className="mt-8"><div className="grid gap-2 p-5 text-center font-mono text-sm text-zinc-200">{["Browser", "Vercel Production", "Next.js BFF", "Tailscale Funnel", "AURA Production", "PostgreSQL"].map((node, index, all) => <div key={node}><div className="rounded-lg border border-zinc-700 p-3">{node}</div>{index < all.length - 1 ? <div className="py-2 text-violet-300" aria-hidden="true">↓</div> : null}</div>)}</div></TerminalPanel></PageContainer></section>
      <section className="bg-[#0b0a0f] py-16 sm:py-24"><PageContainer className="grid gap-8 lg:grid-cols-2"><div><p className="font-mono text-xs text-violet-300">03 / SECURITY PRINCIPLES</p><ul className="mt-7 grid gap-3 text-sm text-zinc-300">{["No service secrets in the browser", "Strict locale allowlist", "Owner-scoped reservation access", "HttpOnly session token", "Rate limiting and safe errors", "No database dependency on translated strings"].map((item) => <li key={item} className={cardClass}>{item}</li>)}</ul></div><div><p className="font-mono text-xs text-violet-300">04 / DESIGN DECISIONS</p><p className="mt-7 text-base leading-8 text-zinc-400">The selected language is authoritative only at presentation boundaries. Domain identifiers remain stable, workflow state remains canonical, and switching language never requires data rewrites or a new session.</p></div></PageContainer></section>
    </>
  );
}

export function EnglishAboutPage() {
  const strengths = ["AI Agent Development", "Backend API Engineering", "Indonesian NLU", "LLM Integration", "PostgreSQL Integration", "Business Process Automation", "System Architecture", "Human Handoff Design"];
  return (
    <>
      <PageHero current="About" eyebrow="Professional profile" title="Building AI agents and backend systems for structured operations." description="I build practical AI agents and backend systems that help businesses handle repetitive operations more efficiently." actions={<><ButtonLink href="/projects">View Projects</ButtonLink><ButtonLink href="/contact" variant="secondary">Contact Me</ButtonLink></>} />
      <section className="bg-[#0b0a0f] py-16 sm:py-24"><PageContainer><p className="font-mono text-xs text-violet-300">01 / STRENGTHS</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{strengths.map((item, index) => <article key={item} className={cardClass}><span className="font-mono text-xs text-violet-300">{String(index + 1).padStart(2, "0")}</span><h2 className="mt-5 font-semibold text-zinc-100">{item}</h2></article>)}</div></PageContainer></section>
      <section className="border-y border-zinc-800 bg-[#07070b] py-16 sm:py-24"><PageContainer className="grid gap-10 lg:grid-cols-2"><div><p className="font-mono text-xs text-violet-300">02 / WORKING APPROACH</p><h2 className="mt-4 text-3xl font-semibold text-zinc-50">Build with context, not assumptions.</h2><ul className="mt-7 grid gap-3 text-sm leading-6 text-zinc-400">{["Understand the business problem and user context.", "Map the operational workflow before choosing technology.", "Separate business logic from conversation channels.", "Build incrementally with testable boundaries.", "Treat security and data isolation as design inputs.", "Document technical decisions and constraints."].map((item) => <li key={item} className={cardClass}>{item}</li>)}</ul></div><TerminalPanel label="current profile"><dl className="grid gap-3 p-5 text-sm">{[["Name", siteConfig.owner.name ?? "Rizal"], ["Role", siteConfig.owner.role], ["Location", siteConfig.owner.location ?? "Jakarta"], ["Availability", siteConfig.owner.availability ?? "Open"]].map(([key, value]) => <div key={key} className="flex justify-between gap-5"><dt className="text-zinc-500">{key}</dt><dd className="text-zinc-200">{value}</dd></div>)}</dl></TerminalPanel></PageContainer></section>
      <section className="bg-[#0b0a0f] py-16 sm:py-24"><PageContainer><div className="rounded-3xl border border-violet-400/20 bg-zinc-900 p-8 sm:p-12"><p className="font-mono text-xs text-violet-300">PRIMARY SYSTEM / AURA</p><h2 className="mt-4 text-3xl font-semibold text-zinc-50">An end-to-end AI reservation agent.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">AURA combines natural-language understanding, FastAPI, PostgreSQL, Telegram, LLM providers, and a secure public web demo.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/projects/aura">View AURA Case Study</ButtonLink><ButtonLink href="/demo/aura" variant="secondary">Try AURA Demo</ButtonLink></div></div></PageContainer></section>
    </>
  );
}

export function EnglishContactPage() {
  const methods = [
    ["Email", siteConfig.contact.email, siteConfig.contact.email ? `mailto:${siteConfig.contact.email}` : null],
    ["LinkedIn", siteConfig.contact.linkedin ?? "Coming soon", siteConfig.contact.linkedin],
    ["GitHub", siteConfig.contact.github ?? "Coming soon", siteConfig.contact.github],
  ] as const;
  return (
    <>
      <PageHero current="Contact" eyebrow="Contact channel" title="Let's discuss what we can build with AI." description="The contact form is currently a static preview. Use the available configured channel to start a conversation." />
      <section className="bg-[#0b0a0f] py-16 sm:py-24"><PageContainer><div className="grid gap-5 md:grid-cols-3">{methods.map(([label, value, href]) => <article key={label} className={cardClass}><p className="font-mono text-xs text-violet-300">{label}</p><p className="mt-4 break-words text-lg font-semibold text-zinc-100">{value}</p>{href ? <a href={href} className="mt-5 inline-flex text-sm font-semibold text-violet-300">Open channel <span className="ml-2" aria-hidden="true">↗</span></a> : <p className="mt-5 text-sm text-zinc-500">This channel has not been configured yet.</p>}</article>)}</div>
        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-7 sm:p-10"><p className="font-mono text-xs text-violet-300">STATIC CONTACT FORM</p><h2 className="mt-3 text-2xl font-semibold text-zinc-50">Tell me what you need</h2><p id="english-form-help" className="mt-3 text-sm leading-7 text-zinc-400">Submission is not connected. These fields preview the experience; no data is sent or stored.</p><form className="mt-8 space-y-6" aria-describedby="english-form-help"><div className="grid gap-6 sm:grid-cols-2"><label className="text-sm text-zinc-300">Name<input disabled placeholder="Full name" className="mt-2 min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4" /></label><label className="text-sm text-zinc-300">Email<input disabled placeholder="name@company.com" className="mt-2 min-h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4" /></label></div><label className="block text-sm text-zinc-300">Project context<textarea disabled rows={5} placeholder="Describe the context, goal, or challenge." className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4" /></label><button type="button" disabled className="rounded-xl bg-zinc-700 px-5 py-3 text-sm text-zinc-400">Send message — not connected</button></form></section>
        <aside className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6"><p className="font-mono text-xs text-violet-300">PRIVACY NOTICE</p><p className="mt-3 text-sm leading-7 text-zinc-400">The form is inactive, so no form data is sent or stored. Never submit credentials, passwords, API keys, or sensitive customer data.</p></aside>
      </PageContainer></section>
    </>
  );
}
