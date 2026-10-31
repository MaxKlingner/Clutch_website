"use client";

import { useAuth } from "@clerk/clerk-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireUser() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    const next = `${pathname}${window.location.search}`;
    router.replace(`/connexion?next=${encodeURIComponent(next)}`);
  }, [isLoaded, isSignedIn, pathname, router]);

  return isLoaded && Boolean(isSignedIn);
}
