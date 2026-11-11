"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSiteSearch } from "@/components/site/Search";
import { subjectSuggestions } from "@/components/site/filters";

const RECENT_KEY = "clutch_recent_search";

type Recent = { query: string };

function readRecent(): Recent | null {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Recent>;
    const query = typeof parsed.query === "string" ? parsed.query.trim() : "";
    if (!query) return null;
    return { query };
  } catch {
    return null;
  }
}

export default function SearchBar({ prominent = false }: { prominent?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setQuery, setCity, promptAroundOnce } = useSiteSearch();
  const root = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);
  const [open, setOpen] = useState(false);
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
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  function goHome() {
    if (pathname !== "/") router.push("/");
  }

  function remember(nextQuery: string) {
    const saved = { query: nextQuery.trim() };
    if (!saved.query) return;
    try {
      sessionStorage.setItem(RECENT_KEY, JSON.stringify(saved));
    } catch {
      // Ignore storage errors
    }
    setRecent(saved);
  }

  function submitSubject(value: string) {
    const trimmed = value.trim();
    setQuery(value);
    if (trimmed) {
      remember(trimmed);
      promptAroundOnce();
    }
    setOpen(false);
    goHome();
  }

  const subjects = subjectSuggestions(query);
  const showRecent = open && !query.trim() && Boolean(recent?.query);
  const showSubjects = open && subjects.length > 0;

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
              setOpen(true);
              goHome();
            }}
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitSubject(query);
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
              {showRecent && recent ? (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => submitSubject(recent.query)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f3f7f5]"
                >
                  <span className="rounded-md bg-[#e7f6f1] px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-[#087a5c] uppercase">
                    Reprise
                  </span>
                  <span className="truncate text-sm font-semibold">{recent.query}</span>
                </button>
              ) : null}
              {showSubjects
                ? subjects.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => submitSubject(item)}
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
        <button
          type="button"
          onClick={() => submitSubject(query)}
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
