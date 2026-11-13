import Link from "next/link";
import { CITY_PAGES, SUBJECT_PAGES } from "@/lib/seo";

export default function SeoDirectory({
  excludeSubjectSlug,
  excludeCitySlug,
  subjectsTitle = "Cours particuliers par matière",
  citiesTitle = "Professeurs en Belgique",
}: {
  excludeSubjectSlug?: string;
  excludeCitySlug?: string;
  subjectsTitle?: string;
  citiesTitle?: string;
}) {
  const subjects = excludeSubjectSlug
    ? SUBJECT_PAGES.filter((item) => item.slug !== excludeSubjectSlug)
    : SUBJECT_PAGES;
  const cities = excludeCitySlug
    ? CITY_PAGES.filter((item) => item.slug !== excludeCitySlug)
    : CITY_PAGES;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-black/6 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0f1c1a]">{subjectsTitle}</h2>
            <p className="mt-1 text-xs text-black/50">
              Primaire, secondaire, supérieur et préparation aux examens.
            </p>
          </div>
          <Link
            href="/professeurs"
            className="shrink-0 text-xs font-bold text-[#087a5c] hover:underline"
          >
            Tout voir →
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
          {subjects.map((subject) => (
            <li key={subject.slug}>
              <Link
                href={`/cours/${subject.slug}`}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#1c1c1c]/75 transition hover:text-[#087a5c]"
              >
                <span className="truncate">{subject.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-black/6 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0f1c1a]">{citiesTitle}</h2>
            <p className="mt-1 text-xs text-black/50">
              Chez le professeur, chez l’élève ou à distance sans commission.
            </p>
          </div>
          <Link
            href="/professeurs?vue=carte"
            className="shrink-0 text-xs font-bold text-[#087a5c] hover:underline"
          >
            Carte →
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
          {cities.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/villes/${city.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1c1c1c]/75 transition hover:text-[#087a5c]"
              >
                <span className="truncate">{city.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
