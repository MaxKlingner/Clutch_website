"use client";

import { SignUp } from "@clerk/clerk-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const dest =
    next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
  const signInHref = next ? `/connexion?next=${encodeURIComponent(dest)}` : "/connexion";

  return (
    <SignUp
      routing="hash"
      signInUrl={signInHref}
      forceRedirectUrl={dest}
      fallbackRedirectUrl={dest}
      appearance={{ variables: { colorPrimary: "#0d9f7a" } }}
    />
  );
}

export default function Page() {
  return (
    <main className="grid place-items-center px-4 py-10">
      <Suspense>
        <SignUpForm />
      </Suspense>
    </main>
  );
}
