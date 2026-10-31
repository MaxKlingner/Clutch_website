import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const ROLES = { PARENT: "parent", TUTOR: "tutor" } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const SPECIALTIES = [
  "Mathématiques",
  "Français",
  "Sciences",
  "Anglais",
  "Informatique",
  "Économie",
];

export const LEVELS = [
  "Primaire",
  "Secondaire",
  "Supérieur",
];

export const FORMATS = ["Face à face", "À distance"] as const;

const PROFILE_COLUMNS =
  "id, clerk_id, full_name, subject, hourly_rate, rating, review_count, lessons_given, role, bio, about_tutor, about_course, specialties, study_year, avatar_url, city, postal_code, latitude, longitude, teaching_formats, taught_levels, created_at";

export type Tutor = {
  id: string;
  clerkId: string | null;
  name: string;
  subject: string;
  specialties: string[];
  bio: string;
  aboutTutor: string;
  aboutCourse: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  lessonsGiven: number;
  avatarUrl: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  teachingFormats: string[];
  taughtLevels: string[];
};

export type Match = {
  id: string;
  parentId: string;
  tutorId: string;
  status: string;
  createdAt: string;
  tutor: Tutor | null;
  parentName: string;
};

export type ChatMessage = {
  id: string;
  matchId: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
  messageType: string;
  hours: number | null;
  amount: number | null;
  hourlyRate: number | null;
  paymentStatus: string | null;
};

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error("Supabase n’est pas configuré.");
  }
  client = createClient(url, key);
  return client;
}

export function announcementPublished(tutor: Pick<Tutor, "specialties"> | null) {
  return Boolean(
    tutor?.specialties.some((item) => {
      const name = item.trim().toLowerCase();
      return name && name !== "matière";
    })
  );
}

function published(tutor: Tutor) {
  return announcementPublished(tutor);
}

function mapTutor(row: Record<string, unknown> | null): Tutor | null {
  if (!row) return null;
  const specialties = Array.isArray(row.specialties)
    ? row.specialties.map(String).filter(Boolean)
    : [];
  const hourlyRate = Number(row.hourly_rate ?? 0);
  const rating = Number(row.rating ?? 0);
  const reviewCount = Number(row.review_count ?? 0);
  const lessonsGiven = Number(row.lessons_given ?? 0);
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);
  return {
    id: String(row.id),
    clerkId: row.clerk_id ? String(row.clerk_id) : null,
    name: String(row.full_name ?? row.name ?? "Tuteur"),
    subject: specialties.length
      ? specialties.join(", ")
      : String(row.subject ?? "Matière"),
    specialties,
    bio: row.bio != null ? String(row.bio) : "",
    aboutTutor: row.about_tutor != null ? String(row.about_tutor) : "",
    aboutCourse: row.about_course != null ? String(row.about_course) : "",
    hourlyRate: Number.isFinite(hourlyRate) ? hourlyRate : 0,
    rating: Number.isFinite(rating) ? rating : 0,
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
    lessonsGiven: Number.isFinite(lessonsGiven) ? Math.max(0, Math.round(lessonsGiven)) : 0,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    city: row.city ? String(row.city) : null,
    postalCode: row.postal_code ? String(row.postal_code) : null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    teachingFormats: Array.isArray(row.teaching_formats)
      ? row.teaching_formats.map(String)
      : [],
    taughtLevels: Array.isArray(row.taught_levels) ? row.taught_levels.map(String) : [],
  };
}

function mapMessage(row: Record<string, unknown> | null): ChatMessage | null {
  if (!row) return null;
  return {
    id: String(row.id),
    matchId: String(row.match_id),
    senderId: String(row.sender_id),
    senderRole: String(row.sender_role ?? "parent"),
    content: String(row.content ?? ""),
    createdAt: String(row.created_at ?? ""),
    messageType: String(row.message_type || "text"),
    hours: row.hours != null ? Number(row.hours) : null,
    amount: row.amount != null ? Number(row.amount) : null,
    hourlyRate: row.hourly_rate != null ? Number(row.hourly_rate) : null,
    paymentStatus: row.payment_status ? String(row.payment_status) : null,
  };
}

function mapMatch(row: Record<string, unknown>): Match {
  const tutor = mapTutor((row.tutor as Record<string, unknown>) ?? null);
  return {
    id: String(row.id),
    parentId: String(row.parent_id),
    tutorId: String(row.tutor_id),
    status: String(row.status ?? "pending"),
    createdAt: String(row.created_at ?? ""),
    tutor,
    parentName: "Parent",
  };
}

