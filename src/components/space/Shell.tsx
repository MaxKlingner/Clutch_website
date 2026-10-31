"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { getUserRole, type Role } from "@/lib/db";

const PARENT_LINKS = [
  ["/espace", "Découvrir"],
  ["/espace/carte", "Carte"],
  ["/espace/favoris", "Favoris"],
  ["/espace/messages", "Messages"],
  ["/espace/compte", "Compte"],
];

const TUTOR_LINKS = [
  ["/espace", "Annonce"],
  ["/espace/annonce", "Modifier"],
  ["/espace/messages", "Messages"],
  ["/espace/compte", "Compte"],
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      router.replace("/connexion");
      return;
    }
    getUserRole(userId)
      .then((next) => {
        setRole(next);
        if (!next && pathname !== "/espace/bienvenue") {
          router.replace("/espace/bienvenue");
        }
      })
      .finally(() => setReady(true));
  }, [isLoaded, isSignedIn, userId, pathname, router]);

  if (!isLoaded || !ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#111111] text-white">
        Chargement de ton espace…
      </div>
    );
  }

  if (pathname === "/espace/bienvenue") {
    return <div className="min-h-screen bg-[#111111] text-white">{children}</div>;
  }

  const links = role === "tutor" ? TUTOR_LINKS : PARENT_LINKS;

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/10 px-4 py-6 md:flex">
          <Link href="/" className="font-display text-2xl font-bold text-[#3DDC97]">
            Clutch
          </Link>
          <p className="mt-1 text-xs text-white/50">
            {user?.firstName || "Compte"} · {role === "tutor" ? "tuteur" : "parent"}
          </p>
          <nav className="mt-8 flex flex-col gap-1">
            {links.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    active ? "bg-white text-[#111111]" : "text-white/75 hover:bg-white/5"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 md:hidden">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  pathname === href ? "bg-white text-[#111111]" : "bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <main className="px-4 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
