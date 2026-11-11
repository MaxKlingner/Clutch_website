"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/clerk-react";
import AccountSettings from "@/components/site/AccountSettings";
import { useEffect, useState } from "react";
import TutorCard from "@/components/site/TutorCard";
import { useRequireUser } from "@/components/site/useRequireUser";
import { fetchFavorites, toggleFavorite, type Tutor } from "@/lib/db";
import { suggestLocations } from "@/lib/locations";
import { formatBirthInput, isAdultBirthDate } from "@/lib/trust";

const field =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#0d9f7a]";

export function Favorites() {
  const ready = useRequireUser();
  const { userId } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    if (!userId) return;
    fetchFavorites(userId).then(setTutors).catch(() => setTutors([]));
  }, [userId]);

  if (!ready) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <BackToTutors />
        <p className="grid min-h-[40vh] place-items-center text-black/50">Chargement…</p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <BackToTutors />
      <h1 className="mt-4 font-display text-3xl font-bold">Favoris</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tutors.map((tutor) => (
          <TutorCard
            key={tutor.id}
            tutor={tutor}
            saved
            onToggleSave={
              userId
                ? () => {
                    setTutors((current) => current.filter((item) => item.id !== tutor.id));
                    toggleFavorite(userId, tutor.id, false).catch(() =>
                      setTutors((current) =>
                        current.some((item) => item.id === tutor.id) ? current : [tutor, ...current]
                      )
                    );
                  }
                : undefined
            }
          />
        ))}
      </div>
      {!tutors.length ? (
        <p className="mt-6 text-black/55">
          Aucun favori. Le cœur sur un profil l’ajoute ici.
        </p>
      ) : null}
    </main>
  );
}

export function Account() {
  return <AccountSettings />;
}

export function Welcome() {
  const ready = useRequireUser();
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState<"parent" | "tutor">("parent");
  const [city, setCity] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [singleAccount, setSingleAccount] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return <Loading />;
  const citySuggestions = cityOpen ? suggestLocations(city) : [];

  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-16">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!userId || !user) return;
          if (!isAdultBirthDate(birthDate)) {
            setError("Il faut avoir 18 ans pour ouvrir un compte. Écris la date en JJ/MM/AAAA.");
            return;
          }
          if (!singleAccount) {
            setError("Confirme que ce compte est le seul que tu utilises.");
            return;
          }
          try {
            const { saveSignupProfile } = await import("@/lib/db");
            await user.update({
              unsafeMetadata: {
                ...user.unsafeMetadata,
                birthDate,
                singleAccount: true,
              },
            });
            await saveSignupProfile({
              clerkId: userId,
              role,
              firstName: user?.firstName || "",
              lastName: user?.lastName || "",
              city,
              email: user.primaryEmailAddress?.emailAddress || null,
            });
            router.replace(role === "tutor" ? "/annonce" : "/");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Enregistrement impossible.");
          }
        }}
      >
        <h1 className="font-display text-4xl font-bold">Tu es…</h1>
        <p className="mt-2 text-sm text-black/55">
          Tu pourras changer ensuite. Les professeurs restent visibles dans les deux cas.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {(["parent", "tutor"] as const).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setRole(item)}
              className={`rounded-2xl px-4 py-4 font-extrabold ${
                role === item ? "bg-[#1c1c1c] text-white" : "bg-white"
              }`}
            >
              {item === "parent" ? "Élève / Parent" : "Professeur"}
            </button>
          ))}
        </div>
        <div className="relative mt-4">
          <input
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setCityOpen(true);
            }}
            onFocus={() => setCityOpen(true)}
            onBlur={() => setTimeout(() => setCityOpen(false), 150)}
            placeholder="Ville ou commune"
            autoComplete="off"
            className={field}
          />
          {citySuggestions.length > 0 ? (
            <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-20 max-h-48 overflow-y-auto rounded-2xl bg-white py-1 shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5">
              {citySuggestions.map((item) => (
                <button
                  key={`${item.postalCode}-${item.name}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setCity(item.name);
                    setCityOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-[#f3f7f5]"
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-black/45">{item.postalCode}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <input
          value={birthDate}
          onChange={(event) => setBirthDate(formatBirthInput(event.target.value))}
          inputMode="numeric"
          placeholder="Date de naissance (JJ/MM/AAAA)"
          className={`${field} mt-2`}
        />
        <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-black/70">
          <input
            type="checkbox"
            checked={singleAccount}
            onChange={(event) => setSingleAccount(event.target.checked)}
            className="mt-1"
          />
          <span>Je confirme que ce compte est le seul que j’utilise sur Clutch.</span>
        </label>
        <p className="mt-3 text-sm text-black/45">
          <Link href="/conditions" className="font-semibold">
            Conditions
          </Link>
          {" · "}
          <Link href="/confidentialite" className="font-semibold">
            Confidentialité
          </Link>
        </p>
        {error ? <p className="mt-3 text-sm text-[#c23b3b]">{error}</p> : null}
        <button className="mt-6 w-full rounded-full bg-[#0d9f7a] py-3 font-extrabold text-white">
          Continuer
        </button>
      </form>
    </main>
  );
}

function BackToTutors() {
  return (
    <Link href="/professeurs" className="text-sm font-semibold text-black/55">
      ← Tous les professeurs
    </Link>
  );
}

function Loading() {
  return <p className="grid min-h-[40vh] place-items-center text-black/50">Chargement…</p>;
}
