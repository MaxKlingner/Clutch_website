import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clutch — Cours particuliers gratuits",
    short_name: "Clutch",
    description:
      "Trouvez un professeur particulier en Belgique ou à distance et contactez-le gratuitement, sans commission.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f8",
    theme_color: "#12382c",
    lang: "fr-BE",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
