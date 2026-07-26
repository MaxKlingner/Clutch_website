import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Clutch — Le tutorat qui matche",
  description:
    "Clutch connecte parents et tuteurs étudiants. Swipez, matchez, apprenez. Rejoignez la bêta sur TestFlight.",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "WmqsKchLPlAtA_WGSmQuUzE_6IcIkR3OOMZoZWbXzNU",
  },
  openGraph: {
    title: "Clutch — Le tutorat qui matche",
    description:
      "Par des étudiants, pour des étudiants. Trouvez un professeur particulier du supérieur en un swipe.",
    url: SITE_URL,
    siteName: "Clutch",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Logo Clutch",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png", sizes: "1024x1024" },
    ],
    shortcut: "/logo.png",
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
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
