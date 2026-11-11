import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicTutor from "@/components/catalog/PublicTutor";
import { firstName } from "@/components/site/TutorCard";
import { fetchReviews, fetchTutor } from "@/lib/db";
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
        title: "Professeur introuvable — Clutch",
        robots: { index: false, follow: false },
      };
    }
    const name = firstName(tutor.name);
    const subject = tutor.specialties[0] || tutor.subject || "cours particuliers";
    const place = tutor.city ? ` à ${tutor.city}` : "";
    const title = `${name} — Professeur de ${subject}${place} | Clutch`;
    const description =
      tutor.bio.trim() ||
      `Contactez ${name} gratuitement sur Clutch pour des cours de ${subject}${place}.`;
    const url = `${SITE_URL}/tuteur/${id}`;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: "Clutch",
        locale: "fr_FR",
        type: "profile",
        images: [tutor.avatarUrl || "/logo.png"],
      },
    };
  } catch {
    return {
      title: "Profil professeur — Clutch",
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
  return <PublicTutor id={id} initialTutor={initialTutor} initialReviews={initialReviews} />;
}
