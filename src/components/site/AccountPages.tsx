"use client";

import { useAuth } from "@clerk/clerk-react";
import AccountSettings from "@/components/site/AccountSettings";
import { useEffect, useState } from "react";
import BackLink from "@/components/site/BackLink";
import TutorCard from "@/components/site/TutorCard";
import { useRequireUser } from "@/components/site/useRequireUser";
import { fetchFavorites, toggleFavorite, type Tutor } from "@/lib/db";

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
        <BackLink />
        <p className="grid min-h-[40vh] place-items-center text-black/50">Chargement…</p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <BackLink />
      <h1 className="mt-4 font-display text-3xl font-bold">Favoris</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
