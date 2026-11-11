"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSiteSearch } from "@/components/site/Search";
import { subjectSuggestions } from "@/components/site/filters";
import { suggestLocations } from "@/lib/locations";

const RECENT_KEY = "clutch_recent_search";

type Recent = { query: string; city: string };

function readRecent(): Recent | null {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Recent;
    if (!parsed.query && !parsed.city) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function SearchBar({ prominent = false }: { prominent?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { query, city, setQuery, setCity, around, aroundState, requestAround, clearAround } = useSiteSearch();
  const root = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);
  const [panel, setPanel] = useState<"subject" | "place" | null>(null);
  const [placeDraft, setPlaceDraft] = useState("");
  const [recent, setRecent] = useState<Recent | null>(null);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const params = new URLSearchParams(window.location.search);
    const nextQuery = params.get("q");
    const nextCity = params.get("ville");
    const saved = readRecent();
    queueMicrotask(() => {
      if (nextQuery) setQuery(nextQuery);
      if (nextCity) setCity(nextCity);
      if (saved) setRecent(saved);
    });
  }, [setQuery, setCity]);

  useEffect(() => {
    if (!panel) return;
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setPanel(null);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [panel]);

  function goHome() {
    if (pathname !== "/") router.push("/");
  }

  function remember(nextQuery: string, nextCity: string) {
    const saved = { query: nextQuery.trim(), city: nextCity.trim() };
    if (!saved.query && !saved.city) return;
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(saved));
    setRecent(saved);
  }

  function pickSubject(value: string) {
    setQuery(value);
    remember(value, city);
    setPanel(null);
    goHome();
  }

  function pickCity(value: string) {
    const next = value.trim();
    clearAround();
    setCity(next);
    setPlaceDraft(next);
    remember(query, next);
    setPanel(null);
    goHome();
  }

  function chooseAround() {
    setPanel(null);
    setPlaceDraft("");
    requestAround();
    goHome();
  }

  function chooseEverywhere() {
    setPanel(null);
    setCity("");
    setPlaceDraft("");
    clearAround();
    goHome();
  }

  const subjects = subjectSuggestions(query);
  const placeSuggestions = panel === "place" ? suggestLocations(placeDraft) : [];
  const showRecent = panel === "subject" && !query.trim() && recent;
  const showSubjects = panel === "subject" && subjects.length > 0;
  const placeLabel =
    aroundState === "pending"
      ? "Autorisation…"
      : around
        ? "Du plus proche"
        : city.trim()
          ? city.trim()
          : "Partout";

  return (
    <div ref={root} className={`relative min-w-0 ${prominent ? "z-20" : "flex-1"}`}>
      <div
        className={
          prominent
            ? "flex items-center rounded-2xl bg-white p-1.5 shadow-[0_16px_40px_rgba(15,28,26,0.08)] ring-1 ring-black/5"
            : "flex h-11 min-w-0 items-center rounded-2xl bg-[#f6f7f8] ring-1 ring-black/10"
        }
      >
        <div className="relative min-w-0 flex-1">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPanel("subject");
              goHome();
            }}
            onClick={() => setPanel("subject")}
            onFocus={() => setPanel("subject")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                remember(query, city);
                setPanel(null);
                goHome();
              }
            }}
            placeholder="Quelle matière ?"
            aria-label="Quelle matière ?"
            className={
              prominent
                ? "h-12 w-full rounded-xl px-4 text-base outline-none placeholder:text-black/35"
                : "h-11 w-full bg-transparent px-4 text-sm outline-none"
            }
          />
          {showRecent || showSubjects ? (
            <div className="absolute top-[calc(100%+8px)] right-0 left-0 z-30 overflow-hidden rounded-2xl bg-white py-1 shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5">
              {showRecent ? (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(recent.query);
                    if (recent.city) clearAround();
                    setCity(recent.city);
                    setPlaceDraft(recent.city);
                    setPanel(null);
                    goHome();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f3f7f5]"
                >
                  <span className="rounded-md bg-[#e7f6f1] px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-[#087a5c] uppercase">
                    Reprise
                  </span>
                  <span className="truncate text-sm font-semibold">
                    {[recent.query, recent.city].filter(Boolean).join(" · ")}
                  </span>
                </button>
              ) : null}
              {showSubjects
                ? subjects.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pickSubject(item)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#f3f7f5]"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#12382c] text-xs font-extrabold text-white">
                        {item.slice(0, 1)}
                      </span>
                      {item}
                    </button>
                  ))
                : null}
            </div>
          ) : null}
        </div>
        <span className={prominent ? "h-8 w-px shrink-0 bg-black/10" : "h-5 w-px shrink-0 bg-black/10"} />
        <div className={prominent ? "relative min-w-0 flex-1" : "relative max-w-[9.5rem] shrink-0 sm:max-w-none sm:w-44"}>
          <button
            type="button"
            onClick={() => {
              setPlaceDraft(city);
              setPanel((current) => (current === "place" ? null : "place"));
            }}
            aria-expanded={panel === "place"}
            aria-label={`Lieu : ${placeLabel}`}
            className={
              prominent
                ? "h-12 w-full truncate rounded-xl px-4 text-left text-base text-[#1c1c1c]"
                : "h-11 w-full truncate px-3 text-left text-sm text-[#1c1c1c]"
            }
          >
            {placeLabel}
          </button>
          {panel === "place" ? (
            <div className="absolute top-[calc(100%+8px)] right-0 z-30 w-64 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5 sm:w-72">
              <input
                value={placeDraft}
                onChange={(event) => setPlaceDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (placeDraft.trim()) pickCity(placeDraft);
                    else chooseEverywhere();
                  }
                }}
                placeholder="Ville ou code postal…"
                aria-label="Ville ou code postal"
                autoFocus
                className="mb-1.5 h-10 w-full rounded-xl border border-black/10 bg-[#f6f7f8] px-3 text-sm outline-none focus:border-[#0d9f7a] focus:bg-white"
              />
              {placeSuggestions.length > 0 ? (
                <div className="mb-1.5 max-h-48 overflow-y-auto border-b border-black/5 pb-1.5">
                  {placeSuggestions.map((item) => (
                    <button
                      key={`${item.postalCode}-${item.name}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pickCity(item.name)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f3f7f5]"
                    >
                      <span className="truncate font-semibold">{item.name}</span>
                      <span className="ml-2 shrink-0 text-xs text-black/45">{item.postalCode}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={chooseEverywhere}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f3f7f5] ${
                  !around && !city.trim() ? "bg-[#e7f6f1] font-semibold text-[#087a5c]" : "font-medium"
                }`}
              >
                Partout
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={chooseAround}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f3f7f5] ${
                  around ? "bg-[#e7f6f1] font-semibold text-[#087a5c]" : "font-semibold"
                }`}
              >
                Du plus proche
              </button>
              {aroundState === "denied" ? (
                <p className="px-3 pt-1 pb-1 text-xs leading-5 text-black/50">
                  Autorisation refusée par le navigateur.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            remember(query, city);
            setPanel(null);
            goHome();
          }}
          className={
            prominent
              ? "h-12 shrink-0 rounded-xl bg-[#12382c] px-5 text-sm font-extrabold text-white"
              : "mr-1 h-9 shrink-0 rounded-lg bg-[#12382c] px-3 text-xs font-extrabold text-white"
          }
        >
          Chercher
        </button>
      </div>
    </div>
  );
}
