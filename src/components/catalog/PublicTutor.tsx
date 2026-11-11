"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { firstName, formatRate, Portrait } from "@/components/site/TutorCard";
import ReportButton from "@/components/site/ReportButton";
import {
  fetchFavoriteIds,
  fetchReviews,
  fetchTutor,
  fetchTutorContactPhone,
  findTutorMatch,
  toggleFavorite,
  type Review,
  type Tutor,
} from "@/lib/db";
import { diplomaLine, responseLabel } from "@/lib/trust";

export default function PublicTutor({
  id,
  initialTutor,
  initialReviews,
}: {
  id: string;
  initialTutor?: Tutor | null;
  initialReviews?: Review[];
}) {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(initialTutor ?? null);
  const [loaded, setLoaded] = useState(initialTutor !== undefined);
  const [saved, setSaved] = useState(false);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>(initialReviews ?? []);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    Promise.all([fetchTutor(id), fetchReviews(id)])
      .then(([profile, notes]) => {
        if (cancel) return;
        setTutor(profile);
        setReviews(notes);
      })
      .catch((err: Error) => {
        if (!cancel && initialTutor === undefined) setError(err.message);
      })
      .finally(() => {
        if (!cancel) setLoaded(true);
      });
    return () => {
      cancel = true;
    };
  }, [id, initialTutor]);

  useEffect(() => {
    if (!userId) return;
    let cancel = false;
    fetchFavoriteIds(userId)
      .then((ids) => {
        if (!cancel) setSaved(ids.has(id));
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [userId, id]);

  const hasContactPhone = Boolean(tutor?.hasContactPhone);
  useEffect(() => {
    if (!isSignedIn || !hasContactPhone) return;
    let cancel = false;
    fetchTutorContactPhone(id)
      .then((phone) => {
        if (!cancel) setContactPhone(phone);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [isSignedIn, hasContactPhone, id]);

  async function contact() {
    if (!tutor) return;
    const draft = `Bonjour ${firstName(tutor.name)}, je souhaite organiser un cours de…`;
    const next = `/messages/nouveau?tutor=${tutor.id}&draft=${encodeURIComponent(draft)}`;
    if (!isSignedIn || !userId) {
      router.push(`/connexion?next=${encodeURIComponent(next)}`);
      return;
    }
    if (tutor.clerkId === userId) {
      router.push("/annonce");
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

  if (!loaded) {
    return (
      <main className="grid min-h-[50vh] place-items-center text-black/60">
        {error || "Chargement du profil…"}
      </main>
    );
  }

  if (!tutor) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-black/65">{error || "Ce profil de professeur est introuvable."}</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-[#12382c] px-5 py-2.5 text-sm font-extrabold text-white"
        >
          ← Tous les professeurs
        </Link>
      </main>
    );
  }

  const isOwnProfile = Boolean(userId && tutor.clerkId === userId);
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
                {responseLabel(tutor.responseMinutes) ? (
                  <p className="mt-1 text-sm font-semibold text-black/55">
                    {responseLabel(tutor.responseMinutes)}
                  </p>
                ) : null}
              </div>
              {isSignedIn && !isOwnProfile ? (
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

      {diplomaLine(tutor) ? (
        <section className="mt-4 rounded-3xl bg-white p-6">
          <h2 className="font-extrabold">Diplôme</h2>
          <p className="mt-3 text-sm leading-7 text-black/75">{diplomaLine(tutor)}</p>
        </section>
      ) : null}

      {tutor.hasContactPhone ? (
        <section className="mt-4 rounded-3xl bg-white p-6">
          <h2 className="font-extrabold">Téléphone</h2>
          {isSignedIn ? (
            contactPhone ? (
              <p className="mt-3 text-sm leading-7">
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="font-extrabold text-[#0d9f7a] hover:underline"
                >
                  {contactPhone}
                </a>
              </p>
            ) : (
              <p className="mt-3 text-sm text-black/50">Chargement du numéro…</p>
            )
          ) : (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-extrabold tracking-wider text-black/60 select-none blur-[5px]" aria-hidden="true">
                0470 12 34 56
              </p>
              <Link
                href={`/connexion?next=${encodeURIComponent(`/tuteur/${tutor.id}`)}`}
                className="rounded-full bg-[#12382c] px-4 py-2 text-xs font-extrabold text-white"
              >
                Connecte-toi pour voir le numéro
              </Link>
            </div>
          )}
        </section>
      ) : null}

      <section className="mt-4 rounded-3xl bg-white p-6">
        <h2 className="font-extrabold">Commentaires</h2>
        {reviews.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="text-sm leading-6 text-black/75">
                <p>
                  <span className="text-[#e6b800]">{"★".repeat(review.rating)}</span>{" "}
                  {review.comment || "Avis sans commentaire."}
                </p>
                {review.reply ? (
                  <p className="mt-2 rounded-2xl bg-[#f6f7f8] px-3 py-2 text-black/70">
                    <span className="font-extrabold">{name} répond. </span>
                    {review.reply}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-black/50">Pas encore de commentaire.</p>
        )}
      </section>

      <div className="sticky bottom-4 mt-6">
        {isOwnProfile ? (
          <div className="rounded-3xl border border-black/10 bg-white p-4 text-center shadow-[0_8px_30px_rgba(15,28,26,0.08)]">
            <p className="text-sm font-semibold text-black/75">
              C’est ton propre profil : tu ne peux pas contacter ton propre profil ni t’envoyer un message.
            </p>
            <Link
              href="/annonce"
              className="mt-3 grid h-11 w-full place-items-center rounded-full bg-[#12382c] text-sm font-extrabold text-white"
            >
              Modifier mon annonce
            </Link>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={contact}
              className="h-12 w-full rounded-full bg-[#0d9f7a] text-sm font-extrabold text-white"
            >
              {isSignedIn
                ? "Envoyer un message gratuitement"
                : "Connecte-toi pour envoyer un message"}
            </button>
            {!isSignedIn ? (
              <p className="mt-2 text-center text-xs text-black/55">
                Un compte gratuit est requis pour écrire à un professeur.{" "}
                <Link href="/inscription" className="font-bold text-[#087a5c] underline">
                  Créer un compte
                </Link>
              </p>
            ) : null}
            {error ? <p className="mt-2 text-center text-sm text-[#c23b3b]">{error}</p> : null}
            <div className="mt-3 flex justify-center">
              <ReportButton
                userId={userId}
                signedIn={Boolean(isSignedIn)}
                targetType="profile"
                targetId={tutor.id}
                label="Signaler ce profil"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
