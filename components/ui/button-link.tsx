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
    "border border-violet-300/30 bg-violet-400 text-zinc-950 hover:bg-violet-300",
  secondary:
    "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-violet-400/60 hover:bg-zinc-800",
  light: "border border-violet-300/45 bg-violet-400 text-zinc-950 hover:bg-violet-300",
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
