"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  confirmTopUp,
  ensureWallet,
  fetchFavorites,
  fetchMyTutorProfile,
  fetchTutors,
  FORMATS,
  LEVELS,
  resetAnnouncement,
  ROLES,
  saveAnnouncement,
  setActiveRole,
  SPECIALTIES,
  startTopUp,
  type Tutor,
} from "@/lib/db";

export function Favorites() {
  const { userId } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  useEffect(() => {
    if (!userId) return;
    fetchFavorites(userId).then(setTutors);
  }, [userId]);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Favoris</h1>
      <div className="mt-6 grid gap-3">
        {tutors.map((tutor) => (
          <Link
            key={tutor.id}
            href={`/espace/tuteur/${tutor.id}`}
            className="rounded-2xl border border-white/10 bg-[#1A1A1C] px-4 py-4"
          >
            <p className="font-extrabold">{tutor.name}</p>
            <p className="text-sm text-white/55">{tutor.subject}</p>
          </Link>
        ))}
        {!tutors.length ? <p className="text-white/55">Aucun favori.</p> : null}
      </div>
    </div>
  );
}

export function MapView() {
  const { userId } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selected, setSelected] = useState<Tutor | null>(null);
  useEffect(() => {
    if (!userId) return;
    fetchTutors(userId).then((rows) => {
      const placed = rows.filter((tutor) => tutor.latitude && tutor.longitude);
      setTutors(placed);
      setSelected(placed[0] || null);
    });
  }, [userId]);
  const src = selected
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selected.longitude! - 0.08}%2C${selected.latitude! - 0.05}%2C${selected.longitude! + 0.08}%2C${selected.latitude! + 0.05}&layer=mapnik&marker=${selected.latitude}%2C${selected.longitude}`
    : "https://www.openstreetmap.org/export/embed.html?bbox=2.5%2C49.4%2C6.5%2C51.6&layer=mapnik";
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Carte</h1>
      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {tutors.map((tutor) => (
            <button
              key={tutor.id}
              onClick={() => setSelected(tutor)}
              className={`block w-full rounded-2xl px-4 py-3 text-left ${
                selected?.id === tutor.id ? "bg-white text-[#111111]" : "bg-[#1A1A1C]"
              }`}
            >
              <span className="font-extrabold">{tutor.name.split(" ")[0]}</span>
              <span className="mt-1 block text-sm opacity-70">{tutor.city}</span>
            </button>
          ))}
        </div>
        <iframe title="Carte des tuteurs" src={src} className="h-[480px] w-full rounded-3xl border-0" />
      </div>
    </div>
  );
}

export function Wallet({ sessionId, amount }: { sessionId?: string; amount?: number }) {
  const { userId } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!userId) return;
    const run = async () => {
      if (sessionId && amount) {
        await confirmTopUp(userId, sessionId, amount);
      }
      setBalance(await ensureWallet(userId));
    };
    run().catch((err: Error) => setError(err.message));
  }, [userId, sessionId, amount]);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Portefeuille</h1>
      <p className="mt-6 text-5xl font-extrabold">
        {balance == null ? "…" : `${balance.toFixed(2)} €`}
      </p>
      <p className="mt-2 text-sm text-white/55">Le même solde que dans l’application.</p>
      <div className="mt-6 flex gap-2">
        {[20, 50, 100].map((euros) => (
          <button
            key={euros}
            onClick={() => userId && startTopUp(userId, euros).catch((err: Error) => setError(err.message))}
            className="rounded-2xl bg-[#1B6B45] px-4 py-3 text-sm font-extrabold"
          >
            + {euros} €
          </button>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-[#FF8A80]">{error}</p> : null}
    </div>
  );
}

export function Account() {
  const { userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Compte</h1>
      <p className="mt-3 text-white/70">
        {user?.fullName || user?.primaryEmailAddress?.emailAddress}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#111111]"
          onClick={async () => {
            if (!userId) return;
            await setActiveRole(userId, ROLES.PARENT, user?.fullName);
            router.push("/espace");
            router.refresh();
          }}
        >
          Passer en parent
        </button>
        <button
          className="rounded-2xl bg-[#1B6B45] px-4 py-3 text-sm font-extrabold"
          onClick={async () => {
            if (!userId) return;
            await setActiveRole(userId, ROLES.TUTOR, user?.fullName);
            router.push("/espace");
            router.refresh();
          }}
        >
          Passer en tuteur
        </button>
        <button
          className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-extrabold"
          onClick={() => signOut(() => router.push("/"))}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export function Announcement() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [bio, setBio] = useState("");
  const [aboutTutor, setAboutTutor] = useState("");
  const [aboutCourse, setAboutCourse] = useState("");
  const [rate, setRate] = useState(25);
  const [city, setCity] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetchMyTutorProfile(userId).then((profile) => {
      if (!profile) return;
      setBio(profile.bio);
      setAboutTutor(profile.aboutTutor);
      setAboutCourse(profile.aboutCourse);
      setRate(profile.hourlyRate || 25);
      setCity(profile.city || "");
      setSpecialties(profile.specialties);
      setFormats(profile.teachingFormats);
      setLevels(profile.taughtLevels);
    });
  }, [userId]);

  function toggle(list: string[], value: string, set: (next: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  return (
    <form
      className="mx-auto max-w-xl space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!userId) return;
        await saveAnnouncement(userId, {
          fullName: user?.fullName || "Tuteur",
          bio: words(bio, 24),
          aboutTutor: words(aboutTutor, 80),
          aboutCourse: words(aboutCourse, 80),
          specialties,
          hourlyRate: rate,
          city,
          teachingFormats: formats,
          taughtLevels: levels,
        });
        setMessage("Annonce enregistrée. Elle est visible dans Découvrir.");
      }}
    >
      <h1 className="font-display text-3xl font-bold">Ton annonce</h1>
      <Field label="À propos de toi (24 mots)">
        <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} className={input} />
      </Field>
      <Field label="À propos du tuteur (80 mots)">
        <textarea value={aboutTutor} onChange={(event) => setAboutTutor(event.target.value)} rows={4} className={input} />
      </Field>
      <Field label="À propos du cours (80 mots)">
        <textarea value={aboutCourse} onChange={(event) => setAboutCourse(event.target.value)} rows={4} className={input} />
      </Field>
      <Field label="Tarif horaire">
        <input type="number" value={rate} onChange={(event) => setRate(Number(event.target.value))} className={input} />
      </Field>
      <Field label="Ville">
        <input value={city} onChange={(event) => setCity(event.target.value)} className={input} />
      </Field>
      <Chips title="Matières" options={SPECIALTIES} selected={specialties} onToggle={(value) => toggle(specialties, value, setSpecialties)} />
      <Chips title="Format" options={[...FORMATS]} selected={formats} onToggle={(value) => toggle(formats, value, setFormats)} />
      <Chips title="Niveaux" options={LEVELS} selected={levels} onToggle={(value) => toggle(levels, value, setLevels)} />
      {message ? <p className="text-sm text-[#3DDC97]">{message}</p> : null}
      <div className="flex gap-2">
        <button className="rounded-2xl bg-[#1B6B45] px-4 py-3 text-sm font-extrabold">Enregistrer</button>
        <button
          type="button"
          className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-extrabold"
          onClick={async () => {
            if (!userId) return;
            await resetAnnouncement(userId);
            setSpecialties([]);
            setBio("");
            setMessage("Annonce retirée.");
          }}
        >
          Supprimer
        </button>
      </div>
    </form>
  );
}

export function TutorHome() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Tutor | null>(null);
  useEffect(() => {
    if (!userId) return;
    fetchMyTutorProfile(userId).then(setProfile);
  }, [userId]);
  const published = profile?.specialties.some((item) => item && item.toLowerCase() !== "matière");
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Annonce</h1>
      {published && profile ? (
        <div className="mt-6 max-w-md rounded-3xl border border-white/10 bg-[#1A1A1C] p-5">
          <p className="text-2xl font-extrabold">{profile.name.split(" ")[0]}</p>
          <p className="mt-1 text-white/70">{profile.subject}</p>
          <p className="mt-3 text-sm leading-6 text-white/75">{profile.bio}</p>
          <p className="mt-3 font-extrabold">{profile.hourlyRate} €/h</p>
        </div>
      ) : (
        <p className="mt-4 text-white/60">Tu n’as pas encore publié d’annonce.</p>
      )}
      <Link
        href="/espace/annonce"
        className="mt-6 inline-flex rounded-2xl bg-[#1B6B45] px-4 py-3 text-sm font-extrabold"
      >
        {published ? "Modifier" : "Créer mon annonce"}
      </Link>
    </div>
  );
}

export function Welcome() {
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState<"parent" | "tutor">("parent");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!userId) return;
        try {
          const { saveSignupProfile } = await import("@/lib/db");
          await saveSignupProfile({
            clerkId: userId,
            role,
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            city,
          });
          router.replace("/espace");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Enregistrement impossible.");
        }
      }}
    >
      <h1 className="font-display text-4xl font-bold">Tu es…</h1>
      <div className="mt-6 grid grid-cols-2 gap-2">
        {(["parent", "tutor"] as const).map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setRole(item)}
            className={`rounded-2xl px-4 py-4 font-extrabold ${
              role === item ? "bg-[#3DDC97] text-[#111111]" : "bg-white/10"
            }`}
          >
            {item === "parent" ? "Parent" : "Tuteur"}
          </button>
        ))}
      </div>
      <input
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="Ville"
        className={`${input} mt-4`}
      />
      {error ? <p className="mt-3 text-sm text-[#FF8A80]">{error}</p> : null}
      <button className="mt-6 rounded-2xl bg-white py-3 font-extrabold text-[#111111]">
        Continuer
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-white/70">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Chips({
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
    <div>
      <p className="text-sm font-semibold text-white/70">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onToggle(option)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              selected.includes(option) ? "bg-[#3DDC97] text-[#111111]" : "bg-white/10"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const input = "w-full rounded-2xl border border-white/10 bg-[#1C1C1E] px-4 py-3 outline-none";

function words(value: string, max: number) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, max).join(" ");
}
