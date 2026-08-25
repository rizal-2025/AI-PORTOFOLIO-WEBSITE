"use client";

import { useEffect, useRef, useState } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SupportedLocale } from "@/lib/i18n/locale";

type Props = Readonly<{
  locale: SupportedLocale;
  copy: Dictionary["global"];
  onSelected?: () => void;
}>;

const BUTTON_RELOAD_ATTRIBUTES = { autoComplete: "off" } as Record<string, string>;

export function LanguageSelector({ locale, copy, onSelected }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<SupportedLocale | null>(null);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = pendingLocale ?? locale;

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", escape);
    };
  }, [isOpen]);

  async function choose(nextLocale: SupportedLocale) {
    if (pending || nextLocale === selected) {
      setIsOpen(false);
      return;
    }
    setPendingLocale(nextLocale);
    setPending(true);
    setIsOpen(false);
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
        credentials: "same-origin",
      });
      if (!response.ok) {
        setPendingLocale(null);
        return;
      }
      onSelected?.();
      window.location.reload();
    } catch {
      setPendingLocale(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        {...BUTTON_RELOAD_ATTRIBUTES}
        aria-label={copy.languageLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        disabled={pending}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21M12 3C9.5 5.5 8.2 8.5 8.2 12S9.5 18.5 12 21" />
        </svg>
        <span>{pending ? "…" : selected === "en-US" ? "EN" : "ID"}</span>
      </button>
      {isOpen ? (
        <div
          role="menu"
          aria-label={copy.languageMenu}
          className="absolute right-0 z-50 mt-2 min-w-52 rounded-xl border border-slate-700 bg-slate-950 p-1.5 shadow-2xl shadow-black/40"
        >
          {([
            ["id-ID", copy.indonesian],
            ["en-US", copy.english],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              {...BUTTON_RELOAD_ATTRIBUTES}
              role="menuitemradio"
              aria-checked={selected === value}
              onClick={() => void choose(value)}
              className="flex min-h-11 w-full items-center justify-between gap-4 rounded-lg px-3 text-left text-sm text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            >
              <span>{label}</span>
              {selected === value ? <span className="text-cyan-300" aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">{pending ? copy.changingLanguage : ""}</span>
    </div>
  );
}
