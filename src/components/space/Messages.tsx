"use client";

import Link from "next/link";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { fetchParentMatches, fetchTutorMatches, getUserRole, type Match } from "@/lib/db";

export default function Messages() {
  const { userId } = useAuth();
  const [rows, setRows] = useState<Match[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    getUserRole(userId)
      .then((role) =>
        role === "tutor" ? fetchTutorMatches(userId) : fetchParentMatches(userId)
      )
      .then(setRows)
      .catch((err: Error) => setError(err.message));
  }, [userId]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Messages</h1>
      <p className="mt-2 text-sm text-white/55">
        Une discussion n’apparaît qu’après un vrai message.
      </p>
      {error ? <p className="mt-4 text-sm text-[#FF8A80]">{error}</p> : null}
      <div className="mt-6 space-y-3">
        {rows.map((match) => (
          <Link
            key={match.id}
            href={`/espace/messages/${match.id}`}
            className="block rounded-2xl border border-white/10 bg-[#1A1A1C] px-4 py-4"
          >
            <p className="font-extrabold">{match.tutor?.name || "Discussion"}</p>
            <p className="text-sm text-white/55">
              {match.status === "pending" ? "Demande en attente" : "Conversation ouverte"}
            </p>
          </Link>
        ))}
        {!rows.length && !error ? (
          <p className="text-white/55">Aucune discussion pour le moment.</p>
        ) : null}
      </div>
    </div>
  );
}
