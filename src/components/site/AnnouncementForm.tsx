"use client";

import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/site/BackLink";
import PhotoCropper, { photoFileError } from "@/components/site/PhotoCropper";
import { firstName, formatRate, Portrait } from "@/components/site/TutorCard";
import { useRequireUser } from "@/components/site/useRequireUser";
import { LEVEL_GROUPS, fold } from "@/components/site/filters";
import {
  announcementPublished,
  fetchAccountIdentity,
  fetchMyTutorProfile,
  fetchReviews,
  fetchTutorContactPhone,
  FORMATS,
  replyToReview,
  resetAnnouncement,
  ROLES,
  saveAnnouncement,
  setActiveRole,
  SPECIALTIES,
  uploadAnnouncementPhoto,
  type Review,
} from "@/lib/db";
import { diplomaPayload } from "@/lib/trust";
import { resolveLocationQuery, suggestLocations, type ResolvedPlace } from "@/lib/locations";

const LEVEL_OPTIONS = ["Primaire", "Secondaire", "Supérieur", "Formation pour adultes"] as const;

const field =
  "w-full rounded-2xl border border-black/10 bg-[#f6f7f8] px-4 py-3 outline-none focus:border-[#12382c] focus:bg-white";

export default function AnnouncementForm() {
  const ready = useRequireUser();
  const { userId } = useAuth();
  const { user } = useUser();
  const [bio, setBio] = useState("");
  const [aboutTutor, setAboutTutor] = useState("");
  const [aboutCourse, setAboutCourse] = useState("");
  const [diplomaTitle, setDiplomaTitle] = useState("");
  const [diplomaSchool, setDiplomaSchool] = useState("");
  const [diplomaYear, setDiplomaYear] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [rate, setRate] = useState(25);
  const [city, setCity] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [place, setPlace] = useState<ResolvedPlace | null>(null);
  const [placeOpen, setPlaceOpen] = useState(false);
  const placeRoot = useRef<HTMLDivElement>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchMyTutorProfile(userId).then((profile) => {
      if (!profile) return;
      setBio(profile.bio);
      setAboutTutor(profile.aboutTutor);
      setAboutCourse(profile.aboutCourse);
      setDiplomaTitle(profile.diplomaTitle);
      setDiplomaSchool(profile.diplomaSchool);
      setDiplomaYear(profile.diplomaYear ? String(profile.diplomaYear) : "");
      setProfileId(profile.id);
      fetchReviews(profile.id)
        .then((rows) => {
          setReviews(rows);
          setReplyDrafts(Object.fromEntries(rows.map((row) => [row.id, row.reply])));
        })
        .catch(() => setReviews([]));
      setRate(profile.hourlyRate || 25);
      setCity(profile.city || "");
      if (profile.city && profile.latitude != null && profile.longitude != null) {
        setPlace({
          name: profile.city,
          postalCode: profile.postalCode || "",
          latitude: profile.latitude,
          longitude: profile.longitude,
        });
      } else {
        setPlace(resolveLocationQuery(profile.city || ""));
      }
      setSpecialties(profile.specialties.filter((item) => item.trim().toLowerCase() !== "matière"));
      setFormats(normalizeFormats(profile.teachingFormats));
      setLevels(coarseLevels(profile.taughtLevels));
      setPhotoUrl(profile.avatarUrl);
      setPublished(announcementPublished(profile));
      if (profile.hasContactPhone) {
        fetchTutorContactPhone(profile.id)
          .then((phone) => {
            if (phone) setContactPhone(phone);
          })
          .catch(() => undefined);
      }
    });
  }, [userId]);

  useEffect(() => {
    if (!placeOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!placeRoot.current?.contains(event.target as Node)) setPlaceOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [placeOpen]);

  const places = placeOpen ? suggestLocations(city) : [];

  function toggle(list: string[], value: string, set: (next: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function pickPhoto(file: File | undefined) {
    if (!file) return;
    const message = photoFileError(file);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setCropFile(file);
  }

  function applyCropped(file: File) {
    setCropFile(null);
    setPhotoFile(file);
    setPhotoUrl((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;
    const resolvedPhoto = photoUrl || (user?.hasImage ? user.imageUrl : null);
    if (!photoFile && !resolvedPhoto) {
      setError("Ajoute une photo de profil avant de publier.");
      return;
    }
    const resolved = place ?? resolveLocationQuery(city);
    if (!city.trim() || !resolved) {
      setError("Choisis ta commune dans la liste.");
      return;
    }
    if (!bio.trim()) {
      setError("Rédige ton accroche.");
      return;
    }
    if (countWords(bio) > 24) {
      setError("L’accroche ne doit pas dépasser 24 mots.");
      return;
    }
    if (!aboutTutor.trim()) {
      setError("Remplis la section « À propos de toi ».");
      return;
    }
    if (countWords(aboutTutor) > 80) {
      setError("La section « À propos de toi » ne doit pas dépasser 80 mots.");
      return;
    }
    const diploma = diplomaPayload(diplomaTitle, diplomaSchool, diplomaYear, true);
    if ("error" in diploma) {
      setError(diploma.error ?? "Diplôme invalide.");
      return;
    }
    if (!aboutCourse.trim()) {
      setError("Remplis la section « À propos du cours ».");
      return;
    }
    if (countWords(aboutCourse) > 80) {
      setError("La section « À propos du cours » ne doit pas dépasser 80 mots.");
      return;
    }
    if (!specialties.length) {
      setError("Choisis au moins une matière.");
      return;
    }
    if (!levels.length) {
      setError("Choisis au moins un niveau enseigné.");
      return;
    }
    if (!formats.length) {
      setError("Choisis au moins un format de cours.");
      return;
    }
    if (!Number.isFinite(rate) || rate < 5 || rate > 150) {
      setError("Le tarif horaire doit être compris entre 5 € et 150 €.");
      return;
    }
    const cleanPhone = contactPhone.trim();
    if (cleanPhone && cleanPhone.replace(/\D/g, "").length < 6) {
      setError("Le numéro de téléphone semble incomplet.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      let fullName = user?.fullName?.trim() || "";
      if (!fullName) {
        const identity = await fetchAccountIdentity(userId).catch(() => null);
        fullName = [identity?.firstName, identity?.lastName].filter(Boolean).join(" ").trim();
      }
      const avatarUrl = photoFile
        ? await uploadAnnouncementPhoto(userId, photoFile)
        : resolvedPhoto;
      await saveAnnouncement(userId, {
        fullName: fullName || "Tuteur",
        bio: bio.trim(),
        aboutTutor: aboutTutor.trim(),
        aboutCourse: aboutCourse.trim(),
        specialties,
        hourlyRate: rate,
        city: resolved?.name || city,
        postalCode: resolved?.postalCode || null,
        latitude: resolved?.latitude ?? null,
        longitude: resolved?.longitude ?? null,
        teachingFormats: formats,
        taughtLevels: levels,
        diplomaTitle: diploma.diplomaTitle,
        diplomaSchool: diploma.diplomaSchool,
        diplomaYear: diploma.diplomaYear,
        contactPhone: cleanPhone || null,
        avatarUrl,
      });
      await setActiveRole(userId, ROLES.TUTOR, fullName || user?.fullName);
      setPhotoFile(null);
      if (avatarUrl) setPhotoUrl(avatarUrl);
      setPublished(true);
      setMessage("Annonce en ligne. Elle apparaît chez les professeurs disponibles.");
      window.dispatchEvent(new Event("clutch-announcement"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function onRemove() {
    if (!userId || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await resetAnnouncement(userId);
      setSpecialties([]);
      setFormats([]);
      setLevels([]);
      setBio("");
      setAboutTutor("");
      setAboutCourse("");
      setContactPhone("");
      setPublished(false);
      setMessage("Annonce retirée. Elle n’apparaît plus dans la liste.");
      window.dispatchEvent(new Event("clutch-announcement"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <BackLink />
        <p className="grid min-h-[40vh] place-items-center text-black/50">Chargement…</p>
      </main>
    );
  }

  const name = user?.fullName || "Toi";
  const shownPhoto = photoUrl || (user?.hasImage ? user.imageUrl : null);
  const accountPhone =
    (typeof user?.unsafeMetadata?.phone === "string" ? user.unsafeMetadata.phone.trim() : "") ||
    user?.primaryPhoneNumber?.phoneNumber ||
    "";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <BackLink />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#087a5c] uppercase">Annonce</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            {published ? "Mon annonce" : "Publie ton annonce"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">
            Photo, accroche, méthode. C’est la fiche que les élèves lisent avant de t’écrire.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
            published ? "bg-[#e7f6f1] text-[#087a5c]" : "bg-white text-black/45"
          }`}
        >
          {published ? "En ligne" : "Pas encore publiée"}
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Section
            step="1"
            title="Photo et ville"
            hint="Un portrait lumineux, toi seul, le visage dégagé. La ville sert aux élèves près de chez toi."
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <label className="relative h-36 w-36 shrink-0 cursor-pointer">
                <Portrait
                  name={name}
                  url={shownPhoto}
                  className="h-36 w-36 rounded-3xl object-cover"
                />
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/95 py-1 text-center text-xs font-extrabold shadow-sm">
                  Changer
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    pickPhoto(file);
                  }}
                />
              </label>
              <div ref={placeRoot} className="relative min-w-0 flex-1 text-sm">
                <span className="font-semibold text-black/70">Commune</span>
                <input
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setPlace(null);
                    setPlaceOpen(true);
                  }}
                  onFocus={() => setPlaceOpen(true)}
                  placeholder="Commune ou code postal"
                  className={`${field} mt-2`}
                  autoComplete="off"
                />
                {place?.postalCode ? (
                  <p className="mt-2 text-xs font-semibold text-[#087a5c]">{place.postalCode}</p>
                ) : null}
                {places.length ? (
                  <div className="absolute top-[calc(100%+8px)] right-0 left-0 z-30 overflow-hidden rounded-2xl bg-white py-1 shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5">
                    {places.map((item) => (
                      <button
                        key={`${item.postalCode}-${item.name}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setCity(item.name);
                          setPlace(item);
                          setPlaceOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-[#f3f7f5]"
                      >
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-black/45">{item.postalCode}</span>
                      </button>
                    ))}
                  </div>
                ) : placeOpen && city.trim().length >= 2 ? (
                  <p className="absolute top-[calc(100%+8px)] right-0 left-0 z-30 rounded-2xl bg-white px-4 py-3 text-sm text-black/50 shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5">
                    Aucune commune ne correspond.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 border-t border-black/5 pt-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-black/70">
                  Téléphone affiché sur l’annonce (facultatif)
                </span>
                {accountPhone && contactPhone !== accountPhone ? (
                  <button
                    type="button"
                    onClick={() => setContactPhone(accountPhone)}
                    className="text-xs font-bold text-[#087a5c] hover:underline"
                  >
                    Utiliser le numéro de mon compte
                  </button>
                ) : null}
              </div>
              <input
                type="tel"
                inputMode="tel"
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                placeholder="ex. +32 470 12 34 56"
                className={`${field} mt-2`}
              />
              <p className="mt-2 text-xs leading-5 text-black/50">
                Facultatif. Ce numéro reste masqué pour les visiteurs et n’est visible que par les
                utilisateurs connectés avec un compte.
              </p>
            </div>
          </Section>

          <Section
            step="2"
            title="Accroche"
            hint="La phrase sous ta photo. Dis ce que tu enseignes, pour qui, et ce qui te distingue."
          >
            <CountedText
              value={bio}
              max={24}
              rows={3}
              onChange={setBio}
              placeholder="Étudiant en maths, je prépare le secondaire aux contrôles, à Wavre ou en visio."
            />
          </Section>

          <Section
            step="3"
            title="À propos de toi"
            hint="Diplômes, années de pratique, élèves déjà suivis. Écris à la première personne."
          >
            <CountedText value={aboutTutor} max={80} rows={5} onChange={setAboutTutor} />
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <input
                value={diplomaTitle}
                onChange={(event) => setDiplomaTitle(event.target.value)}
                placeholder="Intitulé du diplôme"
                className={field}
              />
              <input
                value={diplomaSchool}
                onChange={(event) => setDiplomaSchool(event.target.value)}
                placeholder="Établissement"
                className={field}
              />
              <input
                value={diplomaYear}
                onChange={(event) => setDiplomaYear(event.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="Année"
                className={field}
              />
            </div>
          </Section>

          <Section
            step="4"
            title="À propos du cours"
            hint="Le déroulement d’une séance : par où tu commences, comment tu fais travailler, ce que l’élève repart avec."
          >
            <CountedText value={aboutCourse} max={80} rows={5} onChange={setAboutCourse} />
          </Section>

          <Section
            step="5"
            title="Matières, niveaux, format"
            hint="Choisis au moins une matière, un niveau et un format. Toutes les sections (sauf le téléphone) sont obligatoires."
          >
            <Picker
              title="Matières"
              options={[...SPECIALTIES]}
              selected={specialties}
              onToggle={(value) => toggle(specialties, value, setSpecialties)}
            />
            <Picker
              title="Niveaux"
              options={[...LEVEL_OPTIONS]}
              selected={levels}
              onToggle={(value) => toggle(levels, value, setLevels)}
            />
            <div className="mt-4">
              <p className="text-sm font-semibold text-black/70">Format</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {FORMATS.map((format) => {
                  const on = formats.includes(format);
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => toggle(formats, format, setFormats)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-extrabold ${
                        on
                          ? "border-[#12382c] bg-[#12382c] text-white"
                          : "border-black/10 bg-[#f6f7f8] text-black/70"
                      }`}
                    >
                      {format}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section step="6" title="Tarif" hint="Un tarif horaire, affiché tel quel sur ta fiche.">
            <div className="flex items-end justify-between gap-4">
              <p className="font-display text-4xl font-bold text-[#0d9f7a]">
                {rate}
                <span className="ml-1 text-base font-semibold text-black/45">€/h</span>
              </p>
              <label className="text-sm font-semibold text-black/55">
                <span className="sr-only">Tarif horaire</span>
                <input
                  type="number"
                  min={5}
                  max={150}
                  value={rate}
                  onChange={(event) => setRate(Math.max(0, Number(event.target.value) || 0))}
                  className="w-24 rounded-xl border border-black/10 bg-[#f6f7f8] px-3 py-2 text-right outline-none focus:border-[#12382c]"
                />
              </label>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={Math.min(80, Math.max(10, rate))}
              onChange={(event) => setRate(Number(event.target.value))}
              className="mt-4 w-full accent-[#0d9f7a]"
            />
            <div className="mt-1 flex justify-between text-xs font-semibold text-black/40">
              <span>10 €</span>
              <span>80 €</span>
            </div>
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--site-header,3.5rem)+1rem)]">
          <div className="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,28,26,0.05)]">
            <p className="text-xs font-extrabold tracking-wide text-black/40 uppercase">Aperçu</p>
            <div className="mt-3">
              <Portrait name={name} url={shownPhoto} className="aspect-square h-auto w-full rounded-2xl object-cover" />
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <p className="truncate font-display text-lg font-bold tracking-tight text-[#0f1c1a]">
                  {firstName(name)}
                </p>
                <p className="shrink-0 text-base font-extrabold text-[#087a5c]">
                  {formatRate(rate)}{" "}
                  <span className="text-xs font-bold text-[#087a5c]/75">€/h</span>
                </p>
              </div>
              <p className="mt-1 truncate text-xs font-medium text-black/55">
                {city.trim() || "Ville à préciser"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {specialties.length ? (
                  specialties.slice(0, 2).map((item) => (
                    <span
                      key={item}
                      className="max-w-full truncate rounded-lg bg-[#e7f6f1] px-2.5 py-1 text-xs font-bold text-[#087a5c]"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="rounded-lg bg-[#f6f7f8] px-2.5 py-1 text-xs font-semibold text-black/45">
                    Matière à choisir
                  </span>
                )}
              </div>
            </div>
          </div>

          {error ? <p className="text-sm text-[#c23b3b]">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-[#087a5c]">{message}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="h-12 w-full rounded-full bg-[#12382c] text-sm font-extrabold text-white disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : published ? "Enregistrer" : "Publier l’annonce"}
          </button>
          {published ? (
            <button
              type="button"
              disabled={saving}
              onClick={onRemove}
              className="h-11 w-full rounded-full text-sm font-semibold text-black/50 hover:text-[#c23b3b]"
            >
              Retirer l’annonce
            </button>
          ) : null}
        </aside>
      </form>
      {profileId && reviews.length ? (
        <section className="mt-4 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,28,26,0.06)] sm:p-6">
          <h2 className="font-extrabold">Avis</h2>
          <p className="mt-1 text-sm text-black/50">Ta réponse apparaît sous l’avis, sur ta fiche.</p>
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-[#f6f7f8] p-4">
                <p className="text-sm leading-6 text-black/75">
                  <span className="text-[#e6b800]">{"★".repeat(review.rating)}</span>{" "}
                  {review.comment || "Avis sans commentaire."}
                </p>
                <textarea
                  value={replyDrafts[review.id] ?? ""}
                  onChange={(event) =>
                    setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))
                  }
                  rows={2}
                  placeholder="Répondre à cet avis"
                  className={`${field} mt-3 bg-white`}
                />
                <button
                  type="button"
                  className="mt-2 rounded-full bg-[#12382c] px-4 py-2 text-sm font-extrabold text-white"
                  onClick={async () => {
                    if (!userId) return;
                    setError("");
                    try {
                      await replyToReview(review.id, userId, replyDrafts[review.id] || "");
                      setMessage("Réponse publiée sous l’avis.");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Réponse impossible.");
                    }
                  }}
                >
                  Publier la réponse
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {cropFile ? (
        <PhotoCropper
          file={cropFile}
          shape="square"
          onCancel={() => setCropFile(null)}
          onConfirm={applyCropped}
        />
      ) : null}
    </main>
  );
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,28,26,0.06)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#12382c] text-xs font-extrabold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-extrabold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-black/50">{hint}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CountedText({
  value,
  max,
  rows,
  onChange,
  placeholder,
}: {
  value: string;
  max: number;
  rows: number;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const count = countWords(value);
  return (
    <div>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={field}
      />
      <p className={`mt-2 text-right text-xs font-semibold ${count > max ? "text-[#c23b3b]" : "text-black/40"}`}>
        {count} / {max} mots
      </p>
    </div>
  );
}

function Picker({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="text-sm font-semibold text-black/70">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                on ? "bg-[#12382c] text-white" : "bg-[#f6f7f8] text-black/70"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function countWords(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function normalizeFormats(formats: string[]) {
  const next: string[] = [];
  for (const raw of formats) {
    const name = fold(raw);
    if (
      ["face a face", "chez l'eleve", "chez l’eleve", "chez le professeur", "presentiel", "a domicile", "en presentiel"].includes(
        name
      ) &&
      !next.includes("Face à face")
    ) {
      next.push("Face à face");
    }
    if (["a distance", "en ligne"].includes(name) && !next.includes("À distance")) next.push("À distance");
  }
  return next;
}

function coarseLevels(levels: string[]) {
  const known = new Set(levels.map(fold));
  return LEVEL_GROUPS.flatMap((group) => {
    if (!group.levels.some((level) => known.has(fold(level)))) return [];
    if (group.id === "superieur") return ["Supérieur"];
    if (group.id === "adultes") return ["Formation pour adultes"];
    return [group.label];
  });
}
