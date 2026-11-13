import type { Metadata } from "next";
import Link from "next/link";
import Catalog from "@/components/catalog/Catalog";
import JsonLd from "@/components/site/JsonLd";
import { fetchTutors } from "@/lib/db";
import { breadcrumbJsonLd, CITY_PAGES, SUBJECT_PAGES, tutorListJsonLd } from "@/lib/seo";

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
        afterGrid={
          <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0f1c1a]">
                Rechercher par matière
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUBJECT_PAGES.map((subject) => (
                  <Link
                    key={subject.slug}
                    href={`/cours/${subject.slug}`}
                    className="rounded-full bg-[#f6f7f8] px-3 py-1.5 text-xs font-semibold text-[#12382c] transition hover:bg-[#e7f6f1] hover:text-[#087a5c]"
                  >
                    {subject.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#0f1c1a]">
                Rechercher par ville en Belgique
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {CITY_PAGES.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/villes/${city.slug}`}
                    className="rounded-full bg-[#f6f7f8] px-3 py-1.5 text-xs font-semibold text-[#12382c] transition hover:bg-[#e7f6f1] hover:text-[#087a5c]"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        }
      />
    </>
  );
}
