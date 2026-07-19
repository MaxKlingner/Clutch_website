import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
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
  title: "Clutch — Le tutorat qui matche",
  description:
    "Clutch connecte parents et tuteurs étudiants. Swipez, matchez, apprenez. Téléchargez l'application ou devenez tuteur.",
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
