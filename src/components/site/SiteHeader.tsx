"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import SearchBar from "@/components/site/SearchBar";
import { announcementPublished, fetchMyTutorProfile } from "@/lib/db";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const [hasListing, setHasListing] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const write = () => {
      document.documentElement.style.setProperty("--site-header", `${node.offsetHeight}px`);
      const nav = navRef.current;
      const row = nav?.parentElement;
      if (nav && row) {
        const gap = Number.parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 0;
        document.documentElement.style.setProperty(
          "--header-search-end-inset",
          `${nav.offsetWidth + gap}px`
        );
      }
    };
    write();
    const observer = new ResizeObserver(write);
    observer.observe(node);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [pathname, isSignedIn, hasListing]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  useEffect(() => {
    if (!userId) {
      setHasListing(false);
      return;
    }
    const load = () => {
      fetchMyTutorProfile(userId)
        .then((profile) => setHasListing(announcementPublished(profile)))
        .catch(() => setHasListing(false));
    };
    load();
    window.addEventListener("clutch-announcement", load);
    return () => window.removeEventListener("clutch-announcement", load);
  }, [userId, pathname]);

  const teachHref = isSignedIn ? "/annonce" : "/inscription";
  const teachLabel = hasListing ? "Mon annonce" : "Donner des cours";

  return (
    <header ref={headerRef} className="sticky top-0 z-30 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Clutch">
          <BrandLogo size={32} />
        </Link>
        <div className="min-w-0 flex-1">
          <SearchBar />
        </div>
        <div
          ref={navRef}
          className="ml-auto flex shrink-0 items-center gap-0.5 text-sm font-semibold sm:gap-2"
        >
          <Link href={teachHref} className="rounded-full px-2 py-2 hover:bg-black/5 sm:px-3">
            {teachLabel}
          </Link>
          {isSignedIn ? (
            <>
              <IconLink href="/favoris" label="Favoris" active={pathname.startsWith("/favoris")}>
                <HeartIcon filled={pathname.startsWith("/favoris")} />
              </IconLink>
              <IconLink href="/messages" label="Messages" active={pathname.startsWith("/messages")}>
                <MessagesIcon />
              </IconLink>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setOpen((value) => !value)}
                  aria-label="Compte"
                  title="Compte"
                  aria-expanded={open}
                  className={`grid h-10 w-10 place-items-center rounded-full ${
                    open || pathname.startsWith("/compte")
                      ? "bg-[#e7f6f1] text-[#087a5c]"
                      : "text-[#1c1c1c] hover:bg-black/5"
                  }`}
                >
                  <AccountIcon />
                </button>
                {open ? (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-2 text-[#1c1c1c] shadow-[0_16px_40px_rgba(15,28,26,0.12)]">
                    <Link
                      href="/compte"
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-2 hover:bg-black/5"
                    >
                      Compte
                    </Link>
                    <button
                      type="button"
                      className="block w-full rounded-xl px-3 py-2 text-left hover:bg-black/5"
                      onClick={() => signOut(() => router.push("/"))}
                    >
                      Se déconnecter
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Link href="/connexion" className="rounded-full bg-[#1c1c1c] px-4 py-2 text-white">
              Connexion
            </Link>
          )}
        </div>
      </div>
      {pathname === "/" ? null : (
        <div className="mx-auto flex max-w-6xl gap-2 px-4 pb-3 md:hidden">
          <SearchBar />
        </div>
      )}
    </header>
  );
}

function IconLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-full ${
        active ? "bg-[#e7f6f1] text-[#087a5c]" : "text-[#1c1c1c] hover:bg-black/5"
      }`}
    >
      {children}
    </Link>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-7-9.1A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.9C19 15.6 12 20 12 20Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 16.5 3.8 19a.6.6 0 0 1-1-.4V7.2A2.2 2.2 0 0 1 5 5h14a2.2 2.2 0 0 1 2.2 2.2v7.1A2.2 2.2 0 0 1 19 16.5H6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.2 19.2c1.3-2.8 3.7-4.2 6.8-4.2s5.5 1.4 6.8 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
