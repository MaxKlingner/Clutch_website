"use client";

import Link from "next/link";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/site/BackLink";
import PhotoCropper, { photoFileError } from "@/components/site/PhotoCropper";
import TutorCard, { Portrait, formatRate } from "@/components/site/TutorCard";
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
  saveAccountIdentity,
  saveAnnouncement,
  setActiveRole,
  SPECIALTIES,
  uploadAnnouncementPhoto,
  type Review,
  type Tutor,
} from "@/lib/db";
import { diplomaLine, diplomaPayload } from "@/lib/trust";
import { resolveLocationQuery, suggestLocations, type ResolvedPlace } from "@/lib/locations";

const LEVEL_OPTIONS = ["Primaire", "Secondaire", "Supérieur", "Formation pour adultes"] as const;
const RATE_PRESETS = [15, 25, 35, 45, 60] as const;

const FORMAT_DETAILS: Record<string, string> = {
  "Face à face": "En présentiel chez toi ou chez l’élève",
  "À distance": "En visioconférence avec partage d’écran",
};

const field =
  "w-full rounded-2xl border border-black/10 bg-[#f6f7f8] px-4 py-3 text-sm text-[#0f1c1a] placeholder:text-black/35 outline-none transition focus:border-[#12382c] focus:bg-white focus:ring-2 focus:ring-[#12382c]/10";

