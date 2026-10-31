"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  fetchFavoriteIds,
  fetchReviews,
  fetchTutor,
  findTutorMatch,
  toggleFavorite,
  type Tutor,
} from "@/lib/db";
import { Avatar } from "@/components/space/Discover";

export default function TutorProfile({ id }: { id: string }) {
  const { userId } = useAuth();
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [contacted, setContacted] = useState(false);
  const [reviews, setReviews] = useState<
    { id: string; rating: number; comment: string; createdAt: string }[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    Promise.all([fetchTutor(id), fetchFavoriteIds(userId), fetchReviews(id), findTutorMatch(userId, id)])
      .then(([profile, favs, notes, match]) => {
        setTutor(profile);
        setFavorite(favs.has(id));
        setReviews(notes);
        setContacted(Boolean(match));
      })
      .catch((err: Error) => setError(err.message));
  }, [id, userId]);

  async function openChat() {
    if (!userId || !tutor) return;
    const existing = await findTutorMatch(userId, tutor.id);
    if (existing) {
      router.push(`/espace/messages/${existing.id}`);
      return;
    }
    const draft = `Bonjour ${tutor.name.split(" ")[0]}, je souhaite réserver un cours pour…`;
    router.push(
      `/espace/messages/nouveau?tutor=${tutor.id}&draft=${encodeURIComponent(draft)}`
    );
  }

  if (!tutor) {
    return <p className="text-white/60">{error || "Chargement du profil…"}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/espace" className="text-sm text-white/60">
        ← Découvrir
      </Link>
      <div className="mt-4 flex items-center gap-4">
        <Avatar name={tutor.name} url={tutor.avatarUrl} />
        <div>
          <h1 className="font-display text-3xl font-bold">{tutor.name.split(" ")[0]}</h1>
          <p className="text-sm text-white/70">
            {tutor.rating > 0 ? `★ ${tutor.rating.toFixed(1)} · ${tutor.reviewCount} avis` : "Pas encore d’avis"}
          </p>
          <p className="text-sm text-white/55">{tutor.lessonsGiven} cours donnés avec succès</p>
        </div>
        <button
          className="ml-auto text-2xl"
          onClick={async () => {
            if (!userId) return;
            await toggleFavorite(userId, tutor.id, !favorite);
            setFavorite((value) => !value);
          }}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>
      <p className="mt-6 text-white/80">{tutor.bio || "Présentation à venir."}</p>
      <ul className="mt-6 space-y-2 text-sm text-white/75">
        <li>{formatRate(tutor.hourlyRate)} € / h</li>
        <li>{tutor.city || "Lieu à préciser"}</li>
        <li>{tutor.specialties.join(", ") || "Matières à préciser"}</li>
        <li>{tutor.teachingFormats.join(" · ") || "Format à préciser"}</li>
      </ul>
      {tutor.aboutTutor ? (
        <section className="mt-8">
          <h2 className="font-extrabold">À propos de {tutor.name.split(" ")[0]}</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">{tutor.aboutTutor}</p>
        </section>
      ) : null}
      {tutor.aboutCourse ? (
        <section className="mt-6">
          <h2 className="font-extrabold">À propos du cours</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">{tutor.aboutCourse}</p>
        </section>
      ) : null}
      <section className="mt-8">
        <h2 className="font-extrabold">Commentaires</h2>
        {reviews.length ? (
          reviews.map((review) => (
            <p key={review.id} className="mt-3 text-sm text-white/75">
              {"★".repeat(review.rating)} {review.comment || "Avis sans commentaire."}
            </p>
          ))
        ) : (
          <p className="mt-2 text-sm text-white/50">Pas encore de commentaire.</p>
        )}
      </section>
      <div className="sticky bottom-4 mt-8">
        {contacted ? (
          <p className="mb-2 text-center text-xs font-extrabold text-[#3DDC97]">Déjà contacté</p>
        ) : null}
        <button
          onClick={openChat}
          className="h-12 w-full rounded-full bg-[#1B6B45] text-sm font-extrabold"
        >
          Envoyer un message
        </button>
        {error ? <p className="mt-2 text-center text-sm text-[#FF8A80]">{error}</p> : null}
      </div>
    </div>
  );
}

function formatRate(rate: number) {
  if (!rate) return "—";
  return Number.isInteger(rate) ? String(rate) : rate.toFixed(2);
}
