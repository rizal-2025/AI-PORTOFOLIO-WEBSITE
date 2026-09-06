import { PageContainer } from "@/components/layout/page-container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function IntroductionSection({ copy }: Readonly<{ copy: Dictionary["home"] }>) {
  return (
    <section className="home-editorial">
      <PageContainer>
        <div className="home-editorial__header">
          <p>{copy.approach}</p>
          <span aria-hidden="true" />
        </div>
        <h2>{copy.approachTitle}</h2>
        <p className="home-editorial__description">{copy.approachDescription}</p>
      </PageContainer>
    </section>
  );
}
