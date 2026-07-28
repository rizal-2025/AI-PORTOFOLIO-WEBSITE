import { PageContainer } from "@/components/layout/page-container";
import { ProjectCard } from "@/components/ui/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";

export function FeaturedProjectSection() {
  return (
    <section className="bg-[#080e19] py-20 sm:py-28">
      <PageContainer>
        <SectionHeading
          eyebrow="Proyek unggulan"
          title="AURA mengubah percakapan menjadi aksi operasional."
          description="Fondasi AI Agent untuk menangani kebutuhan reservasi dan layanan pelanggan dalam bahasa Indonesia."
        />
        <div className="mt-12">
          <ProjectCard {...siteConfig.featuredProject} />
        </div>
      </PageContainer>
    </section>
  );
}
