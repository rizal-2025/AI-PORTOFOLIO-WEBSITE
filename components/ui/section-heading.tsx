type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";
  const eyebrowAlignment = align === "center" ? "justify-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow ? (
        <p
          className={`mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300 ${eyebrowAlignment}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-slate-50 sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
