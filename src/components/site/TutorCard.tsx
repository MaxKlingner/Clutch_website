import Image from "next/image";
import Link from "next/link";
import type { Tutor } from "@/lib/db";

const OPTIMIZABLE_HOSTS = new Set([
  "sigmknikvehehydkizvd.supabase.co",
  "img.clerk.com",
]);

function canOptimizeImage(url: string) {
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !OPTIMIZABLE_HOSTS.has(parsed.hostname)) return false;
    if (parsed.hostname === "sigmknikvehehydkizvd.supabase.co") {
      return parsed.pathname.startsWith("/storage/v1/object/public/");
    }
    return true;
  } catch {
    return false;
  }
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export function formatRate(rate: number) {
  if (!rate) return "—";
  return Number.isInteger(rate) ? String(rate) : rate.toFixed(0);
}

function shortFormats(formats: string[]) {
  const tags: string[] = [];
  for (const raw of formats) {
    const lower = raw.toLowerCase();
    const isRemote = lower.includes("distance") || lower.includes("ligne");
    const label = isRemote ? "À distance" : "Présentiel";
    if (!tags.includes(label)) tags.push(label);
  }
  return tags;
}

export function Portrait({
  name,
  url,
  className = "aspect-square h-auto w-full rounded-2xl object-cover",
}: {
  name: string;
  url: string | null;
  className?: string;
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={400}
        height={400}
        sizes="(max-width: 640px) 50vw, 280px"
        unoptimized={!canOptimizeImage(url)}
        className={className}
      />
    );
  }
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className={`grid place-items-center bg-[#e7f6f1] text-2xl font-extrabold text-[#087a5c] ${className}`}
    >
      {initials || "?"}
    </div>
  );
}

export default function TutorCard({
  tutor,
  saved = false,
  contacted = false,
  isOwn = false,
  onToggleSave,
}: {
  tutor: Tutor;
  saved?: boolean;
  contacted?: boolean;
  isOwn?: boolean;
  onToggleSave?: () => void;
}) {
  const name = firstName(tutor.name);
  const subjects = tutor.specialties.length ? tutor.specialties : tutor.subject ? [tutor.subject] : [];
  const formats = shortFormats(tutor.teachingFormats);
  const label = `${name} — ${subjects[0] || "Professeur"}, ${formatRate(tutor.hourlyRate)} €/h`;

  return (
    <article className="group relative isolate flex flex-col rounded-3xl bg-white p-3.5 shadow-[0_8px_30px_rgba(15,28,26,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,28,26,0.09)] sm:p-4">
      <Link
        href={`/tuteur/${tutor.id}`}
        className="absolute inset-0 z-10 rounded-3xl"
        aria-label={label}
      />
      <div className="relative overflow-hidden rounded-2xl">
        <Portrait
          name={tutor.name}
          url={tutor.avatarUrl}
          className="aspect-square h-auto w-full rounded-2xl object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {isOwn ? (
          <span className="absolute top-2 left-2 z-20 rounded-full bg-[#12382c]/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            Mon annonce
          </span>
        ) : contacted ? (
          <span className="absolute top-2 left-2 z-20 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#087a5c] shadow-sm backdrop-blur-sm">
            Contacté
          </span>
        ) : null}
        {onToggleSave ? (
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={`absolute top-2 right-2 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-base shadow-sm backdrop-blur-sm transition hover:scale-105 ${
              saved ? "text-[#e23b4a]" : "text-black/40"
            }`}
          >
            {saved ? "♥" : "♡"}
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="truncate font-display text-lg font-bold tracking-tight text-[#0f1c1a]">
            {name}
          </h2>
          <p className="shrink-0 text-base font-extrabold text-[#087a5c]">
            {formatRate(tutor.hourlyRate)}{" "}
            <span className="text-xs font-bold text-[#087a5c]/75">€/h</span>
          </p>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 text-xs font-medium text-black/55">
          <span className="truncate">{tutor.city || "À préciser"}</span>
          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#0f1c1a]">
            {tutor.rating > 0 ? (
              <>
                <span className="text-[#e6b800]">★</span>
                {tutor.rating.toFixed(1)}
                <span className="font-normal text-black/45">({tutor.reviewCount})</span>
              </>
            ) : (
              <span className="text-[#087a5c]">Nouveau</span>
            )}
          </span>
        </div>

        {subjects.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {subjects.slice(0, 2).map((item) => (
              <span
                key={item}
                className="max-w-full truncate rounded-lg bg-[#e7f6f1] px-2.5 py-1 text-xs font-bold text-[#087a5c]"
              >
                {item}
              </span>
            ))}
            {subjects.length > 2 ? (
              <span className="rounded-lg bg-[#f6f7f8] px-2 py-1 text-xs font-semibold text-black/50">
                +{subjects.length - 2}
              </span>
            ) : null}
          </div>
        ) : null}

        {formats.length ? (
          <div className="mt-auto pt-3">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-black/5 pt-2.5 text-[11px] font-medium text-black/50">
              <span className="truncate">{formats.join(" · ")}</span>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
