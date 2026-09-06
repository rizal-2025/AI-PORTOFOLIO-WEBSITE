import { ContactCtaSection } from "@/components/sections/contact-cta-section";
import { CurrentFocusSection } from "@/components/sections/current-focus-section";
import { CapabilitiesSection } from "@/components/sections/capabilities-section";
import { FeaturedProjectSection } from "@/components/sections/featured-project-section";
import { HeroSection } from "@/components/sections/hero-section";
import { IntroductionSection } from "@/components/sections/introduction-section";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/server";

export default async function Home() {
  const locale = await getServerLocale();
  const copy = getDictionary(locale).home;
  return (
    <>
      <HeroSection copy={copy} locale={locale} />
      <IntroductionSection copy={copy} />
      <CapabilitiesSection copy={copy} />
      <FeaturedProjectSection copy={copy} locale={locale} />
      <CurrentFocusSection copy={copy} />
      <ContactCtaSection copy={copy} />
    </>
  );
}
