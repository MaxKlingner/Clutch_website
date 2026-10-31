"use client";

import { SignUp } from "@clerk/clerk-react";

export default function Page() {
  return (
    <main className="grid place-items-center px-4 py-10">
      <SignUp
        routing="hash"
        signInUrl="/connexion"
        forceRedirectUrl="/bienvenue"
        fallbackRedirectUrl="/bienvenue"
        appearance={{ variables: { colorPrimary: "#0d9f7a" } }}
      />
    </main>
  );
}
