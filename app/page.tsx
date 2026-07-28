import { CapabilitiesSection } from "@/components/sections/capabilities-section";
import { ContactCtaSection } from "@/components/sections/contact-cta-section";
import { FeaturedProjectSection } from "@/components/sections/featured-project-section";
import { HeroSection } from "@/components/sections/hero-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProjectSection />
      <CapabilitiesSection />
      <ContactCtaSection />
    </>
  );
}
