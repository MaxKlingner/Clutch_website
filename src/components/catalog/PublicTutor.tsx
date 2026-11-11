"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSession } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import BackLink from "@/components/site/BackLink";
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

function formatReviewDate(iso: string) {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("fr-BE", { month: "short", year: "numeric" }).format(parsed);
}

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
  const { session } = useSession();
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(initialTutor ?? null);
  const [loaded, setLoaded] = useState(initialTutor !== undefined);
  const [saved, setSaved] = useState(false);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [phoneState, setPhoneState] = useState<"idle" | "loaded" | "error">("idle");
  const [phoneRetry, setPhoneRetry] = useState(0);
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
  const hasSession = Boolean(session);
  useEffect(() => {
    if (!isSignedIn || !hasSession || !hasContactPhone) return;
    let cancel = false;
    fetchTutorContactPhone(id)
      .then((phone) => {
        if (cancel) return;
        setContactPhone(phone);
        setPhoneState("loaded");
      })
      .catch(() => {
        if (!cancel) setPhoneState("error");
      });
    return () => {
      cancel = true;
    };
  }, [isSignedIn, hasSession, hasContactPhone, id, phoneRetry]);

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
        <BackLink className="mt-4 inline-block rounded-full bg-[#12382c] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#087a5c]" />
      </main>
    );
  }

  const isOwnProfile = Boolean(userId && tutor.clerkId === userId);
  const name = firstName(tutor.name);
  const subjects = tutor.specialties.length
    ? tutor.specialties
    : tutor.subject
      ? [tutor.subject]
      : [];
  const placeLabel = tutor.city
    ? tutor.postalCode
      ? `${tutor.city} (${tutor.postalCode})`
      : tutor.city
    : "À préciser";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <BackLink />

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
        <div className="min-w-0 space-y-5">
          <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.05)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4 sm:contents">
                <Portrait
                  name={tutor.name}
                  url={tutor.avatarUrl}
                  className="aspect-square h-28 w-28 shrink-0 rounded-2xl object-cover sm:h-36 sm:w-36"
                />
                <div className="min-w-0 flex-1 sm:hidden">
                  <p className="text-xs font-extrabold tracking-wide text-black/45 uppercase">
                    Tarif horaire
                  </p>
                  <p className="mt-1">
                    <span className="font-display text-3xl font-bold text-[#0f1c1a]">
                      {formatRate(tutor.hourlyRate)} €
                    </span>
                    <span className="ml-1 text-sm font-semibold text-black/50">/ heure</span>
                  </p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="font-display text-3xl font-bold tracking-tight break-words text-[#0f1c1a] sm:text-4xl">
                      {name}
                    </h1>
                    <p className="mt-2 hidden sm:block lg:hidden">
                      <span className="font-display text-2xl font-bold text-[#0f1c1a]">
                        {formatRate(tutor.hourlyRate)} €
                      </span>
                      <span className="ml-1 text-sm font-semibold text-black/50">/ heure</span>
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold">
                      {tutor.rating > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff9e6] px-3 py-1 font-bold text-[#8a6500]">
                          <span className="text-[#e6b800]">★</span>
                          {tutor.rating.toFixed(1)} · {tutor.reviewCount} avis
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#e7f6f1] px-3 py-1 font-bold text-[#087a5c]">
                          Nouveau professeur
                        </span>
                      )}
                      <span className="rounded-full bg-[#f6f7f8] px-3 py-1 text-black/75">
                        {placeLabel}
                      </span>
                    </div>
                  </div>
                  {isSignedIn && !isOwnProfile ? (
                    <button
                      type="button"
                      onClick={onToggleSave}
                      aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 text-xl transition hover:border-black/25 ${
                        saved ? "text-[#e23b4a]" : "text-black/35"
                      }`}
                    >
                      {saved ? "♥" : "♡"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {tutor.bio ? (
              <p className="mt-6 border-l-2 border-[#0d9f7a] pl-4 text-base leading-7 font-medium text-[#0f1c1a]/85">
                {tutor.bio}
              </p>
            ) : null}

            <div className="mt-6 space-y-3 border-t border-black/5 pt-5">
              {subjects.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold tracking-wide text-black/40 uppercase">
                    Matières
                  </span>
                  {subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-[#e7f6f1] px-3 py-1 text-xs font-bold text-[#087a5c]"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              ) : null}
              {tutor.taughtLevels.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold tracking-wide text-black/40 uppercase">
                    Public
                  </span>
                  {tutor.taughtLevels.map((level) => (
                    <span
                      key={level}
                      className="rounded-full bg-[#f6f7f8] px-3 py-1 text-xs font-semibold text-black/70"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              ) : null}
              {tutor.teachingFormats.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold tracking-wide text-black/40 uppercase">
                    Format
                  </span>
                  {tutor.teachingFormats.map((format) => (
                    <span
                      key={format}
                      className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/75"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {tutor.hasContactPhone ? (
              <div className="mt-5 border-t border-black/5 pt-4 lg:hidden">
                <ContactPhoneSection
                  tutorId={tutor.id}
                  isSignedIn={Boolean(isSignedIn)}
                  contactPhone={contactPhone}
                  phoneState={phoneState}
                  onRetry={() => {
                    setPhoneState("idle");
                    setPhoneRetry((n) => n + 1);
                  }}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.05)] sm:p-8">
            <h2 className="font-display text-xl font-bold text-[#0f1c1a]">
              À propos de {name}
            </h2>
            <p className="mt-3 text-sm leading-7 whitespace-pre-line text-black/75">
              {tutor.aboutTutor || "Présentation à venir."}
            </p>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.05)] sm:p-8">
            <h2 className="font-display text-xl font-bold text-[#0f1c1a]">
              Déroulement du cours
            </h2>
            <p className="mt-3 text-sm leading-7 whitespace-pre-line text-black/75">
              {tutor.aboutCourse || "Le déroulement du cours sera précisé."}
            </p>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.05)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-[#0f1c1a]">
                Avis des élèves
              </h2>
              {reviews.length ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fff9e6] px-3 py-1 text-xs font-bold text-[#8a6500]">
                  <span className="text-[#e6b800]">★</span>
                  {tutor.rating.toFixed(1)} · {tutor.reviewCount} avis
                </span>
              ) : null}
            </div>

            {reviews.length ? (
              <div className="mt-5 space-y-4">
                {reviews.map((review) => {
                  const dateLabel = formatReviewDate(review.createdAt);
                  return (
                    <article key={review.id} className="rounded-2xl bg-[#f6f7f8] p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm tracking-wide">
                          <span className="text-[#e6b800]">{"★".repeat(review.rating)}</span>
                          <span className="text-black/15">{"★".repeat(5 - review.rating)}</span>
                        </span>
                        {dateLabel ? (
                          <span className="text-xs font-medium text-black/45 capitalize">
                            {dateLabel}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-black/80">
                        {review.comment || "Avis sans commentaire."}
                      </p>
                      {review.reply ? (
                        <div className="mt-3 rounded-xl border border-black/5 bg-white p-3 text-sm leading-6 text-black/75">
                          <span className="font-extrabold text-[#12382c]">
                            Réponse de {name} :{" "}
                          </span>
                          {review.reply}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-black/50">
                Pas encore d’avis. Échange avec {name} pour être le premier à laisser un retour.
              </p>
            )}
          </section>
          {isOwnProfile ? (
            <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,28,26,0.05)] lg:hidden">
              <OwnProfileNotice />
            </div>
          ) : (
            <div className="flex justify-center pt-1 lg:hidden">
              <ReportButton
                userId={userId}
                signedIn={Boolean(isSignedIn)}
                targetType="profile"
                targetId={tutor.id}
                label="Signaler ce profil"
              />
            </div>
          )}
        </div>

        <aside className="hidden space-y-4 lg:sticky lg:top-[calc(var(--site-header,3.5rem)+1.5rem)] lg:block">
          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(15,28,26,0.07)] ring-1 ring-black/5">
            <div>
              <p>
                <span className="font-display text-4xl font-bold text-[#0f1c1a]">
                  {formatRate(tutor.hourlyRate)} €
                </span>
                <span className="ml-1 text-sm font-semibold text-black/50">/ heure</span>
              </p>
            </div>

            <dl className="mt-5 space-y-3 border-t border-black/5 pt-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-black/50">Commune</dt>
                <dd className="text-right font-semibold text-[#0f1c1a]">{placeLabel}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-black/50">Format</dt>
                <dd className="text-right font-semibold text-[#0f1c1a]">
                  {tutor.teachingFormats.join(" · ") || "À préciser"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-black/50">Public</dt>
                <dd className="text-right font-semibold text-[#0f1c1a]">
                  {tutor.taughtLevels.join(", ") || "À préciser"}
                </dd>
              </div>
            </dl>

            {tutor.hasContactPhone ? (
              <div className="mt-5 border-t border-black/5 pt-4">
                <ContactPhoneSection
                  tutorId={tutor.id}
                  isSignedIn={Boolean(isSignedIn)}
                  contactPhone={contactPhone}
                  phoneState={phoneState}
                  onRetry={() => {
                    setPhoneState("idle");
                    setPhoneRetry((n) => n + 1);
                  }}
                />
              </div>
            ) : null}

            <div className="mt-5 border-t border-black/5 pt-5">
              {isOwnProfile ? (
                <OwnProfileNotice />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={contact}
                    className="h-12 w-full rounded-full bg-[#0d9f7a] text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(13,159,122,0.22)] transition hover:bg-[#087a5c]"
                  >
                    {isSignedIn
                      ? "Envoyer un message gratuitement"
                      : "Connecte-toi pour envoyer un message"}
                  </button>
                  {!isSignedIn ? (
                    <p className="mt-2.5 text-center text-xs text-black/55">
                      Un compte gratuit est requis pour écrire à un professeur.{" "}
                      <Link href="/inscription" className="font-bold text-[#087a5c] underline">
                        Créer un compte
                      </Link>
                    </p>
                  ) : null}
                </>
              )}
              {error ? <p className="mt-3 text-center text-sm text-[#c23b3b]">{error}</p> : null}
            </div>

            {!isOwnProfile ? (
              <div className="mt-4 flex justify-center border-t border-black/5 pt-4">
                <ReportButton
                  userId={userId}
                  signedIn={Boolean(isSignedIn)}
                  targetType="profile"
                  targetId={tutor.id}
                  label="Signaler ce profil"
                />
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {!isOwnProfile ? (
        <div className="sticky bottom-4 z-20 mt-6 lg:hidden">
          {error ? (
            <p className="mb-2 rounded-2xl bg-[#fdf1f1] px-4 py-2 text-center text-xs font-semibold text-[#c23b3b] shadow-sm">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={contact}
            className="h-12 w-full rounded-full bg-[#0d9f7a] text-sm font-extrabold text-white shadow-[0_12px_32px_rgba(13,159,122,0.3)] transition hover:bg-[#087a5c]"
          >
            {isSignedIn
              ? `Contacter ${name} · ${formatRate(tutor.hourlyRate)} €/h`
              : "Connecte-toi pour envoyer un message"}
          </button>
        </div>
      ) : null}
    </main>
  );
}

function ContactPhoneSection({
  tutorId,
  isSignedIn,
  contactPhone,
  phoneState,
  onRetry,
}: {
  tutorId: string;
  isSignedIn: boolean;
  contactPhone: string | null;
  phoneState: "idle" | "loaded" | "error";
  onRetry: () => void;
}) {
  return (
    <>
      <p className="text-xs font-extrabold tracking-wide text-black/45 uppercase">Téléphone</p>
      {isSignedIn ? (
        contactPhone ? (
          <a
            href={`tel:${contactPhone.replace(/\s+/g, "")}`}
            className="mt-2 flex items-center justify-between rounded-2xl bg-[#f3fbf8] px-4 py-3 text-sm font-extrabold text-[#087a5c] ring-1 ring-[#0d9f7a]/20 transition hover:bg-[#e7f6f1]"
          >
            <span>{contactPhone}</span>
            <span className="text-xs">Appeler →</span>
          </a>
        ) : phoneState === "error" ? (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-[#fdf1f1] px-3.5 py-2.5 text-xs font-semibold text-[#c23b3b]">
            <span>Numéro indisponible (accès refusé).</span>
            <button type="button" onClick={onRetry} className="shrink-0 font-extrabold underline">
              Réessayer
            </button>
          </div>
        ) : phoneState === "loaded" ? (
          <p className="mt-2 text-sm text-black/50">Numéro non communiqué.</p>
        ) : (
          <p className="mt-2 text-sm text-black/50">Chargement du numéro…</p>
        )
      ) : (
        <div className="mt-2 rounded-2xl bg-[#f6f7f8] p-3.5">
          <p
            className="text-sm font-extrabold tracking-wider text-black/60 select-none blur-[5px]"
            aria-hidden="true"
          >
            0470 12 34 56
          </p>
          <Link
            href={`/connexion?next=${encodeURIComponent(`/tuteur/${tutorId}`)}`}
            className="mt-2.5 inline-block rounded-full bg-[#12382c] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#087a5c]"
          >
            Connecte-toi pour voir le numéro
          </Link>
        </div>
      )}
    </>
  );
}

function OwnProfileNotice() {
  return (
    <div className="rounded-2xl bg-[#f6f7f8] p-4 text-center">
      <p className="text-xs leading-5 font-semibold text-black/70">
        C’est ton propre profil : tu ne peux pas contacter ton propre profil ni t’envoyer un message.
      </p>
      <Link
        href="/annonce"
        className="mt-3 grid h-11 w-full place-items-center rounded-full bg-[#12382c] text-sm font-extrabold text-white transition hover:bg-[#087a5c]"
      >
        Modifier mon annonce
      </Link>
    </div>
  );
}
