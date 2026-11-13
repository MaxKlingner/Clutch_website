import { renderBrandOgImage } from "@/lib/og";

export const alt = "Clutch — Cours particuliers en Belgique, sans commission";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderBrandOgImage();
}
