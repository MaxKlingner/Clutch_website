"use client";

import Link from "next/link";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import {
  contactedTutorIds,
  fetchFavoriteIds,
  fetchTutors,
  SPECIALTIES,
  toggleFavorite,
  type Tutor,
} from "@/lib/db";

export default function Discover() {
  const { userId } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    Promise.all([fetchTutors(userId), fetchFavoriteIds(userId), contactedTutorIds(userId)])
      .then(([rows, favs, talked]) => {
        setTutors(rows);
        setFavorites(favs);
        setContacted(talked);
      })
      .catch((err: Error) => setError(err.message));
  }, [userId]);

  const visible = useMemo(
    () =>
      tutors.filter((tutor) =>
        subject ? tutor.specialties.some((item) => item === subject) : true
      ),
    [tutors, subject]
  );

  async function onHeart(tutor: Tutor) {
    if (!userId) return;
    const on = favorites.has(tutor.id);
    await toggleFavorite(userId, tutor.id, !on);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (on) next.delete(tutor.id);
      else next.add(tutor.id);
      return next;
    });
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Découvrir</h1>
      <p className="mt-2 text-sm text-white/55">
        Les mêmes tuteurs que dans l’app. Un message envoyé ne retire pas le profil.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
            !subject ? "bg-[#3DDC97] text-[#111111]" : "bg-white/10"
          }`}
          onClick={() => setSubject("")}
        >
          Tout
        </button>
        {SPECIALTIES.map((item) => (
          <button
            key={item}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              subject === item ? "bg-[#3DDC97] text-[#111111]" : "bg-white/10"
            }`}
            onClick={() => setSubject(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {error ? <p className="mt-4 text-sm text-[#FF8A80]">{error}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {visible.map((tutor) => (
          <article key={tutor.id} className="rounded-3xl border border-white/10 bg-[#1A1A1C] p-5">
            <div className="flex gap-4">
              <Avatar name={tutor.name} url={tutor.avatarUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate text-xl font-extrabold">{tutor.name.split(" ")[0]}</h2>
                  <button onClick={() => onHeart(tutor)} aria-label="Favori" className="text-lg">
                    {favorites.has(tutor.id) ? "♥" : "♡"}
                  </button>
                </div>
                <p className="text-sm text-white/70">
                  {tutor.rating > 0
                    ? `★ ${tutor.rating.toFixed(1)} (${tutor.reviewCount} avis)`
                    : "Pas encore d’avis"}
                </p>
                <p className="mt-1 text-lg font-extrabold">{formatRate(tutor.hourlyRate)} €/h</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/75">
              {tutor.bio || "Présentation à venir."}
            </p>
            <p className="mt-3 text-sm text-white/55">
              {tutor.city || "Lieu à préciser"} · {tutor.teachingFormats.join(" · ") || "Format à préciser"}
            </p>
            {contacted.has(tutor.id) ? (
              <p className="mt-3 text-xs font-extrabold text-[#3DDC97]">Déjà contacté</p>
            ) : null}
            <Link
              href={`/espace/tuteur/${tutor.id}`}
              className="mt-4 flex h-11 items-center justify-center rounded-2xl bg-[#1B6B45] text-sm font-extrabold"
            >
              Voir le profil
            </Link>
          </article>
        ))}
      </div>
      {!visible.length && !error ? (
        <p className="mt-8 text-white/60">Aucun tuteur pour ce filtre.</p>
      ) : null}
    </div>
  );
}

export function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  if (url) {
    return <img src={url} alt="" className="h-20 w-20 rounded-2xl object-cover" />;
  }
  return (
    <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#2C2C2E] text-lg font-extrabold">
      {initials || "?"}
    </div>
  );
}

function formatRate(rate: number) {
  if (!rate) return "—";
  return Number.isInteger(rate) ? String(rate) : rate.toFixed(2);
}
