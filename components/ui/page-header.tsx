type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-slate-800 bg-[#050a13]">
      <div className="matrix-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.035em] text-slate-50 sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          {description}
        </p>
      </div>
    </header>
  );
}