export async function fetchTutors(excludeClerkId?: string | null) {
  const db = getSupabase();
  const { data, error } = await db
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("role", "tutor")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => mapTutor(row))
    .filter((tutor): tutor is Tutor => Boolean(tutor))
    .filter((tutor) => tutor.clerkId !== excludeClerkId)
    .filter(published);
}

export async function fetchTutor(id: string) {
  const db = getSupabase();
  const { data, error } = await db.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return mapTutor(data);
}

export async function fetchMyTutorProfile(clerkId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("clerk_id", clerkId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return mapTutor(data);
}

export async function fetchReviews(tutorId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("tutor_id", tutorId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    rating: Number(row.rating) || 0,
    comment: row.comment ? String(row.comment) : "",
    createdAt: String(row.created_at),
  }));
}

const roleKey = (clerkId: string) => `clutch_user_role_${clerkId}`;

export async function getUserRole(clerkId: string): Promise<Role | null> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(roleKey(clerkId));
    if (cached === ROLES.PARENT || cached === ROLES.TUTOR) return cached;
  }
  const db = getSupabase();
  const { data, error } = await db
    .from("user_profiles")
    .select("role, active_role")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const side = data?.active_role || data?.role;
  if (side === ROLES.PARENT || side === ROLES.TUTOR) {
    localStorage.setItem(roleKey(clerkId), side);
    return side;
  }
  return null;
}

export async function setActiveRole(clerkId: string, role: Role, fullName?: string | null) {
  const db = getSupabase();
  const now = new Date().toISOString();
  const { data: existing } = await db
    .from("user_profiles")
    .select("clerk_id, role, active_role, visited_parent_at, visited_tutor_at")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  const visit =
    role === ROLES.PARENT && !existing?.visited_parent_at
      ? { visited_parent_at: now }
      : role === ROLES.TUTOR && !existing?.visited_tutor_at
        ? { visited_tutor_at: now }
        : {};
  if (!existing) {
    const { error } = await db.from("user_profiles").insert({
      clerk_id: clerkId,
      role,
      active_role: role,
      full_name: fullName || null,
      updated_at: now,
      ...visit,
    });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db
      .from("user_profiles")
      .update({
        active_role: role,
        role: existing.role || role,
        full_name: fullName || undefined,
        updated_at: now,
        ...visit,
      })
      .eq("clerk_id", clerkId);
    if (error) throw new Error(error.message);
  }
  localStorage.setItem(roleKey(clerkId), role);
  window.dispatchEvent(new Event("clutch-role"));
}

export type AccountIdentity = {
  firstName: string;
  lastName: string;
  city: string;
  postalCode: string;
};

export async function fetchAccountIdentity(clerkId: string): Promise<AccountIdentity | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from("user_profiles")
    .select("first_name, last_name, full_name, city, postal_code")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  let firstName = String(data.first_name || "").trim();
  let lastName = String(data.last_name || "").trim();
  if (!firstName && !lastName && data.full_name) {
    const parts = String(data.full_name).trim().split(/\s+/).filter(Boolean);
    firstName = parts.shift() || "";
    lastName = parts.join(" ");
  }
  return {
    firstName,
    lastName,
    city: data.city ? String(data.city).trim() : "",
    postalCode: data.postal_code ? String(data.postal_code).trim() : "",
  };
}

