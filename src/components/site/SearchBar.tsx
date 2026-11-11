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

export default function SearchBar({
  prominent = false,
  ctaLabel = "Chercher",
}: {
  prominent?: boolean;
  ctaLabel?: string;
}) {
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

  function goCatalog() {
    if (pathname !== "/professeurs") router.push("/professeurs");
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
    goCatalog();
  }

  const subjects = subjectSuggestions(query);
  const showRecent = open && !query.trim() && Boolean(recent?.query);
  const showSubjects = open && subjects.length > 0;

  return (
    <div ref={root} className={`relative min-w-0 ${prominent ? "z-20" : "flex-1"}`}>
      <div
        className={
          prominent
            ? "flex flex-col gap-2 rounded-3xl bg-white p-2 shadow-[0_20px_60px_rgba(15,28,26,0.10)] ring-1 ring-black/5 sm:flex-row sm:items-center sm:p-2"
            : "flex h-11 min-w-0 items-center rounded-2xl bg-[#f6f7f8] ring-1 ring-black/10"
        }
      >
        <div className="relative flex min-w-0 flex-1 items-center">
          {prominent ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-4 h-5 w-5 shrink-0 text-black/35"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          ) : null}
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              if (!prominent) goCatalog();
            }}
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitSubject(query);
              }
            }}
            placeholder={prominent ? "Quelle matière cherchez-vous ? (Maths, Anglais…)" : "Quelle matière ?"}
            aria-label="Quelle matière ?"
            className={
              prominent
                ? "h-12 w-full rounded-2xl bg-transparent pr-4 pl-3 text-base outline-none placeholder:text-black/40"
                : "h-11 w-full bg-transparent px-4 text-sm outline-none"
            }
          />
          {showRecent || showSubjects ? (
            <div className="absolute top-[calc(100%+10px)] right-0 left-0 z-30 max-h-80 overflow-y-auto rounded-2xl bg-white py-1 text-left shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5">
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
              ? "h-12 shrink-0 rounded-2xl bg-[#12382c] px-6 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(18,56,44,0.18)] transition hover:bg-[#087a5c]"
              : "mr-1 h-9 shrink-0 rounded-lg bg-[#12382c] px-3 text-xs font-extrabold text-white transition hover:bg-[#087a5c]"
          }
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
