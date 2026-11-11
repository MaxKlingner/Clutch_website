"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/site/SearchBar";
import { useSiteSearch } from "@/components/site/Search";
import TutorCard from "@/components/site/TutorCard";
import { fetchTutors, type Tutor } from "@/lib/db";

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
  const [tutors, setTutors] = useState<Tutor[]>(initialTutors);

  useEffect(() => {
    let cancel = false;
    fetchTutors()
      .then((rows) => {
        if (!cancel) setTutors(rows);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, []);

  const previewTutors = useMemo(() => {
    return [...tutors]
      .sort((a, b) => {
        const photoScore = Number(Boolean(b.avatarUrl)) - Number(Boolean(a.avatarUrl));
        if (photoScore !== 0) return photoScore;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 4);
  }, [tutors]);

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
      <section id="landing-hero" className="relative isolate flex min-h-[680px] items-start sm:min-h-[820px]">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[#12382c]">
          <Image
            src="/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[64%_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1c1a]/62 via-[#0f1c1a]/42 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(15,28,26,0.34)_0%,rgba(15,28,26,0.58)_72%,rgba(15,28,26,0.2)_100%)]" />
          <div
            className="absolute inset-x-0 bottom-0 h-56 sm:h-72"
            style={{
              background:
                "linear-gradient(to top, #f6f7f8 0%, rgba(246, 247, 248, 0.94) 18%, rgba(246, 247, 248, 0.78) 38%, rgba(246, 247, 248, 0.5) 60%, rgba(246, 247, 248, 0.2) 82%, rgba(246, 247, 248, 0) 100%)",
            }}
          />
        </div>

        <div className="mx-auto w-full max-w-4xl px-4 pt-28 pb-52 text-center sm:px-6 sm:pt-36 sm:pb-64">
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.32)] sm:text-6xl sm:leading-[1.06]">
            Trouver son professeur,{" "}
            <span className="text-[#7ee8c9]">simplement et gratuitement.</span>
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
                className="rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/25"
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </section>

      {previewTutors.length ? (
        <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 pb-6 sm:-mt-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold tracking-[0.16em] text-[#087a5c] uppercase">
                Aperçu
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Quelques professeurs disponibles
              </h2>
            </div>
            <Link
              href="/professeurs"
              onClick={openAll}
              className="text-sm font-bold text-[#087a5c] hover:underline"
            >
              Voir tous les professeurs ({tutors.length}) →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 lg:grid-cols-4">
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
