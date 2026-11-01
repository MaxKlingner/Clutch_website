"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import PhotoCropper, { photoFileError } from "@/components/site/PhotoCropper";
import { Portrait } from "@/components/site/TutorCard";
import { useRequireUser } from "@/components/site/useRequireUser";
import {
  fetchAccountIdentity,
  fetchMyTutorProfile,
  saveAccountIdentity,
  setAccountAvatar,
} from "@/lib/db";
import { isAdultBirthDate } from "@/lib/trust";

const GENDERS = ["Homme", "Femme", "Je ne souhaite pas préciser"] as const;

const field =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#12382c]";

export default function AccountSettings() {
  const ready = useRequireUser();
  const { userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [gender, setGender] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const phoneVerified = user?.primaryPhoneNumber?.verification?.status === "verified";

  useEffect(() => {
    if (!ready || !userId || !user) return;
    let cancel = false;
    const current = user;
    const meta = metaOf(current);
    const initial = {
      gender: textOf(meta.gender),
      firstName: current.firstName || "",
      lastName: current.lastName || "",
      birthDate: textOf(meta.birthDate),
      phone: textOf(meta.phone) || current.primaryPhoneNumber?.phoneNumber || "",
      address: textOf(meta.address),
    };
    setGender(initial.gender);
    setFirstName(initial.firstName);
    setLastName(initial.lastName);
    setBirthDate(initial.birthDate);
    setPhone(initial.phone);
    setAddress(initial.address);
    setPhotoUrl(current.imageUrl || null);
    setBaseline(JSON.stringify(initial));
    setLoaded(true);

    Promise.all([
      fetchAccountIdentity(userId).catch(() => null),
      fetchMyTutorProfile(userId).catch(() => null),
    ])
      .then(([identity, tutor]) => {
        if (cancel) return;
        const fromTutor = splitName(tutor && tutor.name !== "Tuteur" ? tutor.name : "");
        const next = {
          gender: initial.gender,
          firstName: initial.firstName || identity?.firstName || fromTutor.first,
          lastName: initial.lastName || identity?.lastName || fromTutor.last,
          birthDate: initial.birthDate,
          phone: initial.phone,
          address:
            initial.address ||
            joinPlace(identity?.postalCode, identity?.city) ||
            joinPlace(tutor?.postalCode, tutor?.city),
        };
        setGender(next.gender);
        setFirstName(next.firstName);
        setLastName(next.lastName);
        setBirthDate(next.birthDate);
        setPhone(next.phone);
        setAddress(next.address);
        setPhotoUrl(current.imageUrl || tutor?.avatarUrl || null);
        setBaseline(JSON.stringify(next));
        if (!current.firstName && next.firstName) {
          current.update({ firstName: next.firstName, lastName: next.lastName }).catch(() => undefined);
        }
      })
      .catch((err) => {
        if (!cancel) setError(clerkText(err, "Impossible de charger le compte."));
      });

    return () => {
      cancel = true;
    };
    // The Clerk user id is stable. Depending on the user object restarts the form while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userId, user?.id]);

  const current = JSON.stringify({ gender, firstName, lastName, birthDate, phone, address });
  const dirty = loaded && current !== baseline;

  function pickPhoto(file: File | undefined) {
    if (!file) return;
    const message = photoFileError(file);
    if (message) {
      setError(message);
      setMessage("");
      return;
    }
    setError("");
    setMessage("");
    setCropFile(file);
  }

  async function onPhoto(file: File) {
    if (!user || !userId) return;
    setPhotoBusy(true);
    setError("");
    setMessage("");
    try {
      const image = await user.setProfileImage({ file });
      const url = (image as { publicUrl?: string | null } | null)?.publicUrl || user.imageUrl || null;
      setPhotoUrl(url);
      await setAccountAvatar(userId, url);
      setMessage("Photo mise à jour.");
    } catch (err) {
      setError(clerkText(err, "Impossible d’enregistrer la photo."));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onSave() {
    if (!user || !userId || !dirty || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    if (birthDate.trim() && !isAdultBirthDate(birthDate)) {
      setError("Il faut avoir 18 ans. La date s’écrit JJ/MM/AAAA.");
      setSaving(false);
      return;
    }
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        unsafeMetadata: {
          ...user.unsafeMetadata,
          gender,
          birthDate: birthDate.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
      });
      await saveAccountIdentity({
        clerkId: userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setBaseline(current);
      setMessage("Tes informations sont à jour.");
    } catch (err) {
      setError(clerkText(err, "Impossible d’enregistrer ces informations."));
    } finally {
      setSaving(false);
    }
  }

  async function onPassword() {
    if (!user || passwordBusy) return;
    if (!currentPassword) {
      setError("Indique ton mot de passe actuel.");
      return;
    }
    if (nextPassword.length < 8) {
      setError("Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (nextPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setPasswordBusy(true);
    setError("");
    setMessage("");
    try {
      await user.updatePassword({
        currentPassword,
        newPassword: nextPassword,
        signOutOfOtherSessions: true,
      });
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setPasswordOpen(false);
      setMessage("Mot de passe modifié.");
    } catch (err) {
      setError(clerkText(err, "Impossible de modifier le mot de passe."));
    } finally {
      setPasswordBusy(false);
    }
  }

  async function onDelete() {
    if (!user || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await user.delete();
      router.push("/");
    } catch (err) {
      setError(clerkText(err, "Impossible de supprimer le compte."));
      setDeleting(false);
    }
  }

  if (!ready || !loaded) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-black/55">
          ← Tous les professeurs
        </Link>
        <p className="grid min-h-[40vh] place-items-center text-black/50">Chargement…</p>
      </main>
    );
  }

  const shownName = firstName.trim() || "Mon compte";

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-black/55">
        ← Tous les professeurs
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Compte</h1>
      <div className="mt-6 flex flex-col items-center">
        <label className="relative cursor-pointer">
          <Portrait name={shownName} url={photoUrl} className="h-28 w-28 rounded-full object-cover" />
          <span className="absolute right-0 bottom-0 grid h-8 w-8 place-items-center rounded-full bg-[#12382c] text-sm text-white">
            {photoBusy ? "…" : "✎"}
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
        <p className="mt-3 text-xl font-extrabold">{shownName}</p>
      </div>

      <Section title="Informations générales">
        <label className="block text-sm">
          <span className="font-semibold text-black/55">Genre</span>
          <select value={gender} onChange={(event) => setGender(event.target.value)} className={`${field} mt-2`}>
            <option value="">Choisir</option>
            {GENDERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <input
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="Prénom"
          autoComplete="given-name"
          className={field}
        />
        <input
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="Nom"
          autoComplete="family-name"
          className={field}
        />
        <input
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          placeholder="Date de naissance (JJ/MM/AAAA)"
          autoComplete="bday"
          className={field}
        />
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4">
          <span aria-hidden="true">🇧🇪</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Téléphone"
            autoComplete="tel"
            inputMode="tel"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {phoneVerified ? <span className="text-sm font-extrabold text-[#0d9f7a]">Vérifié</span> : null}
        </div>
        <textarea
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Adresse"
          rows={3}
          autoComplete="street-address"
          className={field}
        />
      </Section>

      <Section title="Paramètres du compte">
        <p className={`${field} text-black/70`}>{email || "E-mail"}</p>
        <button
          type="button"
          onClick={() => setPasswordOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm"
        >
          <span>
            <span className="block text-xs font-semibold text-black/45">Mot de passe</span>
            <span className="font-extrabold">Changer</span>
          </span>
          <span className="text-black/35">{passwordOpen ? "▴" : "▾"}</span>
        </button>
        {passwordOpen ? (
          <div className="space-y-2 rounded-2xl bg-white p-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Mot de passe actuel"
              autoComplete="current-password"
              className={field}
            />
            <input
              type="password"
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
              placeholder="Nouveau mot de passe"
              autoComplete="new-password"
              className={field}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirmer le mot de passe"
              autoComplete="new-password"
              className={field}
            />
            <button
              type="button"
              disabled={passwordBusy}
              onClick={onPassword}
              className="h-11 w-full rounded-full bg-[#12382c] text-sm font-extrabold text-white disabled:opacity-60"
            >
              {passwordBusy ? "Modification…" : "Modifier le mot de passe"}
            </button>
          </div>
        ) : null}
      </Section>

      {error ? <p className="mt-4 text-sm text-[#c23b3b]">{error}</p> : null}
      {message ? <p className="mt-4 text-sm font-semibold text-[#087a5c]">{message}</p> : null}

      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className="mt-6 h-12 w-full rounded-full bg-[#12382c] text-sm font-extrabold text-white disabled:bg-black/10 disabled:text-black/35"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      <p className="mt-6 text-sm text-black/45">
        Un seul compte par personne, à partir de 18 ans.{" "}
        <Link href="/conditions" className="font-semibold">
          Conditions
        </Link>
        {" · "}
        <Link href="/confidentialite" className="font-semibold">
          Confidentialité
        </Link>
      </p>

      {confirmDelete ? (
        <div className="mt-6 rounded-2xl bg-white p-4 text-sm">
          <p className="font-semibold">Ton compte Clutch sera effacé. Cette action est définitive.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="h-11 flex-1 rounded-full bg-[#f6f7f8] font-extrabold"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={onDelete}
              className="h-11 flex-1 rounded-full font-extrabold text-[#c23b3b] disabled:opacity-60"
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="mt-4 h-11 w-full rounded-full text-sm font-semibold text-[#c23b3b]"
        >
          Supprimer le compte
        </button>
      )}

      <button
        type="button"
        onClick={() => signOut(() => router.push("/"))}
        className="mt-2 h-11 w-full rounded-full text-sm font-semibold text-black/50"
      >
        Se déconnecter
      </button>
      {cropFile ? (
        <PhotoCropper
          file={cropFile}
          shape="round"
          onCancel={() => setCropFile(null)}
          onConfirm={(file) => {
            setCropFile(null);
            void onPhoto(file);
          }}
        />
      ) : null}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-extrabold tracking-wide text-black/45 uppercase">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function metaOf(user: { unsafeMetadata?: Record<string, unknown> } | null | undefined) {
  const raw = user?.unsafeMetadata;
  return raw && typeof raw === "object" ? raw : {};
}

function textOf(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function joinPlace(postal?: string | null, city?: string | null) {
  return [postal, city].map((item) => item?.trim()).filter(Boolean).join(" ");
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return { first: parts.shift() || "", last: parts.join(" ") };
}

function clerkText(err: unknown, fallback: string) {
  const first = (err as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0];
  return first?.longMessage || first?.message || (err instanceof Error ? err.message : fallback);
}
