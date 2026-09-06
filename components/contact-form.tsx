"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SupportedLocale } from "@/lib/i18n/locale";

const inputStyles = "mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500";

export function ContactForm({ email, locale }: { email: string | null; locale: SupportedLocale }) {
  const en = locale === "en-US";
  const [draft, setDraft] = useState<{ href: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [error, setError] = useState("");
  const draftPanel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (draft) draftPanel.current?.focus();
  }, [draft]);
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") ?? "").trim();
    const sender = String(fields.get("email") ?? "").trim();
    const organization = String(fields.get("organization") ?? "").trim();
    const message = String(fields.get("message") ?? "").trim();
    if (!name || !message) {
      setError(en ? "Name and message must contain text, not just spaces." : "Nama dan pesan harus berisi teks, bukan hanya spasi.");
      return;
    }
    setError("");
    const body = `${en ? "Name" : "Nama"}: ${name}\nEmail: ${sender}\n${en ? "Organization" : "Organisasi"}: ${organization || "—"}\n\n${message}`;
    setDraft({ href: `mailto:${email}?subject=${encodeURIComponent(en ? "Portfolio project inquiry" : "Diskusi proyek dari portofolio")}&body=${encodeURIComponent(body)}`, body });
    setCopied(false);
    setCopyFailed(false);
  }
  return <form className="mt-8 space-y-6" aria-describedby="form-help" onSubmit={prepare} onInvalidCapture={() => setError(en ? "Please enter your name, a valid email address, and a message. Check the highlighted field." : "Isi nama, alamat email yang valid, dan pesan. Periksa kolom yang ditandai.")} onChange={() => { setDraft(null); setCopied(false); setCopyFailed(false); setError(""); }}>
    <fieldset disabled={!email} className="space-y-6 disabled:opacity-50">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="text-sm font-medium text-zinc-300">{en ? "Name" : "Nama"}<input name="name" required pattern=".*\S.*" maxLength={100} autoComplete="name" className={inputStyles} /></label>
        <label className="text-sm font-medium text-zinc-300">Email<input name="email" type="email" required maxLength={254} autoComplete="email" className={inputStyles} /></label>
      </div>
      <label className="block text-sm font-medium text-zinc-300">{en ? "Organization (optional)" : "Organisasi (opsional)"}<input name="organization" maxLength={120} autoComplete="organization" className={inputStyles} /></label>
      <label className="block text-sm font-medium text-zinc-300">{en ? "Your message" : "Pesan Anda"}<textarea name="message" required maxLength={1500} rows={6} className={inputStyles} placeholder={en ? "Tell me about your project." : "Ceritakan kebutuhan proyek Anda."} /></label>
      <p className="text-sm text-zinc-400">{en ? "Name, email, and message are required. Your draft will appear below." : "Nama, email, dan pesan wajib diisi. Draf akan muncul di bawah tombol ini."}</p>
      <button type="submit" className="cursor-pointer rounded-xl bg-violet-300 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-violet-200">{en ? "Prepare email draft" : "Siapkan draf email"}</button>
    </fieldset>
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    {!email && <p role="status">{en ? "Contact email is not available." : "Email kontak belum tersedia."}</p>}
    {draft && <div ref={draftPanel} tabIndex={-1} aria-label={en ? "Email draft ready" : "Draf email siap"} className="scroll-mt-24 rounded-2xl border border-violet-400/25 bg-violet-400/5 p-5">
      <p role="status" className="text-sm leading-7 text-violet-200">{en ? "Your draft is ready. Open your email app, review it, then send. No message has been sent yet." : "Draf siap. Buka aplikasi email, periksa isinya, lalu kirim. Pesan belum terkirim."}</p>
      <p className="mt-2 break-all text-sm text-zinc-400">{en ? "Recipient" : "Penerima"}: {email}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        <a href={draft.href} className="rounded-lg bg-violet-300 px-4 py-2 text-sm font-semibold text-zinc-950">{en ? "Open email app" : "Buka aplikasi email"}</a>
        <button type="button" className="text-sm font-semibold text-violet-300" onClick={async () => { try { await navigator.clipboard.writeText(draft.body); setCopied(true); setCopyFailed(false); } catch { setCopyFailed(true); } }}>{en ? "Copy message" : "Salin pesan"}</button>
      </div>
      <p role="status" className="mt-3 text-sm text-zinc-400">{copied ? (en ? "Message copied." : "Pesan disalin.") : copyFailed ? (en ? "Select and copy the draft below manually." : "Pilih dan salin draf di bawah secara manual.") : (en ? "No email app? Copy the message into your webmail." : "Tidak ada aplikasi email? Salin pesan ke layanan email Anda.")}</p>
      <details className="mt-3 text-sm text-zinc-400"><summary className="cursor-pointer">{en ? "View draft" : "Lihat draf"}</summary><pre className="mt-3 whitespace-pre-wrap break-words font-sans">{draft.body}</pre></details>
    </div>}
  </form>;
}
