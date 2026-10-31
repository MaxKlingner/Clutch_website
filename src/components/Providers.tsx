"use client";

import { ClerkProvider } from "@clerk/clerk-react";
import { SearchProvider } from "@/components/site/Search";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

export default function Providers({ children }: { children: React.ReactNode }) {
  if (!publishableKey) return <SearchProvider>{children}</SearchProvider>;
  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <SearchProvider>{children}</SearchProvider>
    </ClerkProvider>
  );
}
