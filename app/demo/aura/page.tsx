import type { Metadata } from "next";
import { AuraDemoConsole } from "@/components/demo/aura-demo-console";
import { PageContainer } from "@/components/layout/page-container";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "AURA Demo",
  description: "Coba percakapan dan alur reservasi AURA melalui BFF yang aman.",
};

export default async function AuraDemoPage() {
  const locale = await getServerLocale();
  const copy = getDictionary(locale).demo;
  return (
    <section className="min-h-[calc(100svh-4rem)] bg-zinc-950 py-12 sm:py-16">
      <PageContainer>
        <header className="mb-10 max-w-3xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            {copy.introduction}
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            {copy.safety}
          </p>
        </header>
        <AuraDemoConsole locale={locale} copy={copy} />
      </PageContainer>
    </section>
  );
}
