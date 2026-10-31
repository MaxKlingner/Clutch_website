"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { firstName, Portrait } from "@/components/site/TutorCard";
import { useRequireUser } from "@/components/site/useRequireUser";
import {
  acceptMatch,
  declineMatch,
  fetchMatch,
  fetchMessages,
  fetchParentMatches,
  fetchTutor,
  fetchTutorMatches,
  getUserRole,
  sendText,
  startConversation,
  subscribeMessages,
  type ChatMessage,
  type Match,
  type Role,
  type Tutor,
} from "@/lib/db";

export default function Inbox({
  matchId,
  tutorId,
  initialDraft = "",
}: {
  matchId?: string;
  tutorId?: string;
  initialDraft?: string;
}) {
  const ready = useRequireUser();
  const { userId } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [roleReady, setRoleReady] = useState(false);
  const [rows, setRows] = useState<Match[]>([]);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [activeMatch, setActiveMatch] = useState(matchId || "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  const open = Boolean(matchId || tutorId);
  const isTutor = role === "tutor";
  const tutorCanWrite = !isTutor || !activeMatch || status === "accepted";

  useEffect(() => {
    if (!userId) return;
    getUserRole(userId)
      .then(setRole)
      .catch(() => setRole(null))
      .finally(() => setRoleReady(true));
  }, [userId]);

  useEffect(() => {
    if (!userId || !roleReady) return;
    const load = role === "tutor" ? fetchTutorMatches(userId) : fetchParentMatches(userId);
    load.then(setRows).catch((err: Error) => setListError(err.message));
  }, [userId, role, roleReady]);

  useEffect(() => {
    if (!userId) return;
    if (tutorId) {
      fetchTutor(tutorId).then(setTutor).catch((err: Error) => setError(err.message));
    }
    if (!matchId) return;
    fetchMatch(matchId)
      .then((match) => {
        if (!match) return;
        setStatus(match.status);
        if (match.tutor) setTutor(match.tutor);
      })
      .catch((err: Error) => setError(err.message));
  }, [userId, tutorId, matchId]);

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
    if (!userId || !draft.trim() || !tutorCanWrite) return;
    setError("");
    try {
      if (!activeMatch) {
        if (!tutorId) return;
        const created = await startConversation({
          parentId: userId,
          tutorId,
          content: draft.trim(),
        });
        setDraft("");
        router.replace(`/messages/${created.match.id}`);
        return;
      }
      const created = await sendText({
        matchId: activeMatch,
        senderId: userId,
        senderRole: isTutor ? "tutor" : "parent",
        content: draft.trim(),
      });
      if (created) setMessages((prev) => [...prev, created]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8">
        <Link href="/" className="text-sm font-semibold text-black/55">
          ← Tous les professeurs
        </Link>
        <p className="grid min-h-[40vh] place-items-center text-black/50">Chargement…</p>
      </div>
    );
  }

  const title = isTutor ? "Parent" : tutor ? firstName(tutor.name) : "Conversation";

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-6xl flex-col overflow-hidden md:h-[calc(100dvh-5.5rem)]">
      <div className="px-5 pt-4">
        <Link href="/" className="text-sm font-semibold text-black/55">
          ← Tous les professeurs
        </Link>
      </div>
      <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[320px_1fr]">
      <aside className={`overflow-y-auto border-black/5 bg-white md:border-r ${open ? "hidden md:block" : "block"}`}>
        <div className="px-5 py-4">
          <h1 className="font-display text-2xl font-bold">Messages</h1>
          <p className="mt-1 text-xs text-black/45">Une discussion apparaît après un vrai message.</p>
        </div>
        {listError ? <p className="px-5 text-sm text-[#c23b3b]">{listError}</p> : null}
        {rows.map((match) => {
          const label = isTutor ? "Parent" : firstName(match.tutor?.name || "Discussion");
          const active = match.id === matchId;
          return (
            <Link
              key={match.id}
              href={`/messages/${match.id}`}
              className={`block border-t border-black/5 px-5 py-4 ${active ? "bg-[#f3fbf8]" : "hover:bg-black/[0.02]"}`}
            >
              <p className="font-extrabold">{label}</p>
              <p className="mt-1 text-sm text-black/50">
                {match.status === "pending" ? "Demande en attente" : "Conversation ouverte"}
              </p>
            </Link>
          );
        })}
        {!rows.length && !listError ? (
          <p className="px-5 py-6 text-sm text-black/50">Aucune discussion pour le moment.</p>
        ) : null}
      </aside>

      <section className={`min-h-0 flex-col bg-[#f6f7f8] ${open ? "flex" : "hidden md:flex"}`}>
        {open ? (
          <>
            <div className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3">
              <Link href="/messages" className="text-sm font-semibold text-black/50 md:hidden">
                ←
              </Link>
              {tutor && !isTutor ? (
                <Link href={`/tuteur/${tutor.id}`} className="flex min-w-0 items-center gap-3">
                  <Portrait
                    name={tutor.name}
                    url={tutor.avatarUrl}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="truncate font-extrabold">{title}</span>
                </Link>
              ) : (
                <p className="font-extrabold">{title}</p>
              )}
            </div>

            {isTutor && status === "pending" && activeMatch ? (
              <div className="border-b border-black/5 bg-[#f3fbf8] px-4 py-3 text-sm">
                <p className="font-extrabold">Nouvelle demande</p>
                <p className="mt-1 text-black/65">
                  Accepte pour pouvoir répondre. Si tu déclines, la conversation est archivée.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-[#0d9f7a] px-4 py-2 text-sm font-extrabold text-white"
                    onClick={() => acceptMatch(activeMatch).then(() => setStatus("accepted"))}
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-white px-4 py-2 text-sm font-extrabold"
                    onClick={() => declineMatch(activeMatch).then(() => router.push("/messages"))}
                  >
                    Décliner
                  </button>
                </div>
              </div>
            ) : null}

            {!isTutor && status === "pending" && activeMatch ? (
              <p className="border-b border-black/5 bg-white px-4 py-3 text-sm text-black/60">
                En attente de la réponse du professeur. Tu peux encore écrire.
              </p>
            ) : null}

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.senderId === userId
                      ? "ml-auto bg-[#0d9f7a] text-white"
                      : "bg-white text-[#1c1c1c]"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {!messages.length ? (
                <p className="text-sm text-black/45">Envoie un premier message pour démarrer.</p>
              ) : null}
            </div>

            {error ? <p className="px-4 text-sm text-[#c23b3b]">{error}</p> : null}
            <div className="flex gap-2 p-4">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                disabled={!tutorCanWrite}
                placeholder={
                  tutorCanWrite ? "Écrire un message…" : "Accepte la demande pour répondre."
                }
                className="min-h-12 flex-1 resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d9f7a] disabled:bg-black/5"
              />
              <button
                type="button"
                onClick={onSend}
                disabled={!tutorCanWrite || !draft.trim()}
                className="rounded-full bg-[#0d9f7a] px-5 text-sm font-extrabold text-white disabled:opacity-40"
              >
                Envoyer
              </button>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center px-6 text-center text-black/45">
            Choisis une discussion, ou écris depuis le profil d’un professeur.
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
