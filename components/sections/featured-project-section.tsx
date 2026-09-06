import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function FeaturedProjectSection({ copy }: Readonly<{ copy: Dictionary["home"] }>) {
  return (
    <section className="featured-project-section">
      <PageContainer>
        <div className="featured-project-section__heading">
          <p>{copy.featured}</p>
          <h2>AURA</h2>
        </div>
        <article className="featured-project-depth featured-project-showcase">
          <div className="featured-project-showcase__visual" aria-hidden="true">
            <div className="featured-project-showcase__plane">
              <span>AURA</span>
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
