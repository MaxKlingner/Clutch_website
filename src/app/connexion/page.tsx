"use client";

import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const dest =
    next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
  const signUpHref = next ? `/inscription?next=${encodeURIComponent(dest)}` : "/inscription";
  return (
    <SignIn
      routing="hash"
      signUpUrl={signUpHref}
      forceRedirectUrl={dest}
      fallbackRedirectUrl={dest}
    />
  );
}

export default function Page() {
  return (
    <main className="grid place-items-center px-4 py-10">
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  );
}
