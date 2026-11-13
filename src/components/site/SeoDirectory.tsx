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
      <div className="rounded-3xl border border-[#087a5c]/12 bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-[#087a5c]/10 pb-4">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#087a5c] uppercase">
              Matières
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-[#0f1c1a]">{subjectsTitle}</h2>
            <p className="mt-1 text-xs text-black/55">
              Primaire, secondaire, supérieur et préparation aux examens.
            </p>
          </div>
          <Link
            href="/professeurs"
            className="shrink-0 rounded-full bg-[#e7f6f1] px-3 py-1.5 text-xs font-bold text-[#087a5c] transition hover:bg-[#087a5c] hover:text-white"
          >
            Tout voir →
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
          {subjects.map((subject) => (
            <li key={subject.slug}>
              <Link
                href={`/cours/${subject.slug}`}
                className="group inline-flex items-center gap-2 text-sm font-medium text-[#1c1c1c]/80 transition hover:text-[#087a5c]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0d9f7a]/50 transition group-hover:bg-[#087a5c]"
                />
                <span className="truncate">{subject.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-[#087a5c]/12 bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-[#087a5c]/10 pb-4">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#087a5c] uppercase">
              Villes
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-[#0f1c1a]">{citiesTitle}</h2>
            <p className="mt-1 text-xs text-black/55">
              Chez le professeur, chez l’élève ou à distance sans commission.
            </p>
          </div>
          <Link
            href="/professeurs?vue=carte"
            className="shrink-0 rounded-full bg-[#e7f6f1] px-3 py-1.5 text-xs font-bold text-[#087a5c] transition hover:bg-[#087a5c] hover:text-white"
          >
            Carte →
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
          {cities.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/villes/${city.slug}`}
                className="group inline-flex items-center gap-2 text-sm font-medium text-[#1c1c1c]/80 transition hover:text-[#087a5c]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0d9f7a]/50 transition group-hover:bg-[#087a5c]"
                />
                <span className="truncate">{city.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
