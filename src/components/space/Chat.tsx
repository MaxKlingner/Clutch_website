"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  acceptMatch,
  declineMatch,
  fetchMessages,
  fetchTutor,
  getUserRole,
  payRequest,
  sendPaymentRequest,
  sendText,
  startConversation,
  subscribeMessages,
  type ChatMessage,
  type Role,
  type Tutor,
} from "@/lib/db";

export default function Chat({
  matchId,
  tutorId,
  initialDraft,
}: {
  matchId?: string;
  tutorId?: string;
  initialDraft?: string;
}) {
  const { userId } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [activeMatch, setActiveMatch] = useState(matchId || "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState(initialDraft || "");
  const [hours, setHours] = useState(2);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    if (!userId) return;
    getUserRole(userId).then(setRole);
    if (tutorId) fetchTutor(tutorId).then(setTutor).catch((err: Error) => setError(err.message));
  }, [userId, tutorId]);

  useEffect(() => {
    if (!activeMatch) return;
    fetchMessages(activeMatch)
      .then(setMessages)
      .catch((err: Error) => setError(err.message));
    return subscribeMessages(activeMatch, (incoming) => {
      setMessages((prev) => {
        const index = prev.findIndex((item) => item.id === incoming.id);
        if (index === -1) return [...prev, incoming];
        const next = [...prev];
        next[index] = incoming;
        return next;
      });
    });
  }, [activeMatch]);

  async function onSend() {
    if (!userId || !draft.trim()) return;
    setError("");
    try {
      if (!activeMatch) {
        if (!tutorId) return;
        const created = await startConversation({
          parentId: userId,
          tutorId,
          content: draft.trim(),
        });
        setActiveMatch(created.match.id);
        setMessages(created.message ? [created.message] : []);
        setDraft("");
        router.replace(`/espace/messages/${created.match.id}`);
        return;
      }
      const created = await sendText({
        matchId: activeMatch,
        senderId: userId,
        senderRole: role === "tutor" ? "tutor" : "parent",
        content: draft.trim(),
      });
      if (created) setMessages((prev) => [...prev, created]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col">
      <Link href="/espace/messages" className="text-sm text-white/60">
        ← Messages
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">
        {tutor?.name || "Conversation"}
      </h1>
      {role === "tutor" && status === "pending" && activeMatch ? (
        <div className="mt-4 flex gap-2">
          <button
            className="rounded-xl bg-[#1B6B45] px-4 py-2 text-sm font-extrabold"
            onClick={() => acceptMatch(activeMatch).then(() => setStatus("accepted"))}
          >
            Accepter
          </button>
          <button
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-extrabold"
            onClick={() => declineMatch(activeMatch).then(() => router.push("/espace/messages"))}
          >
            Décliner
          </button>
        </div>
      ) : null}
      <div className="mt-4 flex-1 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              message.senderId === userId ? "ml-auto bg-[#1B6B45]" : "bg-[#2C2C2E]"
            }`}
          >
            <p>{message.content}</p>
            {message.messageType === "payment_request" &&
            message.paymentStatus === "pending" &&
            role !== "tutor" ? (
              <button
                className="mt-2 text-xs font-extrabold underline"
                onClick={() => {
                  if (!userId || !tutor?.clerkId) return;
                  payRequest(message.id, userId, tutor.clerkId).catch((err: Error) =>
                    setError(err.message)
                  );
                }}
              >
                Payer
              </button>
            ) : null}
          </div>
        ))}
        {!messages.length ? (
          <p className="text-sm text-white/50">Envoie un premier message pour démarrer.</p>
        ) : null}
      </div>
      {role === "tutor" && activeMatch ? (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="number"
            min={1}
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
            className="w-16 rounded-xl bg-[#1C1C1E] px-3 py-2"
          />
          <button
            className="rounded-xl bg-white/10 px-3 py-2 font-semibold"
            onClick={() =>
              sendPaymentRequest({
                matchId: activeMatch,
                senderId: userId || "",
                hours,
                hourlyRate: tutor?.hourlyRate || 25,
              }).catch((err: Error) => setError(err.message))
            }
          >
            Demander le paiement
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-[#FF8A80]">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={2}
          placeholder="Écrire un message…"
          className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-[#1C1C1E] px-4 py-3 text-sm outline-none"
        />
        <button onClick={onSend} className="rounded-2xl bg-[#1B6B45] px-4 text-sm font-extrabold">
          Envoyer
        </button>
      </div>
    </div>
  );
}
