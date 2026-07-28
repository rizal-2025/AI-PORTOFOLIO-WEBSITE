import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "light";
  className?: string;
};

const variants = {
  primary:
    "border border-cyan-300/30 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-300",
  secondary:
    "border border-slate-600 bg-slate-900/70 text-slate-100 hover:border-cyan-400/60 hover:bg-slate-800",
  light: "border border-white/70 bg-white text-slate-950 hover:bg-cyan-50",
};

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center whitespace-normal rounded-xl px-5 py-3 text-center text-sm font-semibold transition duration-200 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
