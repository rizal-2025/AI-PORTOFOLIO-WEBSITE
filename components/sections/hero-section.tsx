import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import { SplineRobotScene } from "@/components/visuals/spline-robot-scene";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SupportedLocale } from "@/lib/i18n/locale";

export function HeroSection({
  copy,
  locale,
}: Readonly<{
  copy: Dictionary["home"];
  locale: SupportedLocale;
}>) {
  const sceneLabels =
    locale === "en-US"
      ? {
          description: "Interactive 3D robot visualization",
          loading: "Loading the 3D robot…",
          reducedMotion: "Static 3D preview — motion preference respected",
          enable: "Show the 3D robot",
          unavailable: "3D scene unavailable — portfolio content remains accessible",
        }
      : {
          description: "Visualisasi robot 3D interaktif",
          loading: "Memuat robot 3D…",
          reducedMotion: "Pratinjau 3D statis — preferensi gerak dihormati",
          enable: "Tampilkan robot 3D",
          unavailable: "Scene 3D tidak tersedia — konten portofolio tetap dapat diakses",
        };

  return (
    <section className="portfolio-hero">
      <div className="portfolio-hero__stars" aria-hidden="true" />
      <PageContainer className="portfolio-hero__inner">
        <div className="portfolio-hero__meta">
          <p>{copy.heroEyebrow}</p>
          <span aria-hidden="true">RZ / AI</span>
        </div>

        <div className="portfolio-hero__stage">
          <div className="portfolio-hero__content">
            <h1>{copy.heroTitle}</h1>
            <div className="portfolio-hero__summary max-w-3xl">
              <p>{copy.heroDescription}</p>
              <div className="portfolio-hero__actions">
                <ButtonLink href="/demo/aura">{copy.tryAura}</ButtonLink>
                <ButtonLink href="/projects" variant="secondary">
                  {copy.viewProjects}
                </ButtonLink>
              </div>
              {siteConfig.contact.whatsapp && (
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(locale === "en-US" ? "Hi Rizal, I found your portfolio and would like to discuss a project." : "Halo Rizal, saya melihat website portofolio Anda dan ingin berdiskusi tentang proyek.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-300/20"
                >
                  {locale === "en-US" ? "Chat on WhatsApp" : "Hubungi via WhatsApp"}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
              <ul className="hero-specialties" aria-label={locale === "en-US" ? "Specialties" : "Spesialisasi"}>
                <li>AI Agents</li><li>Backend Systems</li><li>LLM Integration</li>
              </ul>
            </div>
          </div>
          <SplineRobotScene labels={sceneLabels} />
        </div>

        <aside className="portfolio-hero__project">
          <div className="portfolio-hero__project-heading">
            <span>{copy.featured}</span>
            <span aria-hidden="true">01</span>
          </div>
          <p>{copy.auraSummary}</p>
          <div>{copy.availability}</div>
        </aside>
      </PageContainer>
    </section>
  );
}
