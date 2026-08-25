import { ContactCtaSection } from "@/components/sections/contact-cta-section";
import { CurrentFocusSection } from "@/components/sections/current-focus-section";
import { CapabilitiesSection } from "@/components/sections/capabilities-section";
import { FeaturedProjectSection } from "@/components/sections/featured-project-section";
import { HeroSection } from "@/components/sections/hero-section";
import { IntroductionSection } from "@/components/sections/introduction-section";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/server";

export default async function Home() {
  const copy = getDictionary(await getServerLocale()).home;
  return (
    <>
      <HeroSection copy={copy} />
      <IntroductionSection copy={copy} />
      <CapabilitiesSection copy={copy} />
      <FeaturedProjectSection copy={copy} />
      <CurrentFocusSection copy={copy} />
      <ContactCtaSection copy={copy} />
    </>
  );
}
