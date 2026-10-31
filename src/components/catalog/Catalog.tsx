"use client";

import { useAuth } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import FilterBar from "@/components/catalog/FilterBar";
import SearchBar from "@/components/site/SearchBar";
import TutorCard from "@/components/site/TutorCard";
import TutorMap from "@/components/site/TutorMap";
import { centroidForCity, matchesTutor, sortByProximity } from "@/components/site/filters";
import { useSiteSearch } from "@/components/site/Search";
import {
  contactedTutorIds,
  fetchFavoriteIds,
  fetchTutors,
  toggleFavorite,
  type Tutor,
} from "@/lib/db";

export default function Catalog() {
  const { query, city, around, aroundState, requestAround } = useSiteSearch();
  const { userId, isSignedIn } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [maxRate, setMaxRate] = useState<number | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [view, setView] = useState<"liste" | "carte">("liste");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("vue") === "carte") setView("carte");
  }, []);

  useEffect(() => {
    fetchTutors()
      .then(setTutors)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setFavorites(new Set());
      setContacted(new Set());
      return;
    }
    Promise.all([fetchFavoriteIds(userId), contactedTutorIds(userId)])
      .then(([saved, known]) => {
        setFavorites(saved);
        setContacted(known);
      })
      .catch(() => undefined);
  }, [isSignedIn, userId]);

  const origin = useMemo(
    () => around ?? centroidForCity(tutors, city),
    [around, tutors, city]
  );

  const visible = useMemo(() => {
    const limit = around ? (radiusKm == null ? 50 : Math.min(radiusKm, 50)) : radiusKm;
    const matched = tutors.filter((tutor) =>
      matchesTutor(tutor, { query, city, formats, levels, maxRate, radiusKm: limit, origin })
    );
    return sortByProximity(matched, around);
  }, [tutors, query, city, formats, levels, maxRate, radiusKm, origin, around]);

  function onRadius(value: number | null) {
    setRadiusKm(value);
    if (value != null && !around && !centroidForCity(tutors, city)) requestAround();
  }

  const unplaced = visible.filter((tutor) => tutor.latitude == null || tutor.longitude == null).length;

  async function onToggleSave(tutor: Tutor) {
    if (!userId) return;
    const nextOn = !favorites.has(tutor.id);
    const previous = favorites;
    const next = new Set(favorites);
    if (nextOn) next.add(tutor.id);
    else next.delete(tutor.id);
    setFavorites(next);
    try {
      await toggleFavorite(userId, tutor.id, nextOn);
    } catch (err) {
      setFavorites(previous);
      setError(err instanceof Error ? err.message : "Favori impossible.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
      <div className="sticky top-[var(--site-header,3.5rem)] z-20 -mx-4 bg-[#f6f7f8] px-4 pt-4 pb-3 sm:-mx-6 sm:px-6">
        <SearchBar prominent />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <FilterBar
            formats={formats}
            levels={levels}
            maxRate={maxRate}
            radiusKm={radiusKm}
            geoState={aroundState}
            onFormats={setFormats}
            onLevels={setLevels}
            onMaxRate={setMaxRate}
            onRadius={onRadius}
          />
          <div className="flex shrink-0 self-end rounded-full bg-white p-1 text-sm font-semibold sm:self-auto">
            <button
              type="button"
              onClick={() => setView("liste")}
              className={`rounded-full px-3 py-2 ${view === "liste" ? "bg-[#1c1c1c] text-white" : "text-black/60"}`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => setView("carte")}
              className={`rounded-full px-3 py-2 ${view === "carte" ? "bg-[#1c1c1c] text-white" : "text-black/60"}`}
            >
              Carte
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Professeurs disponibles</h1>
        <p className="mt-1 text-sm text-black/55">
          {loading ? "Chargement…" : `${visible.length} profil${visible.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {error ? <p className="mt-6 text-sm text-[#c23b3b]">{error}</p> : null}

      {view === "liste" ? (
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {visible.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              saved={favorites.has(tutor.id)}
              contacted={contacted.has(tutor.id)}
              onToggleSave={isSignedIn ? () => onToggleSave(tutor) : undefined}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="relative z-0 mt-5 overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,28,26,0.06)]">
            <TutorMap
              tutors={visible}
              focus={around ? { lat: around.lat, lng: around.lng, radiusKm: 50 } : null}
            />
          </div>
          {unplaced ? (
            <p className="mt-3 text-sm text-black/50">
              {unplaced} profil{unplaced > 1 ? "s" : ""} sans position, visible{unplaced > 1 ? "s" : ""} dans la liste.
            </p>
          ) : null}
        </>
      )}

      {!loading && !visible.length && !error ? (
        <p className="mt-10 text-black/55">Aucun professeur ne correspond à cette recherche.</p>
      ) : null}
    </main>
  );
}
