import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Catalog from "@/components/catalog/Catalog";
import FaqBlock from "@/components/site/FaqBlock";
import JsonLd from "@/components/site/JsonLd";
import SeoDirectory from "@/components/site/SeoDirectory";
import { matchesTutor } from "@/components/site/filters";
import { fetchTutors, type Tutor } from "@/lib/db";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  getSubjectBySlug,
  SUBJECT_PAGES,
  tutorListJsonLd,
} from "@/lib/seo";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SUBJECT_PAGES.map((subject) => ({ slug: subject.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) {
    return {
      title: "Matière introuvable",
      robots: { index: false, follow: false },
    };
  }
  const canonical = `/cours/${subject.slug}`;
  return {
    title: subject.title,
    description: subject.description,
    alternates: { canonical },
    openGraph: {
      title: `${subject.title} — Clutch`,
      description: subject.description,
      url: canonical,
    },
  };
}

export default async function SubjectLandingPage({ params }: Props) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  let allTutors: Tutor[] = [];
  try {
    allTutors = await fetchTutors();
  } catch {
    allTutors = [];
  }

  const matched = allTutors.filter((tutor) =>
    matchesTutor(tutor, {
      query: subject.name,
      city: "",
      formats: [],
      levels: [],
      maxRate: null,
      radiusKm: null,
      origin: null,
    })
  );

  const canonical = `/cours/${subject.slug}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", url: "/" },
          { name: "Professeurs particuliers", url: "/professeurs" },
          { name: subject.name, url: canonical },
        ])}
      />
      <JsonLd data={tutorListJsonLd(matched, canonical, subject.headline)} />
      <JsonLd data={faqJsonLd(subject.faq)} />

      <Catalog
        initialTutors={allTutors}
        presetSubject={subject.name}
        heading={subject.headline}
        subheading={subject.description}
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
            <span className="text-[#0f1c1a]">{subject.name}</span>
          </nav>
        }
        afterGrid={
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8">
              <h2 className="font-display text-2xl font-bold text-[#0f1c1a]">
                Trouver un professeur de {subject.name} sur Clutch
              </h2>
              <p className="mt-3 text-sm leading-7 text-black/65">{subject.intro}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {subject.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-[#e7f6f1] px-3 py-1.5 text-xs font-bold text-[#087a5c]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </section>

            <FaqBlock items={subject.faq} title={`Questions fréquentes — ${subject.name}`} />

            <SeoDirectory
              excludeSubjectSlug={subject.slug}
              subjectsTitle="Autres matières"
              citiesTitle="Par ville en Belgique"
            />
          </div>
        }
      />
    </>
  );
}
