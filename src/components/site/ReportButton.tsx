"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReport } from "@/lib/db";
import { REPORT_REASONS } from "@/lib/trust";

export default function ReportButton({
  userId,
  signedIn = false,
  targetType,
  targetId,
  label = "Signaler",
}: {
  userId?: string | null;
  signedIn?: boolean;
  targetType: "profile" | "conversation";
  targetId: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function send(reason: string) {
    if (!signedIn || !userId) {
      const next = targetType === "profile" ? `/tuteur/${targetId}` : `/messages/${targetId}`;
      router.push(`/connexion?next=${encodeURIComponent(next)}`);
      return;
    }
    setError("");
    try {
      await submitReport({ reporterId: userId, targetType, targetId, reason });
      setDone(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signalement impossible.");
    }
  }

  if (done) {
    return <p className="text-sm font-semibold text-[#087a5c]">Signalement envoyé.</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-sm font-semibold text-black/45"
      >
        {label}
      </button>
      {open ? (
        <div className="mt-2 rounded-2xl bg-[#f6f7f8] p-2">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => send(reason)}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-white"
            >
              {reason}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-1 text-sm text-[#c23b3b]">{error}</p> : null}
    </div>
  );
}
