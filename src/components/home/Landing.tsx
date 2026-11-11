"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";
import SearchBar from "@/components/site/SearchBar";
import { useSiteSearch } from "@/components/site/Search";
import TutorCard from "@/components/site/TutorCard";
import type { Tutor } from "@/lib/db";

const QUICK_SUBJECTS = [
  "Mathématiques",
  "Anglais",
  "Physique-Chimie",
  "Français",
  "Informatique",
  "Espagnol",
] as const;

const PILLARS = [
  {
    step: "01",
    title: "Choisissez votre matière",
    body: "Indiquez simplement le domaine recherché. Les professeurs sont classés autour de vous dès la recherche.",
  },
  {
    step: "02",
    title: "Comparez en toute clarté",
    body: "Tarifs horaires affichés, niveaux enseignés, cours en personne ou à distance et avis vérifiés.",
  },
  {
    step: "03",
    title: "Échangez sans aucun frais",
    body: "Contactez directement le professeur sur la messagerie ou par téléphone, sans commission ni abonnement.",
  },
] as const;

export default function Landing({ initialTutors }: { initialTutors: Tutor[] }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { setQuery, promptAroundOnce } = useSiteSearch();

  const previewTutors = useMemo(() => {
    return [...initialTutors]
      .sort((a, b) => {
        const photoScore = Number(Boolean(b.avatarUrl)) - Number(Boolean(a.avatarUrl));
        if (photoScore !== 0) return photoScore;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 4);
  }, [initialTutors]);

  function openSubject(subject: string) {
    setQuery(subject);
    promptAroundOnce();
    router.push("/professeurs");
  }

  function openAll() {
    setQuery("");
  }

  return (
    <main className="relative overflow-x-clip">
      <section className="relative isolate mx-auto max-w-6xl px-4 pt-12 pb-12 sm:px-6 sm:pt-18 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 inset-y-0 -z-10 overflow-hidden sm:inset-x-6"
          style={{
            maskImage:
              "radial-gradient(ellipse 76% 78% at 50% 48%, black 34%, rgba(0,0,0,0.45) 64%, transparent 94%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 76% 78% at 50% 48%, black 34%, rgba(0,0,0,0.45) 64%, transparent 94%)",
          }}
        >
          <Image
            src="/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover object-[65%_30%] opacity-60"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_64%_58%_at_50%_46%,rgba(246,247,248,0.88)_0%,rgba(246,247,248,0.68)_52%,rgba(246,247,248,0.16)_100%)]" />
        </div>

        <div className="mx-auto w-full max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#0f1c1a] sm:text-6xl sm:leading-[1.06]">
            Trouver son professeur,{" "}
            <span className="text-[#087a5c]">simplement et gratuitement.</span>
          </h1>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar prominent ctaLabel="Trouver mon professeur →" />
          </div>

          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {QUICK_SUBJECTS.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => openSubject(subject)}
                className="rounded-full border border-black/10 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-black/75 shadow-[0_2px_10px_rgba(15,28,26,0.04)] backdrop-blur-sm transition hover:border-[#0d9f7a] hover:bg-white hover:text-[#087a5c]"
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </section>

      {previewTutors.length ? (
        <section className="mx-auto max-w-6xl px-4 pt-6 pb-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold tracking-[0.16em] text-[#087a5c] uppercase">
                Aperçu
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Quelques professeurs disponibles
              </h2>
            </div>
            <Link
              href="/professeurs"
              onClick={openAll}
              className="text-sm font-bold text-[#087a5c] hover:underline"
            >
              Voir tous les professeurs ({initialTutors.length}) →
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {previewTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/professeurs"
              onClick={openAll}
              className="inline-flex items-center justify-center rounded-full bg-[#12382c] px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(18,56,44,0.18)] transition hover:bg-[#087a5c]"
            >
              Explorer tous les professeurs →
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {PILLARS.map((item) => (
            <div
              key={item.step}
              className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#e7f6f1] text-xs font-extrabold text-[#087a5c]">
                {item.step}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-[#0f1c1a]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/60">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#12382c] p-7 text-white sm:flex-row sm:items-center sm:p-10">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Vous donnez des cours particuliers ?
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Publiez votre annonce gratuitement en quelques minutes et échangez directement avec vos futurs élèves.
            </p>
          </div>
          <Link
            href={isSignedIn ? "/annonce" : "/inscription"}
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#12382c] transition hover:bg-[#e7f6f1]"
          >
            {isSignedIn ? "Mon annonce" : "Donner des cours →"}
          </Link>
        </div>
      </section>
    </main>
  );
}