export default function AnnouncementForm() {
  const ready = useRequireUser();
  const { userId } = useAuth();
  const { user } = useUser();

  const [firstNameValue, setFirstNameValue] = useState("");
  const [lastNameValue, setLastNameValue] = useState("");
  const [bio, setBio] = useState("");
  const [aboutTutor, setAboutTutor] = useState("");
  const [aboutCourse, setAboutCourse] = useState("");
  const [diplomaTitle, setDiplomaTitle] = useState("");
  const [diplomaSchool, setDiplomaSchool] = useState("");
  const [diplomaYear, setDiplomaYear] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [savingReplyId, setSavingReplyId] = useState<string | null>(null);

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
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    Promise.all([
      fetchMyTutorProfile(userId),
      fetchAccountIdentity(userId).catch(() => null),
    ]).then(([profile, identity]) => {
      if (cancelled) return;
      const fallbackParts = (profile?.name || user?.fullName || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const fallbackFirst = user?.firstName?.trim() || fallbackParts[0] || "";
      const fallbackLast = user?.lastName?.trim() || fallbackParts.slice(1).join(" ") || "";

      setFirstNameValue(identity?.firstName || fallbackFirst);
      setLastNameValue(identity?.lastName || fallbackLast);

      if (!profile) {
        if (identity?.city) {
          setCity(identity.city);
          setPlace(resolveLocationQuery(identity.city));
        }
        return;
      }

      setProfileId(profile.id);
      setRating(profile.rating);
      setReviewCount(profile.reviewCount);
      setBio(profile.bio);
      setAboutTutor(profile.aboutTutor);
      setAboutCourse(profile.aboutCourse);
      setDiplomaTitle(profile.diplomaTitle);
      setDiplomaSchool(profile.diplomaSchool);
      setDiplomaYear(profile.diplomaYear ? String(profile.diplomaYear) : "");
      setRate(profile.hourlyRate || 25);

      const initialCity = profile.city || identity?.city || "";
      setCity(initialCity);
      if (profile.city && profile.latitude != null && profile.longitude != null) {
        setPlace({
          name: profile.city,
          postalCode: profile.postalCode || "",
          latitude: profile.latitude,
          longitude: profile.longitude,
        });
      } else {
        setPlace(resolveLocationQuery(initialCity));
      }

      setSpecialties(
        profile.specialties.filter((item) => item.trim().toLowerCase() !== "matière")
      );
      setFormats(normalizeFormats(profile.teachingFormats));
      setLevels(coarseLevels(profile.taughtLevels));
      setPhotoUrl(profile.avatarUrl);
      setPublished(announcementPublished(profile));

      fetchReviews(profile.id)
        .then((rows) => {
          if (cancelled) return;
          setReviews(rows);
          setReplyDrafts(Object.fromEntries(rows.map((row) => [row.id, row.reply])));
        })
        .catch(() => {
          if (!cancelled) setReviews([]);
        });

      if (profile.hasContactPhone) {
        fetchTutorContactPhone(profile.id)
          .then((phone) => {
            if (!cancelled && phone) setContactPhone(phone);
          })
          .catch(() => undefined);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId, user?.firstName, user?.lastName, user?.fullName]);

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
    const issue = photoFileError(file);
    if (issue) {
      setError(issue);
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

  const shownPhoto = photoUrl || (user?.hasImage ? user.imageUrl : null);
  const fullName = [firstNameValue.trim(), lastNameValue.trim()].filter(Boolean).join(" ").trim();
  const resolvedPlace = place ?? resolveLocationQuery(city);
  const parsedDiploma = diplomaPayload(diplomaTitle, diplomaSchool, diplomaYear, true);
  const diplomaValid = !("error" in parsedDiploma);
  const diplomaPreview = diplomaLine({
    diplomaTitle: diplomaTitle.trim(),
    diplomaSchool: diplomaSchool.trim(),
    diplomaYear: diplomaYear.trim() ? Number(diplomaYear) : null,
  });

  const bioWords = countWords(bio);
  const aboutTutorWords = countWords(aboutTutor);
  const aboutCourseWords = countWords(aboutCourse);

  const accountPhone =
    (typeof user?.unsafeMetadata?.phone === "string" ? user.unsafeMetadata.phone.trim() : "") ||
    user?.primaryPhoneNumber?.phoneNumber ||
    "";

  const step1Done = Boolean(
    (photoFile || shownPhoto) && firstNameValue.trim() && lastNameValue.trim() && resolvedPlace
  );
  const step2Done = Boolean(specialties.length && levels.length && formats.length);
  const step3Done = Boolean(bio.trim() && bioWords <= 24);
  const step4Done = Boolean(aboutTutor.trim() && aboutTutorWords <= 80 && diplomaValid);
  const step5Done = Boolean(aboutCourse.trim() && aboutCourseWords <= 80);
  const step6Done = Boolean(Number.isFinite(rate) && rate >= 5 && rate <= 150);

  const checks = [
    { id: "section-1", label: "Photo, identité & commune", done: step1Done },
    { id: "section-2", label: "Matières, public & format", done: step2Done },
    { id: "section-3", label: "Accroche", done: step3Done },
    { id: "section-4", label: "Parcours & diplôme", done: step4Done },
    { id: "section-5", label: "Déroulement du cours", done: step5Done },
    { id: "section-6", label: "Tarif horaire", done: step6Done },
  ];
  const completedCount = checks.filter((item) => item.done).length;

  const previewTutor: Tutor = {
    id: profileId || "preview",
    clerkId: userId ?? null,
    name: fullName || user?.fullName || "Ton prénom",
    subject: specialties[0] || "Matière",
    specialties,
    bio: bio.trim(),
    aboutTutor: aboutTutor.trim(),
    aboutCourse: aboutCourse.trim(),
    hourlyRate: rate,
    rating,
    reviewCount,
    avatarUrl: shownPhoto,
    city: resolvedPlace?.name || city.trim() || "Commune",
    postalCode: resolvedPlace?.postalCode || null,
    latitude: resolvedPlace?.latitude ?? null,
    longitude: resolvedPlace?.longitude ?? null,
    teachingFormats: formats,
    taughtLevels: levels,
    diplomaTitle: diplomaTitle.trim(),
    diplomaSchool: diplomaSchool.trim(),
    diplomaYear: diplomaYear.trim() ? Number(diplomaYear) : null,
    hasContactPhone: Boolean(contactPhone.trim()),
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    if (!photoFile && !shownPhoto) {
      setError("Ajoute une photo de profil avant de publier.");
      return;
    }
    if (!firstNameValue.trim() || !lastNameValue.trim()) {
      setError("Renseigne ton prénom et ton nom.");
      return;
    }
    if (!city.trim() || !resolvedPlace) {
      setError("Choisis ta commune dans la liste déroulante.");
      return;
    }
    const cleanPhone = contactPhone.trim();
    if (cleanPhone && cleanPhone.replace(/\D/g, "").length < 6) {
      setError("Le numéro de téléphone semble incomplet.");
      return;
    }
    if (!specialties.length) {
      setError("Choisis au moins une matière.");
      return;
    }
    if (!levels.length) {
      setError("Choisis au moins un public.");
      return;
    }
    if (!formats.length) {
      setError("Choisis au moins un format de cours.");
      return;
    }
    if (!bio.trim()) {
      setError("Rédige ton accroche.");
      return;
    }
    if (bioWords > 24) {
      setError("L’accroche ne doit pas dépasser 24 mots.");
      return;
    }
    if (!aboutTutor.trim()) {
      setError("Remplis la section « À propos de toi ».");
      return;
    }
    if (aboutTutorWords > 80) {
      setError("La section « À propos de toi » ne doit pas dépasser 80 mots.");
      return;
    }
    if ("error" in parsedDiploma) {
      setError(parsedDiploma.error ?? "Complète les champs du diplôme.");
      return;
    }
    if (!aboutCourse.trim()) {
      setError("Remplis la section « À propos du cours ».");
      return;
    }
    if (aboutCourseWords > 80) {
      setError("La section « À propos du cours » ne doit pas dépasser 80 mots.");
      return;
    }
    if (!Number.isFinite(rate) || rate < 5 || rate > 150) {
      setError("Le tarif horaire doit être compris entre 5 € et 150 €.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      await saveAccountIdentity({
        clerkId: userId,
        firstName: firstNameValue.trim(),
        lastName: lastNameValue.trim(),
      }).catch(() => undefined);

      const avatarUrl = photoFile ? await uploadAnnouncementPhoto(userId, photoFile) : shownPhoto;

      await saveAnnouncement(userId, {
        fullName,
        bio: bio.trim(),
        aboutTutor: aboutTutor.trim(),
        aboutCourse: aboutCourse.trim(),
        specialties,
        hourlyRate: rate,
        city: resolvedPlace.name,
        postalCode: resolvedPlace.postalCode || null,
        latitude: resolvedPlace.latitude ?? null,
        longitude: resolvedPlace.longitude ?? null,
        teachingFormats: formats,
        taughtLevels: levels,
        diplomaTitle: parsedDiploma.diplomaTitle,
        diplomaSchool: parsedDiploma.diplomaSchool,
        diplomaYear: parsedDiploma.diplomaYear,
        contactPhone: cleanPhone || null,
        avatarUrl,
      });

      await setActiveRole(userId, ROLES.TUTOR, fullName);
      const updatedProfile = await fetchMyTutorProfile(userId).catch(() => null);
      if (updatedProfile) setProfileId(updatedProfile.id);

      setPhotoFile(null);
      if (avatarUrl) setPhotoUrl(avatarUrl);
      setPublished(true);
      setConfirmRemove(false);
      setMessage(
        published
          ? "Modifications enregistrées. Ta fiche publique est à jour."
          : "Annonce publiée. Elle apparaît maintenant chez les professeurs disponibles."
      );
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
      setConfirmRemove(false);
      setMessage("Annonce retirée. Elle n’apparaît plus dans les recherches.");
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <BackLink />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#087a5c] uppercase">
            Espace professeur
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#0f1c1a] sm:text-4xl">
            {published ? "Gérer mon annonce" : "Créer mon annonce"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
            Renseigne chaque rubrique telle qu’elle apparaîtra sur ta fiche publique. Un profil complet
            inspire confiance aux parents et étudiants dès le premier regard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold ${
              published
                ? "bg-[#e7f6f1] text-[#087a5c]"
                : "bg-white text-black/55 ring-1 ring-black/10"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${published ? "bg-[#0d9f7a]" : "bg-black/25"}`}
            />
            {published ? "En ligne" : "Brouillon"}
          </span>
          {published && profileId ? (
            <Link
              href={`/tuteur/${profileId}`}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-extrabold text-[#12382c] ring-1 ring-black/10 transition hover:bg-[#f6f7f8]"
            >
              Voir ma fiche publique →
            </Link>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-5">
          <Section
            id="section-1"
            step="1"
            done={step1Done}
            title="Identité, photo & localisation"
            hint="Un portrait lumineux où l’on voit clairement ton visage, ton nom et ta commune en Belgique."
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex flex-col items-center sm:items-start">
                <label className="group relative block h-32 w-32 shrink-0 cursor-pointer overflow-hidden rounded-3xl ring-1 ring-black/10">
                  <Portrait
                    name={fullName || "Toi"}
                    url={shownPhoto}
                    className="h-32 w-32 rounded-3xl object-cover transition group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/95 py-1 text-center text-[11px] font-extrabold text-[#0f1c1a] shadow-sm transition group-hover:bg-white">
                    {shownPhoto ? "Changer" : "Ajouter"}
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
                <p className="mt-2 text-[11px] font-medium text-black/45">
                  JPG, PNG ou WebP
                </p>
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-extrabold tracking-wide text-black/55 uppercase">
                      Prénom *
                    </span>
                    <input
                      value={firstNameValue}
                      onChange={(event) => setFirstNameValue(event.target.value)}
                      placeholder="Ex. Camille"
                      className={`${field} mt-1.5`}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-extrabold tracking-wide text-black/55 uppercase">
                      Nom *
                    </span>
                    <input
                      value={lastNameValue}
                      onChange={(event) => setLastNameValue(event.target.value)}
                      placeholder="Ex. Verhoeven"
                      className={`${field} mt-1.5`}
                    />
                  </label>
                </div>

                <div ref={placeRoot} className="relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold tracking-wide text-black/55 uppercase">
                      Commune *
                    </span>
                    {resolvedPlace?.postalCode ? (
                      <span className="rounded-full bg-[#e7f6f1] px-2.5 py-0.5 text-[11px] font-bold text-[#087a5c]">
                        {resolvedPlace.name} ({resolvedPlace.postalCode})
                      </span>
                    ) : null}
                  </div>
                  <input
                    value={city}
                    onChange={(event) => {
                      setCity(event.target.value);
                      setPlace(null);
                      setPlaceOpen(true);
                    }}
                    onFocus={() => setPlaceOpen(true)}
                    placeholder="Tape ta commune ou ton code postal (ex. 1348, Ixelles…)"
                    className={`${field} mt-1.5`}
                    autoComplete="off"
                  />
                  {places.length ? (
                    <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-30 overflow-hidden rounded-2xl bg-white py-1 shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5">
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
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-[#f3f7f5]"
                        >
                          <span className="font-semibold text-[#0f1c1a]">{item.name}</span>
                          <span className="text-xs font-semibold text-black/45">
                            {item.postalCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : placeOpen && city.trim().length >= 2 ? (
                    <p className="absolute top-[calc(100%+6px)] right-0 left-0 z-30 rounded-2xl bg-white px-4 py-3 text-sm text-black/50 shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5">
                      Aucune commune belge ne correspond.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-black/5 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold tracking-wide text-black/55 uppercase">
                    Téléphone de contact
                  </span>
                  <span className="rounded-full bg-[#f6f7f8] px-2.5 py-0.5 text-[11px] font-semibold text-black/45">
                    Facultatif
                  </span>
                </div>
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
              <p className="mt-2 text-xs leading-5 text-black/45">
                Ton numéro est masqué pour les visiteurs non connectés et visible uniquement par les
                parents et élèves inscrits.
              </p>
            </div>
          </Section>

          <Section
            id="section-2"
            step="2"
            done={step2Done}
            title="Matières, public & format"
            hint="Indique exactement ce que tu enseignes, à qui s’adressent tes cours et comment ils se déroulent."
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold tracking-wide text-black/55 uppercase">
                  Matières enseignées *
                </p>
                {specialties.length ? (
                  <span className="text-xs font-bold text-[#087a5c]">
                    {specialties.length} choisie{specialties.length > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {SPECIALTIES.map((option) => {
                  const on = specialties.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggle(specialties, option, setSpecialties)}
                      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                        on
                          ? "bg-[#12382c] text-white shadow-sm"
                          : "bg-[#f6f7f8] text-black/70 hover:bg-[#eceff1]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-black/5 pt-5">
              <p className="text-xs font-extrabold tracking-wide text-black/55 uppercase">
                Public *
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {LEVEL_OPTIONS.map((option) => {
                  const on = levels.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggle(levels, option, setLevels)}
                      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                        on
                          ? "bg-[#12382c] text-white shadow-sm"
                          : "bg-[#f6f7f8] text-black/70 hover:bg-[#eceff1]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-black/5 pt-5">
              <p className="text-xs font-extrabold tracking-wide text-black/55 uppercase">
                Format *
              </p>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                {FORMATS.map((format) => {
                  const on = formats.includes(format);
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => toggle(formats, format, setFormats)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        on
                          ? "border-[#12382c] bg-[#12382c] text-white shadow-sm"
                          : "border-black/10 bg-[#f6f7f8] text-[#0f1c1a] hover:border-black/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold">{format}</span>
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full text-xs font-bold ${
                            on ? "bg-white/20 text-white" : "border border-black/15 bg-white text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                      <p className={`mt-1 text-xs leading-5 ${on ? "text-white/75" : "text-black/50"}`}>
                        {FORMAT_DETAILS[format] || ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section
            id="section-3"
            step="3"
            done={step3Done}
            title="Ton accroche"
            hint="Affichée tout en haut de ta fiche publique. Résume qui tu es, ce que tu enseignes et pour qui."
          >
            <CountedText
              value={bio}
              max={24}
              rows={3}
              onChange={setBio}
              placeholder="Ex. Ingénieur civil à Louvain-la-Neuve, j’aide le secondaire et le supérieur en maths et physique."
            />
          </Section>

          <Section
            id="section-4"
            step="4"
            done={step4Done}
            title="À propos de toi & diplôme"
            hint="Parle à la première personne de ton parcours, puis renseigne ton diplôme ou cursus principal."
          >
            <CountedText
              value={aboutTutor}
              max={80}
              rows={5}
              onChange={setAboutTutor}
              placeholder="Ex. Diplômé en sciences mathématiques avec 5 ans d’expérience, j’accompagne des élèves du secondaire et de 1re bac…"
            />

            <div className="mt-5 rounded-2xl border border-black/5 bg-[#f6f7f8] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-extrabold tracking-wide text-black/55 uppercase">
                  Formation / Diplôme principal *
                </p>
                {diplomaPreview ? (
                  <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-[#087a5c] ring-1 ring-black/5">
                    {diplomaPreview}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="block sm:col-span-1">
                  <span className="text-[11px] font-bold text-black/50">Intitulé *</span>
                  <input
                    value={diplomaTitle}
                    onChange={(event) => setDiplomaTitle(event.target.value)}
                    placeholder="Ex. Master en mathématiques"
                    className={`${field} mt-1 bg-white`}
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="text-[11px] font-bold text-black/50">Établissement *</span>
                  <input
                    value={diplomaSchool}
                    onChange={(event) => setDiplomaSchool(event.target.value)}
                    placeholder="Ex. UCLouvain"
                    className={`${field} mt-1 bg-white`}
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="text-[11px] font-bold text-black/50">Année d’obtention *</span>
                  <input
                    value={diplomaYear}
                    onChange={(event) =>
                      setDiplomaYear(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    inputMode="numeric"
                    placeholder="Ex. 2023"
                    className={`${field} mt-1 bg-white`}
                  />
                </label>
              </div>
            </div>
          </Section>

          <Section
            id="section-5"
            step="5"
            done={step5Done}
            title="À propos du cours"
            hint="Explique comment se passe une séance : diagnostic de départ, travail sur exercices et ce avec quoi l’élève repart."
          >
            <CountedText
              value={aboutCourse}
              max={80}
              rows={5}
              onChange={setAboutCourse}
              placeholder="Ex. Nous commençons par cibler tes blocages, puis nous résolvons ensemble des exercices types d’examen avec une fiche mémo…"
            />
          </Section>

          <Section
            id="section-6"
            step="6"
            done={step6Done}
            title="Tarif horaire"
            hint="Choisis ton prix par heure de cours (entre 5 € et 150 €). Affiché tel quel sur ta fiche."
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p>
                <span className="font-display text-4xl font-bold text-[#0f1c1a]">
                  {formatRate(rate)} €
                </span>
                <span className="ml-1.5 text-sm font-semibold text-black/45">/ heure</span>
              </p>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-black/50">
                  <span>Montant exact</span>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    value={rate || ""}
                    onChange={(event) => setRate(Math.max(0, Number(event.target.value) || 0))}
                    className="w-24 rounded-2xl border border-black/10 bg-[#f6f7f8] px-3 py-2 text-right text-sm font-bold text-[#0f1c1a] outline-none focus:border-[#12382c] focus:bg-white"
                  />
                </label>
                <span className="text-sm font-bold text-black/45">€/h</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {RATE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRate(preset)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                    rate === preset
                      ? "bg-[#12382c] text-white"
                      : "bg-[#f6f7f8] text-black/65 hover:bg-[#eceff1]"
                  }`}
                >
                  {preset} €
                </button>
              ))}
            </div>

            <input
              type="range"
              min={5}
              max={150}
              value={Math.min(150, Math.max(5, rate || 5))}
              onChange={(event) => setRate(Number(event.target.value))}
              className="mt-4 w-full accent-[#0d9f7a]"
            />
            <div className="mt-1 flex justify-between text-xs font-semibold text-black/40">
              <span>5 €</span>
              <span>50 €</span>
              <span>100 €</span>
              <span>150 €</span>
            </div>
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--site-header,3.5rem)+1.5rem)]">
          <div className="rounded-3xl bg-white p-4 shadow-[0_12px_40px_rgba(15,28,26,0.07)] ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <p className="text-xs font-extrabold tracking-wide text-black/45 uppercase">
                Aperçu catalogue
              </p>
              <span className="text-[11px] font-semibold text-[#087a5c]">Temps réel</span>
            </div>
            <div className="pointer-events-none select-none">
              <TutorCard tutor={previewTutor} isOwn />
            </div>
            <dl className="mt-4 space-y-2 border-t border-black/5 px-1 pt-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-black/45">Public</dt>
                <dd className="text-right font-semibold text-[#0f1c1a]">
                  {levels.join(", ") || "À choisir"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-black/45">Format</dt>
                <dd className="text-right font-semibold text-[#0f1c1a]">
                  {formats.join(" · ") || "À choisir"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-black/45">Diplôme</dt>
                <dd className="text-right font-semibold text-[#0f1c1a]">
                  {diplomaPreview || "À renseigner"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-black/45">Téléphone</dt>
                <dd className="text-right font-semibold text-[#0f1c1a]">
                  {contactPhone.trim() || "Non renseigné"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,28,26,0.05)] ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold tracking-wide text-black/45 uppercase">
                Complétude
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                  completedCount === checks.length
                    ? "bg-[#e7f6f1] text-[#087a5c]"
                    : "bg-[#f6f7f8] text-black/55"
                }`}
              >
                {completedCount} / {checks.length}
              </span>
            </div>

            <ul className="mt-3 space-y-1.5">
              {checks.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 text-xs transition hover:bg-[#f6f7f8]"
                  >
                    <span className={item.done ? "font-semibold text-[#0f1c1a]" : "text-black/55"}>
                      {item.label}
                    </span>
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold ${
                        item.done
                          ? "bg-[#e7f6f1] text-[#087a5c]"
                          : "bg-black/5 text-black/30"
                      }`}
                    >
                      {item.done ? "✓" : "·"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {error ? (
              <p className="mt-4 rounded-2xl bg-[#fdf1f1] px-3.5 py-2.5 text-xs font-semibold text-[#c23b3b]">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="mt-4 rounded-2xl bg-[#e7f6f1] px-3.5 py-2.5 text-xs font-semibold text-[#087a5c]">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="mt-4 h-12 w-full rounded-full bg-[#12382c] text-sm font-extrabold text-white transition hover:bg-[#0d2b22] disabled:opacity-60"
            >
              {saving
                ? "Enregistrement…"
                : published
                  ? "Enregistrer les modifications"
                  : "Publier l’annonce"}
            </button>

            {published ? (
              confirmRemove ? (
                <div className="mt-3 rounded-2xl border border-[#c23b3b]/20 bg-[#fdf1f1] p-3 text-center">
                  <p className="text-xs font-semibold text-[#c23b3b]">
                    Retirer ton annonce des résultats ?
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setConfirmRemove(false)}
                      className="h-9 flex-1 rounded-full bg-white text-xs font-bold text-black/70 ring-1 ring-black/10"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={onRemove}
                      className="h-9 flex-1 rounded-full bg-[#c23b3b] text-xs font-extrabold text-white disabled:opacity-60"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setConfirmRemove(true)}
                  className="mt-2 h-10 w-full rounded-full text-xs font-semibold text-black/50 transition hover:text-[#c23b3b]"
                >
                  Retirer l’annonce
                </button>
              )
            ) : null}
          </div>
        </aside>
      </form>

      {profileId && reviews.length ? (
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.05)] sm:p-7">
          <h2 className="font-display text-xl font-bold text-[#0f1c1a]">
            Avis reçus ({reviews.length})
          </h2>
          <p className="mt-1 text-sm text-black/50">
            Ta réponse s’affiche publiquement sous l’avis correspondant sur ta fiche.
          </p>
          <div className="mt-5 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-[#f6f7f8] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm tracking-wide">
                    <span className="text-[#e6b800]">{"★".repeat(review.rating)}</span>
                    <span className="text-black/15">{"★".repeat(5 - review.rating)}</span>
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-black/80">
                  {review.comment || "Avis sans commentaire."}
                </p>
                <textarea
                  value={replyDrafts[review.id] ?? ""}
                  onChange={(event) =>
                    setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))
                  }
                  rows={2}
                  placeholder="Répondre à cet avis…"
                  className={`${field} mt-3 bg-white`}
                />
                <button
                  type="button"
                  disabled={savingReplyId === review.id}
                  className="mt-2.5 rounded-full bg-[#12382c] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#0d2b22] disabled:opacity-60"
                  onClick={async () => {
                    if (!userId) return;
                    setError("");
                    setSavingReplyId(review.id);
                    try {
                      await replyToReview(review.id, userId, replyDrafts[review.id] || "");
                      setMessage("Réponse publiée sous l’avis.");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Réponse impossible.");
                    } finally {
                      setSavingReplyId(null);
                    }
                  }}
                >
                  {savingReplyId === review.id ? "Publication…" : "Publier la réponse"}
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
  id,
  step,
  done,
  title,
  hint,
  children,
}: {
  id: string;
  step: string;
  done: boolean;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(var(--site-header,3.5rem)+1.5rem)] rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.05)] sm:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold transition ${
              done ? "bg-[#e7f6f1] text-[#087a5c]" : "bg-[#12382c] text-white"
            }`}
          >
            {done ? "✓" : step}
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-[#0f1c1a]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-black/50">{hint}</p>
          </div>
        </div>
      </div>
      <div className="mt-5">{children}</div>
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
  const ratio = Math.min(100, Math.round((count / max) * 100));
  const over = count > max;
  return (
    <div>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={field}
      />
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
          <div
            className={`h-full rounded-full transition-all ${
              over ? "bg-[#c23b3b]" : count > 0 ? "bg-[#0d9f7a]" : "bg-transparent"
            }`}
            style={{ width: `${ratio}%` }}
          />
        </div>
        <p
          className={`shrink-0 text-xs font-bold ${
            over ? "text-[#c23b3b]" : count > 0 ? "text-[#087a5c]" : "text-black/40"
          }`}
        >
          {count} / {max} mots
        </p>
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
      [
        "face a face",
        "chez l'eleve",
        "chez l’eleve",
        "chez le professeur",
        "presentiel",
        "a domicile",
        "en presentiel",
      ].includes(name) &&
      !next.includes("Face à face")
    ) {
      next.push("Face à face");
    }
    if (["a distance", "en ligne"].includes(name) && !next.includes("À distance")) {
      next.push("À distance");
    }
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
