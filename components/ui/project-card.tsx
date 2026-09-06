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
  labels: {
    featuredProject: string;
    businessValue: string;
    coreCapabilities: string;
    technologyStack: string;
    caseStudy: string;
    demo: string;
  };
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
  labels,
}: ProjectCardProps) {
  return (
    <article className="project-card-depth overflow-hidden rounded-3xl border border-zinc-700/80 bg-zinc-900/50 shadow-2xl shadow-black/20">
      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <div className="project-card-depth__visual relative flex min-h-72 flex-col justify-between overflow-hidden border-b border-zinc-700/80 bg-zinc-950 p-7 text-white sm:p-10 lg:border-b-0 lg:border-r">
          <div
            className="absolute -right-24 -top-24 size-72 rounded-full bg-violet-600/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              {labels.featuredProject}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[0.68rem] font-medium text-violet-300">
              <span
                className="size-1.5 rounded-full bg-violet-400"
                aria-hidden="true"
              />
              {status}
            </span>
          </div>
          <div className="relative">
            <p className="font-mono text-sm text-zinc-400">agent://reservation</p>
            <h3 className="mt-2 text-6xl font-semibold tracking-[-0.06em] sm:text-7xl">
              {name}
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-400">{category}</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
              {role}
            </p>
          </div>
        </div>
        <div className="p-7 sm:p-10">
          <div className="border-b border-zinc-700/70 pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
              {labels.businessValue}
            </p>
            <p className="mt-4 text-lg leading-8 text-zinc-300">{description}</p>
            <ul className="mt-5 grid gap-2">
              {businessValue.map((value) => (
                <li key={value} className="flex gap-2 text-sm leading-6 text-zinc-400">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-400" aria-hidden="true" />
                  {value}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-8 py-8 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">{labels.coreCapabilities}</h4>
              <ul className="mt-4 grid gap-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-zinc-400"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="size-4 shrink-0 text-violet-400"
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
              <h4 className="text-sm font-semibold text-zinc-100">
                {labels.technologyStack}
              </h4>
              <ul className="mt-4 flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <li
                    key={technology}
                    className="rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2 font-mono text-xs text-zinc-400"
                  >
                    {technology}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-700/70 pt-8 sm:flex-row">
            <ButtonLink href={caseStudyHref}>
              {labels.caseStudy} <span className="ml-2" aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink href={demoHref} variant="secondary">
              {labels.demo}
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
