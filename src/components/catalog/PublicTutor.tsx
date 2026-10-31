"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { firstName, formatRate, Portrait } from "@/components/site/TutorCard";
import {
  fetchFavoriteIds,
  fetchReviews,
  fetchTutor,
  findTutorMatch,
  toggleFavorite,
  type Tutor,
} from "@/lib/db";

export default function PublicTutor({ id }: { id: string }) {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState<
    { id: string; rating: number; comment: string; createdAt: string }[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchTutor(id), fetchReviews(id)])
      .then(([profile, notes]) => {
        setTutor(profile);
        setReviews(notes);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (!userId) return;
    fetchFavoriteIds(userId)
      .then((ids) => setSaved(ids.has(id)))
      .catch(() => undefined);
  }, [userId, id]);

  async function contact() {
    if (!tutor) return;
    const draft = `Bonjour ${firstName(tutor.name)}, je souhaite réserver un cours pour…`;
    const next = `/messages/nouveau?tutor=${tutor.id}&draft=${encodeURIComponent(draft)}`;
    if (!isSignedIn || !userId) {
      router.push(`/connexion?next=${encodeURIComponent(next)}`);
      return;
    }
    const existing = await findTutorMatch(userId, tutor.id);
    router.push(existing ? `/messages/${existing.id}` : next);
  }

  async function onToggleSave() {
    if (!userId || !tutor) return;
    const next = !saved;
    setSaved(next);
    try {
      await toggleFavorite(userId, tutor.id, next);
    } catch (err) {
      setSaved(!next);
      setError(err instanceof Error ? err.message : "Favori impossible.");
    }
  }

  if (!tutor) {
    return (
      <main className="grid min-h-[50vh] place-items-center text-black/60">
        {error || "Chargement du profil…"}
      </main>
    );
  }

  const name = firstName(tutor.name);
  const facts = [
    { label: "Tarif", value: `${formatRate(tutor.hourlyRate)} €/h` },
    {
      label: "Avis",
      value:
        tutor.rating > 0 ? `${tutor.rating.toFixed(1)} · ${tutor.reviewCount}` : "Nouveau",
    },
    { label: "Cours donnés", value: String(tutor.lessonsGiven) },
    { label: "Ville", value: tutor.city || "À préciser" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm font-semibold text-black/55">
        ← Tous les professeurs
      </Link>
      <div className="mt-4 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,28,26,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <Portrait
            name={tutor.name}
            url={tutor.avatarUrl}
            className="aspect-square h-40 w-40 shrink-0 rounded-2xl object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate font-display text-3xl font-bold">{name}</h1>
                <p className="mt-1 text-sm font-semibold text-black/75">
                  {tutor.specialties.join(" · ") || "Matières à préciser"}
                </p>
                <p className="mt-1 text-sm text-black/55">
                  {tutor.teachingFormats.join(" · ") || "Format à préciser"}
                  {tutor.taughtLevels.length ? ` · ${tutor.taughtLevels.join(" · ")}` : ""}
                </p>
              </div>
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={onToggleSave}
                  aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
                  className={`text-2xl ${saved ? "text-[#e23b4a]" : "text-black/35"}`}
                >
                  {saved ? "♥" : "♡"}
                </button>
              ) : null}
            </div>
            <dl className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col justify-center rounded-2xl bg-[#f6f7f8] px-4 py-3">
                  <dt className="text-xs font-semibold text-black/45">{fact.label}</dt>
                  <dd className="mt-1 truncate font-extrabold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6">
          <h2 className="font-extrabold">À propos</h2>
          <p className="mt-3 text-sm leading-7 text-black/75">{tutor.bio || "Présentation à venir."}</p>
        </section>
        <section className="rounded-3xl bg-white p-6">
          <h2 className="font-extrabold">À propos de {name}</h2>
          <p className="mt-3 text-sm leading-7 text-black/75">
            {tutor.aboutTutor || "Présentation à venir."}
          </p>
        </section>
        <section className="rounded-3xl bg-white p-6 lg:col-span-2">
          <h2 className="font-extrabold">À propos du cours</h2>
          <p className="mt-3 text-sm leading-7 text-black/75">
            {tutor.aboutCourse || "Le déroulement du cours sera précisé."}
          </p>
        </section>
      </div>

      <section className="mt-4 rounded-3xl bg-white p-6">
        <h2 className="font-extrabold">Commentaires</h2>
        {reviews.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <p key={review.id} className="text-sm leading-6 text-black/75">
                <span className="text-[#e6b800]">{"★".repeat(review.rating)}</span>{" "}
                {review.comment || "Avis sans commentaire."}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-black/50">Pas encore de commentaire.</p>
        )}
      </section>

      <div className="sticky bottom-4 mt-6">
        <button
          onClick={contact}
          className="h-12 w-full rounded-full bg-[#0d9f7a] text-sm font-extrabold text-white"
        >
          Envoyer un message
        </button>
        {error ? <p className="mt-2 text-center text-sm text-[#c23b3b]">{error}</p> : null}
      </div>
    </main>
  );
}
