import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { htmlLanguage } from "@/lib/i18n/locale";
import { getServerLocale } from "@/lib/i18n/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Rizal — AI Engineer",
    template: "%s | Rizal — AI Engineer",
  },
  description: siteConfig.description,
  openGraph: {
    title: "Rizal — AI Engineer",
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const copy = getDictionary(locale).global;
  return (
    <html lang={htmlLanguage(locale)} className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {copy.skipToContent}
        </a>
        <Navbar locale={locale} copy={copy} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer copy={copy} />
      </body>
    </html>
  );
}
