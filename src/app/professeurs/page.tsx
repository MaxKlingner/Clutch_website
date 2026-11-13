import type { Metadata } from "next";
import Catalog from "@/components/catalog/Catalog";
import JsonLd from "@/components/site/JsonLd";
import SeoDirectory from "@/components/site/SeoDirectory";
import { fetchTutors } from "@/lib/db";
import { breadcrumbJsonLd, tutorListJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Professeurs particuliers en Belgique et à distance",
  description:
    "Filtrez les professeurs particuliers par matière, niveau, format (chez le professeur, chez l’élève, à distance), tarif et distance. Contact 100 % gratuit sans commission.",
  alternates: {
    canonical: "/professeurs",
  },
  openGraph: {
    title: "Professeurs particuliers en Belgique et à distance — Clutch",
    description:
      "Comparez les professeurs particuliers près de chez vous ou en ligne et contactez-les gratuitement sans commission.",
    url: "/professeurs",
  },
};

export default async function TutorsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialView = params.vue === "carte" ? "carte" : "liste";
  const highlightId = typeof params.highlight === "string" ? params.highlight : undefined;
  const initialUrlQuery = typeof params.q === "string" ? params.q : undefined;
  const initialUrlCity = typeof params.ville === "string" ? params.ville : undefined;

  let initialTutors;
  try {
    initialTutors = await fetchTutors();
  } catch {
    initialTutors = undefined;
  }

  const list = initialTutors ?? [];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", url: "/" },
          { name: "Professeurs particuliers", url: "/professeurs" },
        ])}
      />
      <JsonLd data={tutorListJsonLd(list, "/professeurs", "Professeurs particuliers sur Clutch")} />
      <Catalog
        initialTutors={initialTutors}
        initialView={initialView}
        highlightId={highlightId}
        initialUrlQuery={initialUrlQuery}
        initialUrlCity={initialUrlCity}
        afterGrid={<SeoDirectory subjectsTitle="Rechercher par matière" citiesTitle="Rechercher par ville" />}
      />
    </>
  );
}
