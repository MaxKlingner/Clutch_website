import type { MetadataRoute } from "next";
import { fetchTutors } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const yearly = { changeFrequency: "yearly" as const, priority: 0.3 };
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/professeurs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: `${SITE_URL}/qui-sommes-nous`, ...yearly },
    { url: `${SITE_URL}/mentions-legales`, ...yearly },
    { url: `${SITE_URL}/confidentialite`, ...yearly },
    { url: `${SITE_URL}/conditions`, ...yearly },
    { url: `${SITE_URL}/contact`, ...yearly },
    { url: `${SITE_URL}/app`, ...yearly },
  ];

  let tutorRoutes: MetadataRoute.Sitemap = [];
  try {
    const tutors = await fetchTutors();
    tutorRoutes = tutors.map((tutor) => ({
      url: `${SITE_URL}/tuteur/${tutor.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    tutorRoutes = [];
  }

  return [...staticRoutes, ...tutorRoutes];
}
