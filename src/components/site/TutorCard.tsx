import Image from "next/image";
import Link from "next/link";
import type { Tutor } from "@/lib/db";
import { responseLabel } from "@/lib/trust";

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
  const label = `${name} — ${tutor.specialties[0] || tutor.subject}, ${formatRate(tutor.hourlyRate)} €/h`;
  return (
    <article className="relative isolate flex flex-col rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,28,26,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,28,26,0.09)]">
      <Link
        href={`/tuteur/${tutor.id}`}
        className="absolute inset-0 z-10 rounded-3xl"
        aria-label={label}
      />
      <div className="relative">
        <Portrait
          name={tutor.name}
          url={tutor.avatarUrl}
          className="aspect-square h-auto w-full rounded-2xl object-cover"
        />
        {onToggleSave ? (
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={`absolute top-1 right-1 z-20 grid h-8 w-8 place-items-center rounded-full bg-white text-base shadow-sm ${
              saved ? "text-[#e23b4a]" : "text-black/35"
            }`}
          >
            {saved ? "♥" : "♡"}
          </button>
        ) : null}
      </div>
      <div className="mt-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate text-lg font-extrabold">{firstName(tutor.name)}</h2>
          <p className="shrink-0 font-extrabold text-[#0d9f7a]">{formatRate(tutor.hourlyRate)} €/h</p>
        </div>
        <p className="mt-1 truncate text-sm text-black/60">
          {tutor.rating > 0 ? (
            <>
              <span className="text-[#e6b800]">★</span> {tutor.rating.toFixed(1)} · {tutor.reviewCount} avis
            </>
          ) : (
            "Nouveau professeur"
          )}
          {tutor.city ? ` · ${tutor.city}` : ""}
        </p>
        {responseLabel(tutor.responseMinutes) ? (
          <p className="mt-1 truncate text-xs font-semibold text-black/50">
            {responseLabel(tutor.responseMinutes)}
          </p>
        ) : null}
        {isOwn ? (
          <p className="mt-2 inline-flex rounded-full bg-[#12382c] px-2.5 py-1 text-xs font-bold text-white">
            Mon annonce
          </p>
        ) : contacted ? (
          <p className="mt-2 inline-flex rounded-full bg-[#e7f6f1] px-2.5 py-1 text-xs font-bold text-[#087a5c]">
            Déjà contacté
          </p>
        ) : null}
        <p
          className={`mt-2 text-sm leading-6 text-black/70 ${
            contacted || isOwn ? "line-clamp-2" : "line-clamp-3"
          }`}
        >
          {tutor.bio || "Présentation à venir."}
        </p>
        <p className="mt-2 truncate text-sm font-semibold text-black/80">
          {tutor.specialties.slice(0, 2).join(" · ") || tutor.subject}
        </p>
      </div>
    </article>
  );
}
