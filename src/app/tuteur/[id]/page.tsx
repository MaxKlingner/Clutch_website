import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicTutor from "@/components/catalog/PublicTutor";
import JsonLd from "@/components/site/JsonLd";
import { firstName, formatRate } from "@/components/site/TutorCard";
import { fetchReviews, fetchTutor } from "@/lib/db";
import { breadcrumbJsonLd, getSubjectByName, tutorJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const tutor = await fetchTutor(id);
    if (!tutor) {
      return {
        title: "Professeur introuvable",
        robots: { index: false, follow: false },
      };
    }
    const name = firstName(tutor.name);
    const subject = tutor.specialties[0] || tutor.subject || "cours particuliers";
    const place = tutor.city ? ` à ${tutor.city}` : "";
    const title = `${name} — Professeur de ${subject}${place}`;
    const rate = `${formatRate(tutor.hourlyRate)} €/h`;
    const formats = tutor.teachingFormats.length
      ? ` (${tutor.teachingFormats.join(", ")})`
      : "";
    const rawBio = tutor.bio.trim();
    const description = rawBio
      ? `${rawBio.slice(0, 115)}${rawBio.length > 115 ? "…" : ""} · ${rate}${formats} · Contact gratuit sur Clutch.`
      : `Contactez ${name} gratuitement sur Clutch pour des cours de ${subject}${place} (${rate}${formats}), sans commission.`;
    const canonical = `/tuteur/${id}`;
    const url = `${SITE_URL}${canonical}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${title} | Clutch`,
        description,
        url,
        siteName: "Clutch",
        locale: "fr_BE",
        type: "profile",
        ...(tutor.avatarUrl ? { images: [tutor.avatarUrl] } : {}),
      },
      twitter: {
        card: tutor.avatarUrl ? "summary" : "summary_large_image",
        title: `${title} | Clutch`,
        description,
        ...(tutor.avatarUrl ? { images: [tutor.avatarUrl] } : {}),
      },
    };
  } catch {
    return {
      title: "Profil professeur",
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let initialTutor;
  let initialReviews;
  try {
    const [tutor, reviews] = await Promise.all([fetchTutor(id), fetchReviews(id)]);
    if (!tutor) notFound();
    initialTutor = tutor;
    initialReviews = reviews;
  } catch (err) {
    if ((err as { digest?: string })?.digest === "NEXT_HTTP_ERROR_FALLBACK;404") {
      throw err;
    }
    initialTutor = undefined;
    initialReviews = undefined;
  }

  const primarySubject = initialTutor?.specialties[0] || initialTutor?.subject || "";
  const subjectSeo = primarySubject ? getSubjectByName(primarySubject) : undefined;
  const breadcrumb = [
    { name: "Accueil", url: "/" },
    { name: "Professeurs particuliers", url: "/professeurs" },
    ...(subjectSeo ? [{ name: subjectSeo.name, url: `/cours/${subjectSeo.slug}` }] : []),
    ...(initialTutor
      ? [{ name: firstName(initialTutor.name), url: `/tuteur/${id}` }]
      : []),
  ];

  return (
    <>
      {initialTutor ? (
        <>
          <JsonLd data={breadcrumbJsonLd(breadcrumb)} />
          <JsonLd data={tutorJsonLd(initialTutor, initialReviews ?? [])} />
        </>
      ) : null}
      <PublicTutor id={id} initialTutor={initialTutor} initialReviews={initialReviews} />
    </>
  );
}
