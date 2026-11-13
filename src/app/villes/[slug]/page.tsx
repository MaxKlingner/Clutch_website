import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Catalog from "@/components/catalog/Catalog";
import FaqBlock from "@/components/site/FaqBlock";
import JsonLd from "@/components/site/JsonLd";
import { tutorsForCityHub } from "@/components/site/filters";
import { fetchTutors, type Tutor } from "@/lib/db";
import {
  breadcrumbJsonLd,
  CITY_PAGES,
  faqJsonLd,
  getCityBySlug,
  SUBJECT_PAGES,
  tutorListJsonLd,
} from "@/lib/seo";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CITY_PAGES.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) {
    return {
      title: "Ville introuvable",
      robots: { index: false, follow: false },
    };
  }
  const canonical = `/villes/${city.slug}`;
  return {
    title: city.title,
    description: city.description,
    alternates: { canonical },
    openGraph: {
      title: `${city.headline} — Clutch`,
      description: city.description,
      url: canonical,
    },
  };
}

export default async function CityLandingPage({ params }: Props) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  let allTutors: Tutor[] = [];
  try {
    allTutors = await fetchTutors();
  } catch {
    allTutors = [];
  }

  const matched = tutorsForCityHub(allTutors, {
    name: city.name,
    lat: city.latitude,
    lng: city.longitude,
  });

  const canonical = `/villes/${city.slug}`;
  const otherCities = CITY_PAGES.filter((item) => item.slug !== city.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", url: "/" },
          { name: "Professeurs particuliers", url: "/professeurs" },
          { name: city.name, url: canonical },
        ])}
      />
      <JsonLd data={tutorListJsonLd(matched, canonical, city.headline)} />
      <JsonLd data={faqJsonLd(city.faq)} />

      <Catalog
        initialTutors={allTutors}
        presetCity={{ name: city.name, latitude: city.latitude, longitude: city.longitude }}
        heading={city.headline}
        subheading={city.description}
        breadcrumb={
          <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-black/45">
            <Link href="/" className="hover:text-[#087a5c]">
              Accueil
            </Link>
            <span>›</span>
            <Link href="/professeurs" className="hover:text-[#087a5c]">
              Professeurs
            </Link>
            <span>›</span>
            <span className="text-[#0f1c1a]">{city.name}</span>
          </nav>
        }
        afterGrid={
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8">
              <h2 className="font-display text-2xl font-bold text-[#0f1c1a]">
                Cours particuliers à {city.name} ({city.postalCode}) et à distance
              </h2>
              <p className="mt-3 text-sm leading-7 text-black/65">{city.intro}</p>
            </section>

            <FaqBlock items={city.faq} title={`Questions fréquentes — ${city.name}`} />

            <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0f1c1a]">
                  Matières demandées
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUBJECT_PAGES.slice(0, 10).map((subject) => (
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
                  Autres villes en Belgique
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {otherCities.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/villes/${item.slug}`}
                      className="rounded-full bg-[#f6f7f8] px-3 py-1.5 text-xs font-semibold text-[#12382c] transition hover:bg-[#e7f6f1] hover:text-[#087a5c]"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        }
      />
    </>
  );
}
