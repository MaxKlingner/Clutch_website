"use client";

import { ClerkProvider, useSession } from "@clerk/clerk-react";
import { useLayoutEffect } from "react";
import { SearchProvider } from "@/components/site/Search";
import { setSupabaseTokenProvider } from "@/lib/db";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

function SupabaseAuthBridge() {
  const { session } = useSession();

  useLayoutEffect(() => {
    if (!session) {
      setSupabaseTokenProvider(null);
      return;
    }
    setSupabaseTokenProvider(async () => {
      try {
        return (await session.getToken()) ?? null;
      } catch {
        return null;
      }
    });
    return () => setSupabaseTokenProvider(null);
  }, [session]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!publishableKey) return <SearchProvider>{children}</SearchProvider>;
  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <SupabaseAuthBridge />
      <SearchProvider>{children}</SearchProvider>
    </ClerkProvider>
  );
}
