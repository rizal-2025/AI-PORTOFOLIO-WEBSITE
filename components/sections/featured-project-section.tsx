import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SupportedLocale } from "@/lib/i18n/locale";

export function FeaturedProjectSection({ copy, locale }: Readonly<{ copy: Dictionary["home"]; locale: SupportedLocale }>) {
  const preview = locale === "en-US"
    ? { label: "Illustrated conversation", request: "I'd like to make a reservation.", reply: "Of course. What date would you prefer?", steps: ["Conversation", "Details", "Confirmation"], note: "From a conversation to a clear next step.", tag: "RESERVATION ASSISTANT" }
    : { label: "Ilustrasi percakapan", request: "Saya ingin membuat reservasi.", reply: "Tentu. Untuk tanggal berapa?", steps: ["Percakapan", "Detail", "Konfirmasi"], note: "Dari percakapan menuju langkah yang jelas.", tag: "ASISTEN RESERVASI" };
  return (
    <section className="featured-project-section">
      <PageContainer>
        <div className="featured-project-section__heading">
          <p>{copy.featured}</p>
          <h2>AURA</h2>
        </div>
        <article className="featured-project-depth featured-project-showcase">
          <div className="featured-project-showcase__visual aura-preview">
            <div className="aura-preview__window">
              <div className="aura-preview__toolbar">
                <span className="aura-preview__dots" aria-hidden="true"><i /><i /><i /></span>
                <span>{preview.label}</span>
              </div>
              <div className="aura-preview__identity"><span aria-hidden="true">A</span><div><strong>AURA</strong><p>{preview.tag}</p></div></div>
              <div className="aura-preview__conversation">
                <p className="aura-preview__request">{preview.request}</p>
                <p className="aura-preview__reply">{preview.reply}</p>
              </div>
              <ol className="aura-preview__steps">
                {preview.steps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span>{step}</li>)}
              </ol>
              <p className="aura-preview__note">{preview.note}</p>
            </div>
          </div>
          <div className="min-w-0 max-w-2xl featured-project-showcase__content">
            <p>{copy.projectDescription}</p>
            <div className="featured-project-showcase__availability">
              <span aria-hidden="true" />
              {copy.availability}
            </div>
            <div className="featured-project-showcase__actions">
              <ButtonLink href="/demo/aura" className="max-w-full">
                {copy.liveDemo}
              </ButtonLink>
              <ButtonLink href="/projects/aura" variant="secondary" className="max-w-full">
                {copy.caseStudy}
              </ButtonLink>
            </div>
          </div>
        </article>
      </PageContainer>
    </section>
  );
}
