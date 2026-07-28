import { ButtonLink } from "@/components/ui/button-link";

type ProjectCardProps = {
  name: string;
  category: string;
  status: string;
  role: string;
  description: string;
  features: readonly string[];
  businessValue: readonly string[];
  technologies: readonly string[];
  caseStudyHref: string;
  demoHref: string;
};

export function ProjectCard({
  name,
  category,
  status,
  role,
  description,
  features,
  businessValue,
  technologies,
  caseStudyHref,
  demoHref,
}: ProjectCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/50 shadow-2xl shadow-black/20">
      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <div className="relative flex min-h-72 flex-col justify-between overflow-hidden border-b border-slate-700/80 bg-slate-950 p-7 text-white sm:p-10 lg:border-b-0 lg:border-r">
          <div
            className="absolute -right-24 -top-24 size-72 rounded-full bg-blue-600/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Featured project
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[0.68rem] font-medium text-emerald-300">
              <span
                className="size-1.5 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              {status}
            </span>
          </div>
          <div className="relative">
            <p className="font-mono text-sm text-slate-400">agent://reservation</p>
            <h3 className="mt-2 text-6xl font-semibold tracking-[-0.06em] sm:text-7xl">
              {name}
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">{category}</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.15em] text-slate-500">
              {role}
            </p>
          </div>
        </div>
        <div className="p-7 sm:p-10">
          <div className="border-b border-slate-700/70 pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Nilai bisnis
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-300">{description}</p>
            <ul className="mt-5 grid gap-2">
              {businessValue.map((value) => (
                <li key={value} className="flex gap-2 text-sm leading-6 text-slate-400">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                  {value}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-8 py-8 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Kemampuan utama</h4>
              <ul className="mt-4 grid gap-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="size-4 shrink-0 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path d="m5 10 3 3 7-7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">
                Technology stack
              </h4>
              <ul className="mt-4 flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <li
                    key={technology}
                    className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-400"
                  >
                    {technology}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-700/70 pt-8 sm:flex-row">
            <ButtonLink href={caseStudyHref}>
              Lihat studi kasus <span className="ml-2" aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink href={demoHref} variant="secondary">
              Coba demo AURA
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