export async function saveAccountIdentity(input: {
  clerkId: string;
  firstName: string;
  lastName: string;
}) {
  const db = getSupabase();
  const given = input.firstName.trim();
  const family = input.lastName.trim();
  const fullName = [given, family].filter(Boolean).join(" ") || null;
  const { error } = await db
    .from("user_profiles")
    .update({
      first_name: given || null,
      last_name: family || null,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_id", input.clerkId);
  if (error) throw new Error(error.message);
  const tutor = await fetchMyTutorProfile(input.clerkId);
  if (!tutor || !fullName) return;
  const { error: profileError } = await db
    .from("profiles")
    .update({ full_name: fullName })
    .eq("clerk_id", input.clerkId);
  if (profileError) throw new Error(profileError.message);
}

export async function setAccountAvatar(clerkId: string, avatarUrl: string | null) {
  const tutor = await fetchMyTutorProfile(clerkId);
  if (!tutor) return;
  const db = getSupabase();
  const { error } = await db
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("clerk_id", clerkId);
  if (error) throw new Error(error.message);
}

export async function saveSignupProfile(input: {
  clerkId: string;
  role: Role;
  firstName: string;
  lastName: string;
  city?: string;
}) {
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();
  await setActiveRole(input.clerkId, input.role, fullName);
  const db = getSupabase();
  const { error } = await db
    .from("user_profiles")
    .update({
      first_name: input.firstName || null,
      last_name: input.lastName || null,
      city: input.city || null,
      full_name: fullName || null,
    })
    .eq("clerk_id", input.clerkId);
  if (error) throw new Error(error.message);
}

export async function fetchFavoriteIds(userId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("favorite_tutors")
    .select("tutor_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => String(row.tutor_id)));
}

export async function fetchFavorites(userId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("favorite_tutors")
    .select(`id, tutor_id, tutor:profiles (${PROFILE_COLUMNS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => mapTutor(row.tutor as unknown as Record<string, unknown>))
    .filter((tutor): tutor is Tutor => Boolean(tutor));
}

export async function toggleFavorite(userId: string, tutorId: string, on: boolean) {
  const db = getSupabase();
  if (on) {
    const { error } = await db
      .from("favorite_tutors")
      .upsert({ user_id: userId, tutor_id: tutorId }, { onConflict: "user_id,tutor_id" });
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await db
    .from("favorite_tutors")
    .delete()
    .eq("user_id", userId)
    .eq("tutor_id", tutorId);
  if (error) throw new Error(error.message);
}

async function matchesWithMessages(rows: Record<string, unknown>[]) {
  if (!rows.length) return [];
  const db = getSupabase();
  const { data, error } = await db
    .from("messages")
    .select("match_id")
    .in(
      "match_id",
      rows.map((row) => row.id)
    );
  if (error) throw new Error(error.message);
  const ids = new Set((data ?? []).map((row) => String(row.match_id)));
  return rows.filter((row) => ids.has(String(row.id))).map(mapMatch);
}

export async function fetchParentMatches(parentId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("matches")
    .select(`id, parent_id, tutor_id, status, created_at, tutor:profiles (${PROFILE_COLUMNS})`)
    .eq("parent_id", parentId)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return matchesWithMessages((data ?? []) as Record<string, unknown>[]);
}

export async function fetchTutorMatches(clerkId: string) {
  const profile = await fetchMyTutorProfile(clerkId);
  if (!profile) return [];
  const db = getSupabase();
  const { data, error } = await db
    .from("matches")
    .select(`id, parent_id, tutor_id, status, created_at, tutor:profiles (${PROFILE_COLUMNS})`)
    .eq("tutor_id", profile.id)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return matchesWithMessages((data ?? []) as Record<string, unknown>[]);
}

export async function findTutorMatch(parentId: string, tutorId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("matches")
    .select(`id, parent_id, tutor_id, status, created_at, tutor:profiles (${PROFILE_COLUMNS})`)
    .eq("parent_id", parentId)
    .eq("tutor_id", tutorId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.status === "declined") return null;
  const { count, error: countError } = await db
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("match_id", data.id);
  if (countError) throw new Error(countError.message);
  if (!count) return null;
  return mapMatch(data as Record<string, unknown>);
}

export async function fetchMatch(matchId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("matches")
    .select(`id, parent_id, tutor_id, status, created_at, tutor:profiles (${PROFILE_COLUMNS})`)
    .eq("id", matchId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapMatch(data as Record<string, unknown>) : null;
}

export async function contactedTutorIds(parentId: string) {
  const matches = await fetchParentMatches(parentId);
  return new Set(matches.map((match) => match.tutorId));
}

async function ensureMatch(parentId: string, tutorId: string) {
  const db = getSupabase();
  const { data: existing, error: existingError } = await db
    .from("matches")
    .select(`id, parent_id, tutor_id, status, created_at, tutor:profiles (${PROFILE_COLUMNS})`)
    .eq("parent_id", parentId)
    .eq("tutor_id", tutorId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing && existing.status !== "declined") {
    return mapMatch(existing as Record<string, unknown>);
  }
  if (existing) {
    const { data, error } = await db
      .from("matches")
      .update({ status: "pending" })
      .eq("id", existing.id)
      .select(`id, parent_id, tutor_id, status, created_at, tutor:profiles (${PROFILE_COLUMNS})`)
      .single();
    if (error) throw new Error(error.message);
    return mapMatch(data as Record<string, unknown>);
  }
  const { data, error } = await db
    .from("matches")
    .insert({ parent_id: parentId, tutor_id: tutorId, status: "pending" })
    .select(`id, parent_id, tutor_id, status, created_at, tutor:profiles (${PROFILE_COLUMNS})`)
    .single();
  if (error) throw new Error(error.message);
  return mapMatch(data as Record<string, unknown>);
}

export async function fetchMessages(matchId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("messages")
    .select(
      "id, match_id, sender_id, sender_role, content, created_at, message_type, hours, amount, hourly_rate, payment_status"
    )
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => mapMessage(row))
    .filter((row): row is ChatMessage => Boolean(row));
}

export function subscribeMessages(
  matchId: string,
  onChange: (message: ChatMessage) => void
) {
  const db = getSupabase();
  const channel = db
    .channel(`web-messages-${matchId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
      (payload) => {
        const message = mapMessage(payload.new as Record<string, unknown>);
        if (message) onChange(message);
      }
    )
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
}

export async function sendText(input: {
  matchId: string;
  senderId: string;
  senderRole: "parent" | "tutor";
  content: string;
}) {
  const db = getSupabase();
  const { data, error } = await db
    .from("messages")
    .insert({
      match_id: input.matchId,
      sender_id: input.senderId,
      sender_role: input.senderRole,
      content: input.content.trim(),
      message_type: "text",
    })
    .select(
      "id, match_id, sender_id, sender_role, content, created_at, message_type, hours, amount, hourly_rate, payment_status"
    )
    .single();
  if (error) throw new Error(error.message);
  return mapMessage(data);
}

export async function startConversation(input: {
  parentId: string;
  tutorId: string;
  content: string;
}) {
  const match = await ensureMatch(input.parentId, input.tutorId);
  const message = await sendText({
    matchId: match.id,
    senderId: input.parentId,
    senderRole: "parent",
    content: input.content,
  });
  return { match, message };
}

export async function acceptMatch(matchId: string) {
  const db = getSupabase();
  const { error } = await db.from("matches").update({ status: "accepted" }).eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function declineMatch(matchId: string) {
  const db = getSupabase();
  const { error } = await db.from("matches").update({ status: "declined" }).eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function sendPaymentRequest(input: {
  matchId: string;
  senderId: string;
  hours: number;
  hourlyRate: number;
}) {
  const amount = Math.round(input.hours * input.hourlyRate * 100) / 100;
  const db = getSupabase();
  const { error } = await db.from("messages").insert({
    match_id: input.matchId,
    sender_id: input.senderId,
    sender_role: "tutor",
    content: `Demande de paiement : ${input.hours}h de cours — ${amount.toFixed(2)} €`,
    message_type: "payment_request",
    hours: input.hours,
    amount,
    hourly_rate: input.hourlyRate,
    payment_status: "pending",
  });
  if (error) throw new Error(error.message);
}

export async function ensureWallet(clerkId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("wallets")
    .select("balance")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return Number(data.balance) || 0;
  const { data: created, error: insertError } = await db
    .from("wallets")
    .insert({ clerk_id: clerkId, balance: 50 })
    .select("balance")
    .single();
  if (insertError) throw new Error(insertError.message);
  return Number(created.balance) || 0;
}

export async function payRequest(messageId: string, parentClerkId: string, tutorClerkId: string) {
  const db = getSupabase();
  const { data: message, error } = await db
    .from("messages")
    .select("id, match_id, message_type, hours, amount, payment_status")
    .eq("id", messageId)
    .single();
  if (error || !message) throw new Error(error?.message || "Demande introuvable.");
  if (message.payment_status === "paid") return;
  const amount = Number(message.amount);
  const parentBalance = await ensureWallet(parentClerkId);
  if (parentBalance < amount) throw new Error("Solde insuffisant. Recharge ton portefeuille.");
  await ensureWallet(tutorClerkId);
  const { data: tutorWallet, error: tutorError } = await db
    .from("wallets")
    .select("balance")
    .eq("clerk_id", tutorClerkId)
    .single();
  if (tutorError) throw new Error(tutorError.message);
  const now = new Date().toISOString();
  const parentNext = Math.round((parentBalance - amount) * 100) / 100;
  const tutorNext = Math.round((Number(tutorWallet.balance) + amount) * 100) / 100;
  const { error: debitError } = await db
    .from("wallets")
    .update({ balance: parentNext, updated_at: now })
    .eq("clerk_id", parentClerkId);
  if (debitError) throw new Error(debitError.message);
  const { error: creditError } = await db
    .from("wallets")
    .update({ balance: tutorNext, updated_at: now })
    .eq("clerk_id", tutorClerkId);
  if (creditError) throw new Error(creditError.message);
  const { error: statusError } = await db
    .from("messages")
    .update({
      payment_status: "paid",
      content: `Payé ✓ — ${message.hours}h de cours — ${amount.toFixed(2)} €`,
    })
    .eq("id", messageId);
  if (statusError) throw new Error(statusError.message);
  await db.from("payment_transactions").upsert(
    {
      message_id: messageId,
      match_id: message.match_id,
      parent_clerk_id: parentClerkId,
      tutor_clerk_id: tutorClerkId,
      amount,
      status: "completed",
      is_frozen: false,
    },
    { onConflict: "message_id" }
  );
}

export async function saveAnnouncement(
  clerkId: string,
  input: {
    fullName: string;
    bio: string;
    aboutTutor: string;
    aboutCourse: string;
    specialties: string[];
    hourlyRate: number;
    city: string;
    postalCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    teachingFormats: string[];
    taughtLevels: string[];
    avatarUrl?: string | null;
  }
) {
  const db = getSupabase();
  const existing = await fetchMyTutorProfile(clerkId);
  const payload = {
    full_name: input.fullName.trim() || "Tuteur",
    bio: input.bio.trim(),
    about_tutor: input.aboutTutor.trim(),
    about_course: input.aboutCourse.trim(),
    specialties: input.specialties,
    subject: input.specialties.join(", ") || "Matière",
    hourly_rate: Number(input.hourlyRate) || 0,
    city: input.city.trim() || null,
    postal_code: input.postalCode?.trim() || null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    teaching_formats: input.teachingFormats,
    taught_levels: input.taughtLevels,
    role: "tutor",
    ...(input.avatarUrl ? { avatar_url: input.avatarUrl } : {}),
  };
  const query = existing
    ? db.from("profiles").update(payload).eq("clerk_id", clerkId)
    : db.from("profiles").insert({
        clerk_id: clerkId,
        ...payload,
        rating: 0,
        review_count: 0,
      });
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function uploadAnnouncementPhoto(clerkId: string, file: File) {
  const db = getSupabase();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${clerkId}/avatar.${ext}`;
  const { error } = await db.storage.from("tutor-avatars").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(error.message || "Impossible d’envoyer la photo.");
  const { data } = db.storage.from("tutor-avatars").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Photo enregistrée, mais l’adresse est introuvable.");
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function resetAnnouncement(clerkId: string) {
  const db = getSupabase();
  const { error } = await db
    .from("profiles")
    .update({
      subject: "Matière",
      specialties: [],
      bio: "",
      about_tutor: "",
      about_course: "",
      teaching_formats: [],
      taught_levels: [],
      hourly_rate: 0,
    })
    .eq("clerk_id", clerkId);
  if (error) throw new Error(error.message);
}

export async function startTopUp(clerkId: string, euros: number) {
  const backend = process.env.NEXT_PUBLIC_STRIPE_BACKEND_URL?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!backend || !anon) throw new Error("Le paiement n’est pas configuré.");
  const origin = window.location.origin;
  const response = await fetch(`${backend}/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
    body: JSON.stringify({
      amountCents: Math.round(euros * 100),
      currency: "eur",
      parentId: clerkId,
      successUrl: `${origin}/portefeuille?session_id={CHECKOUT_SESSION_ID}&amount=${euros}`,
      cancelUrl: `${origin}/portefeuille`,
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || "Impossible d’ouvrir le paiement.");
  }
  window.location.href = String(payload.url);
}

export async function confirmTopUp(clerkId: string, sessionId: string, euros: number) {
  const backend = process.env.NEXT_PUBLIC_STRIPE_BACKEND_URL?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!backend || !anon) return;
  const response = await fetch(`${backend}/checkout-session/${encodeURIComponent(sessionId)}`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  const payload = await response.json();
  const paid = payload?.payment_status === "paid" || payload?.status === "complete";
  if (!paid) return;
  const doneKey = `clutch_topup_${sessionId}`;
  if (localStorage.getItem(doneKey)) return;
  const db = getSupabase();
  const balance = await ensureWallet(clerkId);
  const next = Math.round((balance + euros) * 100) / 100;
  const { error } = await db
    .from("wallets")
    .update({ balance: next, updated_at: new Date().toISOString() })
    .eq("clerk_id", clerkId);
  if (error) throw new Error(error.message);
  await db.from("wallet_topups").insert({ clerk_id: clerkId, amount: euros });
  localStorage.setItem(doneKey, "1");
}
