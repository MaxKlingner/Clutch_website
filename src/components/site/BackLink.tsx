"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const HistoryContext = createContext(false);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const depthRef = useRef(0);
  const lastHistoryLenRef = useRef(0);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      depthRef.current = Math.max(0, depthRef.current - 1);
      lastHistoryLenRef.current = window.history.length;
      setCanGoBack(depthRef.current > 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      lastHistoryLenRef.current = window.history.length;
      return;
    }
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (window.history.length > lastHistoryLenRef.current) {
        depthRef.current += 1;
        lastHistoryLenRef.current = window.history.length;
        queueMicrotask(() => setCanGoBack(depthRef.current > 0));
      }
    }
  }, [pathname]);

  return <HistoryContext.Provider value={canGoBack}>{children}</HistoryContext.Provider>;
}

export default function BackLink({
  fallbackHref = "/professeurs",
  fallbackLabel = "Tous les professeurs",
  className = "text-sm font-semibold text-black/55 transition hover:text-[#087a5c]",
}: {
  fallbackHref?: string;
  fallbackLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const canGoBack = useContext(HistoryContext);

  if (canGoBack) {
    return (
      <button type="button" onClick={() => router.back()} className={className}>
        ← Retour
      </button>
    );
  }

  return (
    <Link href={fallbackHref} className={className}>
      ← {fallbackLabel}
    </Link>
  );
}
