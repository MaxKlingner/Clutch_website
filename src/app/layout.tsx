import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Clutch — Le tutorat qui matche",
  description:
    "Clutch connecte parents et tuteurs étudiants. Swipez, matchez, apprenez. Rejoignez la bêta sur TestFlight.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Clutch — Le tutorat qui matche",
    description:
      "Par des étudiants, pour des étudiants. Trouvez un professeur particulier du supérieur en un swipe.",
    url: "/",
    siteName: "Clutch",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${outfit.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-ink">{children}</body>
    </html>
  );
}
