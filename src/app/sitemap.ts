import type { MetadataRoute } from "next";
import { fetchTutors } from "@/lib/db";
import { CITY_PAGES, SUBJECT_PAGES } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const yearly = { changeFrequency: "yearly" as const, priority: 0.3 };
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/professeurs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    { url: `${SITE_URL}/qui-sommes-nous`, ...yearly },
    { url: `${SITE_URL}/mentions-legales`, ...yearly },
    { url: `${SITE_URL}/confidentialite`, ...yearly },
    { url: `${SITE_URL}/conditions`, ...yearly },
    { url: `${SITE_URL}/contact`, ...yearly },
    { url: `${SITE_URL}/app`, ...yearly },
  ];

  const subjectRoutes: MetadataRoute.Sitemap = SUBJECT_PAGES.map((subject) => ({
    url: `${SITE_URL}/cours/${subject.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const cityRoutes: MetadataRoute.Sitemap = CITY_PAGES.map((city) => ({
    url: `${SITE_URL}/villes/${city.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  let tutorRoutes: MetadataRoute.Sitemap = [];
  try {
    const tutors = await fetchTutors();
    tutorRoutes = tutors.map((tutor) => {
      const parsedDate = tutor.createdAt ? new Date(tutor.createdAt) : now;
      return {
        url: `${SITE_URL}/tuteur/${tutor.id}`,
        lastModified: Number.isNaN(parsedDate.getTime()) ? now : parsedDate,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      };
    });
  } catch {
    tutorRoutes = [];
  }

  return [...staticRoutes, ...subjectRoutes, ...cityRoutes, ...tutorRoutes];
}
