import { ContactCtaSection } from "@/components/sections/contact-cta-section";
import { CurrentFocusSection } from "@/components/sections/current-focus-section";
import { FeaturedProjectSection } from "@/components/sections/featured-project-section";
import { HeroSection } from "@/components/sections/hero-section";
import { IntroductionSection } from "@/components/sections/introduction-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <IntroductionSection />
      <FeaturedProjectSection />
      <CurrentFocusSection />
      <ContactCtaSection />
    </>
  );
}
