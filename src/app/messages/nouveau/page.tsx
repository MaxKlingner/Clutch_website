"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Inbox from "@/components/site/Inbox";

function NewThread() {
  const params = useSearchParams();
  return (
    <Inbox
      tutorId={params.get("tutor") || undefined}
      initialDraft={params.get("draft") || ""}
    />
  );
}

export default function Page() {
  return (
    <Suspense>
      <NewThread />
    </Suspense>
  );
}
