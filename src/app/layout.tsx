import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import Providers from "@/components/Providers";
import JsonLd from "@/components/site/JsonLd";
import SiteFrame from "@/components/site/SiteFrame";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const SITE_TITLE = "Clutch — Cours particuliers gratuits en Belgique, sans commission";
const SITE_DESCRIPTION =
  "Trouvez un professeur particulier en Belgique (Bruxelles, Brabant wallon, Liège, Namur, Hainaut) ou à distance. Comparez les profils et contactez gratuitement, sans commission.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Clutch",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "cours particuliers Belgique",
    "professeur particulier gratuit",
    "soutien scolaire sans commission",
    "cours particuliers mathématiques Bruxelles",
    "prof particulier à distance",
    "tutorat étudiant Belgique",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "WmqsKchLPlAtA_WGSmQuUzE_6IcIkR3OOMZoZWbXzNU",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Clutch",
    locale: "fr_BE",
    alternateLocale: ["fr_FR"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon-32.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${outfit.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-ink">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Providers>
          <SiteFrame>{children}</SiteFrame>
        </Providers>
      </body>
    </html>
  );
}
