"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { firstName, Portrait } from "@/components/site/TutorCard";
import ReportButton from "@/components/site/ReportButton";
import { useRequireUser } from "@/components/site/useRequireUser";
import {
  acceptMatch,
  declineMatch,
  exchangeReady,
  fetchMatch,
  fetchMessages,
  fetchReviewForMatch,
  fetchTutor,
  fetchUserMatches,
  isMatchUnread,
  markMatchRead,
  sendText,
  startConversation,
  submitReview,
  subscribeIncomingMessages,
  subscribeMessages,
  type ChatMessage,
  type Match,
  type Review,
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
  const [rows, setRows] = useState<Match[]>([]);
  const [myTutorProfileId, setMyTutorProfileId] = useState<string | null>(null);
  const [listError, setListError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let cancel = false;
    const load = () => {
      fetchUserMatches(userId)
        .then(({ matches, myTutorProfileId: ownId }) => {
          if (cancel) return;
          setRows(matches);
          setMyTutorProfileId(ownId);
        })
        .catch((err: Error) => {
          if (!cancel) setListError(err.message);
        });
    };
    load();
    const unsubscribe = subscribeIncomingMessages(load);
    return () => {
      cancel = true;
      unsubscribe();
    };
  }, [userId, matchId]);

  const handleRead = useCallback((id: string, asTutor: boolean) => {
    const now = new Date().toISOString();
    setRows((current) =>
      current.map((item) =>
        item.id === id
          ? asTutor
            ? { ...item, tutorLastReadAt: now }
            : { ...item, parentLastReadAt: now }
          : item
      )
    );
  }, []);

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

  const open = Boolean(matchId || tutorId);
  const hasBothSides = Boolean(
    myTutorProfileId &&
      rows.some((match) => match.tutorId === myTutorProfileId) &&
      rows.some((match) => match.tutorId !== myTutorProfileId)
  );

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-6xl flex-col overflow-hidden md:h-[calc(100dvh-5.5rem)]">
      <div className="px-5 pt-4 pb-3">
        <Link href="/" className="text-sm font-semibold text-black/55">
          ← Tous les professeurs
        </Link>
      </div>
      <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[320px_1fr]">
        <aside className={`overflow-y-auto border-black/5 bg-white md:border-r ${open ? "hidden md:block" : "block"}`}>
          <div className="px-5 pt-5 pb-4 md:pt-6">
            <h1 className="font-display text-2xl font-bold">Messages</h1>
            <p className="mt-1 text-xs text-black/45">Une discussion apparaît après un premier message.</p>
          </div>
          {listError ? <p className="px-5 text-sm text-[#c23b3b]">{listError}</p> : null}
          {rows.map((match) => {
            const asTutor = Boolean(myTutorProfileId && match.tutorId === myTutorProfileId);
            const label = asTutor
              ? match.parentName || "Élève"
              : firstName(match.tutor?.name || "Discussion");
            const active = match.id === matchId;
            const unread = Boolean(userId && !active && isMatchUnread(match, userId, myTutorProfileId));
            return (
              <Link
                key={match.id}
                href={`/messages/${match.id}`}
                className={`block border-t border-black/5 px-5 py-4 ${active ? "bg-[#f3fbf8]" : "hover:bg-black/[0.02]"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {unread ? (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-[#0d9f7a]"
                        aria-label="Non lu"
                      />
                    ) : null}
                    <p className="truncate font-extrabold">{label}</p>
                  </div>
                  {hasBothSides ? (
                    <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-bold text-black/55">
                      {asTutor ? "Élève" : "Prof"}
                    </span>
                  ) : null}
                </div>
                <p
                  className={`mt-1 truncate text-sm ${
                    unread ? "font-semibold text-black/80" : "text-black/50"
                  }`}
                >
                  {match.status === "pending"
                    ? "Demande en attente"
                    : match.lastMessageContent || "Conversation ouverte"}
                </p>
              </Link>
            );
          })}
          {!rows.length && !listError ? (
            <p className="px-5 py-6 text-sm text-black/50">Aucune discussion pour le moment.</p>
          ) : null}
        </aside>

        <section className={`min-h-0 flex-col bg-[#f6f7f8] ${open ? "flex" : "hidden md:flex"}`}>
          {open && userId ? (
            <ThreadView
              key={matchId ? `match-${matchId}` : `tutor-${tutorId}`}
              userId={userId}
              matchId={matchId}
              tutorId={tutorId}
              initialDraft={initialDraft}
              myTutorProfileId={myTutorProfileId}
              onStatusChange={(id, nextStatus) =>
                setRows((current) =>
                  nextStatus === "declined"
                    ? current.filter((item) => item.id !== id)
                    : current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
                )
              }
              onRead={handleRead}
            />
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

function ThreadView({
  userId,
  matchId,
  tutorId,
  initialDraft,
  myTutorProfileId,
  onStatusChange,
  onRead,
}: {
  userId: string;
  matchId?: string;
  tutorId?: string;
  initialDraft: string;
  myTutorProfileId: string | null;
  onStatusChange: (id: string, status: string) => void;
  onRead: (id: string, asTutor: boolean) => void;
}) {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState(initialDraft);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  const activeMatch = matchId || "";
  const isOwnTutorTarget = Boolean(!activeMatch && tutor && tutor.clerkId === userId);
  const isTutorInThread = Boolean(
    match &&
      ((myTutorProfileId && match.tutorId === myTutorProfileId) ||
        (match.tutor?.clerkId === userId && match.parentId !== userId))
  );
  const isTutorRef = useRef(isTutorInThread);
  useEffect(() => {
    isTutorRef.current = isTutorInThread;
  }, [isTutorInThread]);
  const tutorCanWrite = !isOwnTutorTarget && (!isTutorInThread || !activeMatch || status === "accepted");
  const hasExchange = exchangeReady(messages);
  const activeReview = activeMatch && review?.matchId === activeMatch ? review : null;
  const canReview = Boolean(!isTutorInThread && activeMatch && tutor && hasExchange && !activeReview);

  useEffect(() => {
    let cancel = false;
    if (tutorId) {
      fetchTutor(tutorId)
        .then((profile) => {
          if (!cancel) setTutor(profile);
        })
        .catch((err: Error) => {
          if (!cancel) setError(err.message);
        });
    }
    if (matchId) {
      fetchMatch(matchId)
        .then((row) => {
          if (cancel || !row) return;
          setMatch(row);
          setStatus(row.status);
          if (row.tutor) setTutor(row.tutor);
          const asTutor = Boolean(
            (myTutorProfileId && row.tutorId === myTutorProfileId) ||
              (row.tutor?.clerkId === userId && row.parentId !== userId)
          );
          void markMatchRead(row.id, asTutor).then(() => onRead(row.id, asTutor));
        })
        .catch((err: Error) => {
          if (!cancel) setError(err.message);
        });
    }
    return () => {
      cancel = true;
    };
    // onRead only updates sidebar state cleanly; matchId/tutorId drive thread loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId, matchId, userId, myTutorProfileId]);

  useEffect(() => {
    if (!activeMatch) return;
    let cancel = false;
    fetchMessages(activeMatch)
      .then((rows) => {
        if (!cancel) setMessages(rows);
      })
      .catch((err: Error) => {
        if (!cancel) setError(err.message);
      });
    const unsubscribe = subscribeMessages(activeMatch, (incoming) => {
      setMessages((prev) => {
        const index = prev.findIndex((item) => item.id === incoming.id);
        if (index === -1) return [...prev, incoming];
        const next = [...prev];
        next[index] = incoming;
        return next;
      });
      if (incoming.senderId !== userId) {
        const asTutor = isTutorRef.current;
        void markMatchRead(activeMatch, asTutor).then(() => onRead(activeMatch, asTutor));
      }
    });
    return () => {
      cancel = true;
      unsubscribe();
    };
  }, [activeMatch, userId, onRead]);

  useEffect(() => {
    if (!activeMatch) return;
    let cancel = false;
    fetchReviewForMatch(activeMatch)
      .then((row) => {
        if (!cancel) setReview(row);
      })
      .catch(() => {
        if (!cancel) setReview(null);
      });
    return () => {
      cancel = true;
    };
  }, [activeMatch]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (!reviewOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReviewOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [reviewOpen]);

  async function onSubmitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!activeMatch || !tutor || reviewBusy) return;
    setReviewBusy(true);
    setError("");
    try {
      await submitReview({
        matchId: activeMatch,
        reviewerId: userId,
        tutorId: tutor.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      const saved = await fetchReviewForMatch(activeMatch);
      setReview(saved);
      setReviewComment("");
      setReviewOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avis impossible.");
    } finally {
      setReviewBusy(false);
    }
  }

  async function onSend() {
    if (!draft.trim() || !tutorCanWrite || sending) return;
    setSending(true);
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
        senderRole: isTutorInThread ? "tutor" : "parent",
        content: draft.trim(),
      });
      if (created) {
        setMessages((prev) =>
          prev.some((item) => item.id === created.id) ? prev : [...prev, created]
        );
      }
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSending(false);
    }
  }

  const title = isTutorInThread
    ? match?.parentName || "Élève"
    : tutor
      ? firstName(tutor.name)
      : "Conversation";

  return (
    <>
      <div className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3">
        <Link href="/messages" className="text-sm font-semibold text-black/50 md:hidden">
          ←
        </Link>
        {tutor && !isTutorInThread ? (
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
        {activeMatch ? (
          <div className="ml-auto">
            <ReportButton
              userId={userId}
              signedIn
              targetType="conversation"
              targetId={activeMatch}
            />
          </div>
        ) : null}
      </div>

      {isTutorInThread && status === "pending" && activeMatch ? (
        <div className="border-b border-black/5 bg-[#f3fbf8] px-4 py-3 text-sm">
          <p className="font-extrabold">Nouvelle demande</p>
          <p className="mt-1 text-black/65">
            Accepte pour pouvoir répondre. Si tu déclines, la conversation est archivée.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-full bg-[#0d9f7a] px-4 py-2 text-sm font-extrabold text-white"
              onClick={() =>
                acceptMatch(activeMatch)
                  .then(() => {
                    setStatus("accepted");
                    onStatusChange(activeMatch, "accepted");
                  })
                  .catch((err: Error) => setError(err.message))
              }
            >
              Accepter
            </button>
            <button
              type="button"
              className="rounded-full bg-white px-4 py-2 text-sm font-extrabold"
              onClick={() =>
                declineMatch(activeMatch)
                  .then(() => {
                    onStatusChange(activeMatch, "declined");
                    router.push("/messages");
                  })
                  .catch((err: Error) => setError(err.message))
              }
            >
              Décliner
            </button>
          </div>
        </div>
      ) : null}

      {!isTutorInThread && status === "pending" && activeMatch ? (
        <p className="border-b border-black/5 bg-white px-4 py-3 text-sm text-black/60">
          En attente de la réponse du professeur. Tu peux encore écrire.
        </p>
      ) : null}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isOwnTutorTarget ? (
          <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/75">
            <p className="font-semibold">
              C’est ton propre profil : tu ne peux pas contacter ton propre profil ni t’envoyer un message.
            </p>
            <Link
              href="/annonce"
              className="mt-3 inline-block rounded-full bg-[#12382c] px-4 py-2 text-xs font-extrabold text-white"
            >
              Modifier mon annonce
            </Link>
          </div>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
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
        <div ref={listEndRef} />
      </div>

      {error ? <p className="px-4 text-sm text-[#c23b3b]">{error}</p> : null}
      {activeMatch && (canReview || activeReview) ? (
        <div className="border-t border-black/5 bg-white px-4 py-3">
          {!isTutorInThread && tutor ? (
            <div>
              {activeReview ? (
                <p className="text-sm leading-6 text-black/70">
                  <span className="text-[#e6b800]">{"★".repeat(activeReview.rating)}</span>{" "}
                  {activeReview.comment || "Avis envoyé."}
                  {activeReview.reply ? (
                    <span className="mt-1 block text-black/55">
                      {firstName(tutor.name)} répond : {activeReview.reply}
                    </span>
                  ) : null}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setReviewRating(5);
                    setReviewComment("");
                    setReviewOpen(true);
                  }}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm font-extrabold text-[#12382c]"
                >
                  Laisser un avis
                </button>
              )}
            </div>
          ) : null}
          {isTutorInThread && activeReview ? (
            <p className="text-sm leading-6 text-black/70">
              Avis reçu : <span className="text-[#e6b800]">{"★".repeat(activeReview.rating)}</span>{" "}
              {activeReview.comment || "Sans commentaire."}
            </p>
          ) : null}
        </div>
      ) : null}

      {reviewOpen && canReview ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setReviewOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="review-modal-title" className="font-display text-xl font-bold">
              Comment s’est passé cet échange ?
            </h2>
            <p className="mt-1 text-sm text-black/55">
              Ton avis apparaît sur la fiche du professeur.
            </p>
            <form className="mt-4 space-y-3" onSubmit={onSubmitReview}>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl ${star <= reviewRating ? "text-[#e6b800]" : "text-black/20"}`}
                    aria-label={`${star} étoiles`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Commentaire (optionnel)"
                rows={3}
                className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#0d9f7a]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={reviewBusy}
                  className="rounded-full bg-[#12382c] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
                >
                  {reviewBusy ? "Envoi…" : "Envoyer mon avis"}
                </button>
                <button
                  type="button"
                  onClick={() => setReviewOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-black/55"
                >
                  Plus tard
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2 p-4">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSend();
            }
          }}
          rows={2}
          disabled={!tutorCanWrite || sending}
          placeholder={
            tutorCanWrite ? "Écrire un message…" : "Accepte la demande pour répondre."
          }
          className="min-h-12 flex-1 resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d9f7a] disabled:bg-black/5"
        />
        <button
          type="button"
          onClick={() => void onSend()}
          disabled={!tutorCanWrite || !draft.trim() || sending}
          className="rounded-full bg-[#0d9f7a] px-5 text-sm font-extrabold text-white disabled:opacity-40"
        >
          {sending ? "…" : "Envoyer"}
        </button>
      </div>
    </>
  );
}
