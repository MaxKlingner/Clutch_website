"use client";

import { useAuth } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import FilterBar from "@/components/catalog/FilterBar";
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

const EMPTY_SET = new Set<string>();

export default function Catalog({
  initialTutors,
  initialView = "liste",
}: {
  initialTutors?: Tutor[];
  initialView?: "liste" | "carte";
}) {
  const { query, city, around, aroundState, setQuery, setCity, clearAround, requestAround } =
    useSiteSearch();
  const { userId, isSignedIn } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>(initialTutors ?? []);
  const [formats, setFormats] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [maxRate, setMaxRate] = useState<number | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [view, setView] = useState<"liste" | "carte">(initialView);
  const [favorites, setFavorites] = useState<Set<string>>(EMPTY_SET);
  const [contacted, setContacted] = useState<Set<string>>(EMPTY_SET);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(initialTutors === undefined);

  useEffect(() => {
    let cancel = false;
    fetchTutors()
      .then((rows) => {
        if (!cancel) setTutors(rows);
      })
      .catch((err: Error) => {
        if (!cancel && initialTutors === undefined) setError(err.message);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [initialTutors]);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    let cancel = false;
    Promise.all([fetchFavoriteIds(userId), contactedTutorIds(userId)])
      .then(([saved, known]) => {
        if (cancel) return;
        setFavorites(saved);
        setContacted(known);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [isSignedIn, userId]);

  const activeFavorites = isSignedIn && userId ? favorites : EMPTY_SET;
  const activeContacted = isSignedIn && userId ? contacted : EMPTY_SET;

  const origin = useMemo(
    () => around ?? centroidForCity(tutors, city),
    [around, tutors, city]
  );

  const visible = useMemo(() => {
    const matched = tutors.filter((tutor) =>
      matchesTutor(tutor, {
        query,
        city,
        formats,
        levels,
        maxRate,
        radiusKm,
        origin,
      })
    );
    return sortByProximity(matched, around);
  }, [tutors, query, city, formats, levels, maxRate, radiusKm, origin, around]);

  function onRadius(value: number | null) {
    setRadiusKm(value);
    if (value != null && !around && !centroidForCity(tutors, city)) requestAround();
  }

  function resetAllFilters() {
    setQuery("");
    setCity("");
    clearAround();
    setFormats([]);
    setLevels([]);
    setMaxRate(null);
    setRadiusKm(null);
  }

  const hasActiveFilters = Boolean(
    query.trim() || city.trim() || around || formats.length || levels.length || maxRate != null || radiusKm != null
  );
  const unplaced = visible.filter((tutor) => tutor.latitude == null || tutor.longitude == null).length;

  async function onToggleSave(tutor: Tutor) {
    if (!userId) return;
    const nextOn = !activeFavorites.has(tutor.id);
    const previous = activeFavorites;
    const next = new Set(activeFavorites);
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
    <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
      <div className="relative z-20 -mx-4 overflow-visible bg-[#f6f7f8] px-4 py-3 sm:sticky sm:top-[var(--site-header,3.5rem)] sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:pr-[var(--header-search-end-inset,0px)]">
          <div className="flex w-fit shrink-0 rounded-full border border-black/10 bg-white p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setView("liste")}
              className={`rounded-full px-3.5 py-1.5 transition ${view === "liste" ? "bg-[#12382c] text-white" : "text-black/60 hover:text-black"}`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => setView("carte")}
              className={`rounded-full px-3.5 py-1.5 transition ${view === "carte" ? "bg-[#12382c] text-white" : "text-black/60 hover:text-black"}`}
            >
              Carte
            </button>
          </div>
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
        </div>
      </div>

      <div className="mt-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Professeurs disponibles
        </h1>
        <p className="mt-1 text-sm text-black/60">
          Mise en relation directe et 100 % gratuite entre élèves et professeurs particuliers, sans commission.
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-[#c23b3b]">{error}</p> : null}

      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,28,26,0.04)]">
              <div className="aspect-square w-full rounded-2xl bg-black/5" />
              <div className="mt-3 h-5 w-2/3 rounded-lg bg-black/5" />
              <div className="mt-2 h-4 w-1/2 rounded-lg bg-black/5" />
              <div className="mt-3 h-10 w-full rounded-lg bg-black/5" />
            </div>
          ))}
        </div>
      ) : view === "liste" ? (
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {visible.map((tutor) => {
            const isOwn = Boolean(userId && tutor.clerkId === userId);
            return (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                saved={activeFavorites.has(tutor.id)}
                contacted={activeContacted.has(tutor.id)}
                isOwn={isOwn}
                onToggleSave={isSignedIn && !isOwn ? () => onToggleSave(tutor) : undefined}
              />
            );
          })}
        </div>
      ) : (
        <>
          <div className="relative z-0 mt-5 overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,28,26,0.06)]">
            <TutorMap
              tutors={visible}
              focus={around ? { lat: around.lat, lng: around.lng, zoom: 13 } : null}
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
        <div className="mt-10 rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,28,26,0.04)]">
          <p className="text-black/65">Aucun professeur ne correspond à cette recherche.</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-3 rounded-full bg-[#12382c] px-4 py-2 text-sm font-extrabold text-white"
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
