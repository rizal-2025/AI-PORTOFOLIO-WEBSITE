import type { ReactNode } from "react";

type TerminalPanelProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function TerminalPanel({
  label,
  children,
  className = "",
}: TerminalPanelProps) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-2xl border border-emerald-400/20 bg-slate-950/75 shadow-xl shadow-black/20 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-3">
        <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
        <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}
