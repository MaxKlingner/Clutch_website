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
  "id, clerk_id, full_name, subject, hourly_rate, rating, review_count, role, bio, about_tutor, about_course, specialties, study_year, avatar_url, city, postal_code, latitude, longitude, teaching_formats, taught_levels, diploma_title, diploma_school, diploma_year, response_minutes, has_contact_phone, created_at";

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
  avatarUrl: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  teachingFormats: string[];
  taughtLevels: string[];
  diplomaTitle: string;
  diplomaSchool: string;
  diplomaYear: number | null;
  responseMinutes: number | null;
  hasContactPhone: boolean;
};

export type Review = {
  id: string;
  matchId: string;
  rating: number;
  comment: string;
  createdAt: string;
  reply: string;
  repliedAt: string | null;
};

export type Match = {
  id: string;
  parentId: string;
  tutorId: string;
  status: string;
  createdAt: string;
  parentLastReadAt: string | null;
  tutorLastReadAt: string | null;
  lastMessageAt: string | null;
  lastMessageContent: string | null;
  lastMessageSenderId: string | null;
  tutor: Tutor | null;
  parentName: string;
};

const MATCH_COLUMNS = `id, parent_id, tutor_id, status, created_at, parent_last_read_at, tutor_last_read_at, tutor:profiles (${PROFILE_COLUMNS})`;
const MESSAGE_COLUMNS = "id, match_id, sender_id, sender_role, content, created_at, message_type";

export type ChatMessage = {
  id: string;
  matchId: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
  messageType: string;
};

const useClerkJwt = process.env.NEXT_PUBLIC_CLERK_SUPABASE_AUTH !== "false";
let client: SupabaseClient | null = null;
let tokenProvider: (() => Promise<string | null>) | null = null;

export function setSupabaseTokenProvider(provider: (() => Promise<string | null>) | null) {
  tokenProvider = provider;
}

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error("Supabase n’est pas configuré.");
  }
  if (typeof window === "undefined") {
    return createClient(url, key);
  }
  if (client) return client;
  client = createClient(
    url,
    key,
    useClerkJwt
      ? {
          accessToken: async () => (tokenProvider ? await tokenProvider() : null),
        }
      : undefined
  );
  return client;
}

export function announcementPublished(
  tutor:
    | Pick<
        Tutor,
        | "specialties"
        | "bio"
        | "aboutTutor"
        | "aboutCourse"
        | "city"
        | "teachingFormats"
        | "taughtLevels"
        | "diplomaTitle"
        | "diplomaSchool"
        | "diplomaYear"
        | "hourlyRate"
        | "avatarUrl"
      >
    | null
) {
  if (!tutor) return false;
  const hasSpecialty = tutor.specialties.some((item) => {
    const name = item.trim().toLowerCase();
    return name && name !== "matière";
  });
  return Boolean(
    hasSpecialty &&
      tutor.avatarUrl &&
      tutor.city?.trim() &&
      tutor.bio.trim() &&
      tutor.aboutTutor.trim() &&
      tutor.aboutCourse.trim() &&
      tutor.diplomaTitle.trim() &&
      tutor.diplomaSchool.trim() &&
      tutor.diplomaYear != null &&
      tutor.teachingFormats.length > 0 &&
      tutor.taughtLevels.length > 0 &&
      tutor.hourlyRate >= 5
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
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    city: row.city ? String(row.city) : null,
    postalCode: row.postal_code ? String(row.postal_code) : null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    teachingFormats: Array.isArray(row.teaching_formats)
      ? row.teaching_formats.map(String)
      : [],
    taughtLevels: Array.isArray(row.taught_levels) ? row.taught_levels.map(String) : [],
    diplomaTitle: row.diploma_title ? String(row.diploma_title) : "",
    diplomaSchool: row.diploma_school ? String(row.diploma_school) : "",
    diplomaYear:
      row.diploma_year == null || !Number.isInteger(Number(row.diploma_year)) || Number(row.diploma_year) <= 0
        ? null
        : Number(row.diploma_year),
    responseMinutes:
      row.response_minutes == null || !Number.isFinite(Number(row.response_minutes))
        ? null
        : Number(row.response_minutes),
    hasContactPhone: Boolean(row.has_contact_phone),
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
  };
}

function mapMatch(
  row: Record<string, unknown>,
  parentName = "Élève",
  latest?: { createdAt: string; content: string; senderId: string }
): Match {
  const tutor = mapTutor((row.tutor as Record<string, unknown>) ?? null);
  return {
    id: String(row.id),
    parentId: String(row.parent_id),
    tutorId: String(row.tutor_id),
    status: String(row.status ?? "pending"),
    createdAt: String(row.created_at ?? ""),
    parentLastReadAt: row.parent_last_read_at ? String(row.parent_last_read_at) : null,
    tutorLastReadAt: row.tutor_last_read_at ? String(row.tutor_last_read_at) : null,
    lastMessageAt: latest?.createdAt ?? null,
    lastMessageContent: latest?.content ?? null,
    lastMessageSenderId: latest?.senderId ?? null,
    tutor,
    parentName,
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

export async function fetchTutorContactPhone(tutorId: string): Promise<string | null> {
  const db = getSupabase();
  if (useClerkJwt) {
    const { data, error } = await db.rpc("get_tutor_contact_phone", { target_tutor_id: tutorId });
    if (!error) {
      const phone = data ? String(data).trim() : "";
      return phone || null;
    }
  }
  const { data, error } = await db
    .from("profiles")
    .select("contact_phone")
    .eq("id", tutorId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const phone = data?.contact_phone ? String(data.contact_phone).trim() : "";
  return phone || null;
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

function mapReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    matchId: row.match_id ? String(row.match_id) : "",
    rating: Number(row.rating) || 0,
    comment: row.comment ? String(row.comment) : "",
    createdAt: String(row.created_at ?? ""),
    reply: row.reply ? String(row.reply) : "",
    repliedAt: row.replied_at ? String(row.replied_at) : null,
  };
}

export async function fetchReviews(tutorId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("reviews")
    .select("id, match_id, rating, comment, created_at, reply, replied_at")
    .eq("tutor_id", tutorId)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapReview(row));
}

export async function fetchReviewForMatch(matchId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("reviews")
    .select("id, match_id, rating, comment, created_at, reply, replied_at")
    .eq("match_id", matchId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapReview(data) : null;
}

export function exchangeReady(messages: { senderRole: string }[]) {
  const roles = new Set(messages.map((message) => message.senderRole));
  return roles.has("parent") && roles.has("tutor");
}

export async function submitReview(input: {
  matchId: string;
  reviewerId: string;
  tutorId: string;
  rating: number;
  comment?: string;
}) {
  const stars = Number(input.rating);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new Error("La note doit être un entier entre 1 et 5.");
  }
  const [match, messages] = await Promise.all([
    fetchMatch(input.matchId),
    fetchMessages(input.matchId),
  ]);
  if (!match || match.parentId !== input.reviewerId || match.tutor?.clerkId === input.reviewerId) {
    throw new Error("Seul l’élève ou le parent peut laisser un avis.");
  }
  if (!exchangeReady(messages)) {
    throw new Error("Un avis n’est possible qu’après un échange.");
  }
  const db = getSupabase();
  const { error } = await db.from("reviews").insert({
    match_id: input.matchId,
    reviewer_id: input.reviewerId,
    tutor_id: input.tutorId,
    rating: stars,
    comment: input.comment?.trim() || null,
  });
  if (error) {
    const text = error.message || "";
    if (text.toLowerCase().includes("duplicate") || text.toLowerCase().includes("unique")) {
      throw new Error("Tu as déjà laissé un avis.");
    }
    if (text.toLowerCase().includes("échange")) {
      throw new Error("Un avis n’est possible qu’après un échange.");
    }
    throw new Error(text || "Impossible d’enregistrer l’avis.");
  }
}

export async function replyToReview(reviewId: string, clerkId: string, reply: string) {
  const text = reply.trim();
  if (!text) throw new Error("La réponse est vide.");
  const profile = await fetchMyTutorProfile(clerkId);
  if (!profile) throw new Error("Annonce introuvable.");
  const db = getSupabase();
  const { error } = await db
    .from("reviews")
    .update({ reply: text, replied_at: new Date().toISOString() })
    .eq("id", reviewId)
    .eq("tutor_id", profile.id);
  if (error) throw new Error(error.message || "Impossible d’enregistrer la réponse.");
}

export async function submitReport(input: {
  reporterId: string;
  targetType: "profile" | "conversation";
  targetId: string;
  reason: string;
}) {
  const db = getSupabase();
  const { error } = await db.from("reports").insert({
    reporter_id: input.reporterId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason.trim(),
  });
  if (error) throw new Error(error.message || "Impossible d’envoyer le signalement.");
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
  email?: string | null;
}) {
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();
  await setActiveRole(input.clerkId, input.role, fullName);
  const db = getSupabase();
  const cleanEmail = input.email?.trim() || null;
  const { error } = await db
    .from("user_profiles")
    .update({
      first_name: input.firstName || null,
      last_name: input.lastName || null,
      city: input.city || null,
      full_name: fullName || null,
      ...(cleanEmail ? { email: cleanEmail } : {}),
    })
    .eq("clerk_id", input.clerkId);
  if (error) throw new Error(error.message);
  if (cleanEmail) {
    await db
      .from("email_consents")
      .upsert({ clerk_id: input.clerkId, email: cleanEmail }, { onConflict: "clerk_id" });
  }
}

export async function syncUserEmail(
  clerkId: string,
  email: string,
  fullName?: string | null
) {
  const clean = email.trim();
  if (!clean) return;
  const db = getSupabase();
  const now = new Date().toISOString();
  const { data: existing } = await db
    .from("user_profiles")
    .select("clerk_id, email, full_name")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (existing && (existing.email !== clean || (!existing.full_name && fullName))) {
    await db
      .from("user_profiles")
      .update({
        email: clean,
        full_name: existing.full_name || fullName || null,
        updated_at: now,
      })
      .eq("clerk_id", clerkId);
  }

  await db
    .from("email_consents")
    .upsert(
      { clerk_id: clerkId, email: clean, updated_at: now },
      { onConflict: "clerk_id" }
    );
}

export async function fetchEmailNotifications(clerkId: string): Promise<boolean> {
  const db = getSupabase();
  const { data, error } = await db
    .from("user_profiles")
    .select("email_notifications")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.email_notifications !== false;
}

export async function setEmailNotifications(clerkId: string, enabled: boolean) {
  const db = getSupabase();
  const { data: existing } = await db
    .from("user_profiles")
    .select("clerk_id")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  if (!existing) {
    const { error } = await db.from("user_profiles").insert({
      clerk_id: clerkId,
      role: ROLES.PARENT,
      active_role: ROLES.PARENT,
      email_notifications: enabled,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await db
    .from("user_profiles")
    .update({ email_notifications: enabled, updated_at: new Date().toISOString() })
    .eq("clerk_id", clerkId);
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

async function resolveParentNames(parentIds: string[], matchIds: string[] = []) {
  const unique = [...new Set(parentIds.filter(Boolean))];
  const names = new Map<string, string>();
  if (!unique.length) return names;
  try {
    const db = getSupabase();
    if (useClerkJwt && matchIds.length) {
      const { data, error } = await db.rpc("get_match_parent_names", {
        target_match_ids: matchIds,
      });
      if (!error && Array.isArray(data)) {
        for (const row of data as { parent_id?: string; first_name?: string }[]) {
          const parentId = String(row.parent_id || "").trim();
          const label = String(row.first_name || "").trim();
          if (parentId && label) names.set(parentId, label);
        }
        return names;
      }
    }
    const { data } = await db
      .from("user_profiles")
      .select("clerk_id, first_name, full_name")
      .in("clerk_id", unique);
    for (const row of data ?? []) {
      const first = String(row.first_name || "").trim();
      const full = String(row.full_name || "").trim();
      const label = first || full.split(/\s+/)[0] || "";
      if (label) names.set(String(row.clerk_id), label);
    }
  } catch {
    // Graceful fallback if user_profiles is unavailable
  }
  return names;
}

async function matchesWithMessages(rows: Record<string, unknown>[]) {
  if (!rows.length) return [];
  const db = getSupabase();
  const { data, error } = await db
    .from("messages")
    .select("match_id, sender_id, content, created_at, message_type")
    .in(
      "match_id",
      rows.map((row) => row.id)
    );
  if (error) throw new Error(error.message);
  const latestByMatch = new Map<string, { createdAt: string; content: string; senderId: string }>();
  for (const row of data ?? []) {
    if (String(row.message_type || "text") === "payment_request") continue;
    const id = String(row.match_id);
    const createdAt = String(row.created_at ?? "");
    const previous = latestByMatch.get(id);
    if (!previous || createdAt > previous.createdAt) {
      latestByMatch.set(id, {
        createdAt,
        content: String(row.content ?? ""),
        senderId: String(row.sender_id ?? ""),
      });
    }
  }
  const activeRows = rows.filter((row) => latestByMatch.has(String(row.id)));
  const parentNames = await resolveParentNames(
    activeRows.map((row) => String(row.parent_id)),
    activeRows.map((row) => String(row.id))
  );
  return activeRows
    .map((row) =>
      mapMatch(
        row,
        parentNames.get(String(row.parent_id)) || "Élève",
        latestByMatch.get(String(row.id))
      )
    )
    .sort((left, right) => {
      const a = left.lastMessageAt || left.createdAt;
      const b = right.lastMessageAt || right.createdAt;
      return b.localeCompare(a);
    });
}

export function isMatchUnread(
  match: Match,
  clerkId: string,
  myTutorProfileId: string | null
) {
  if (!match.lastMessageAt || !match.lastMessageSenderId) return false;
  if (match.lastMessageSenderId === clerkId) return false;
  const asTutor = Boolean(
    (myTutorProfileId && match.tutorId === myTutorProfileId) ||
      (match.tutor?.clerkId === clerkId && match.parentId !== clerkId)
  );
  const lastReadAt = asTutor ? match.tutorLastReadAt : match.parentLastReadAt;
  if (!lastReadAt) return true;
  return match.lastMessageAt > lastReadAt;
}

export async function fetchUnreadCount(clerkId: string) {
  const { matches, myTutorProfileId } = await fetchUserMatches(clerkId);
  return matches.filter((match) => isMatchUnread(match, clerkId, myTutorProfileId)).length;
}

export async function markMatchRead(matchId: string, asTutor: boolean) {
  const db = getSupabase();
  const now = new Date().toISOString();
  const patch = asTutor ? { tutor_last_read_at: now } : { parent_last_read_at: now };
  const { error } = await db.from("matches").update(patch).eq("id", matchId);
  if (!error && typeof window !== "undefined") {
    window.dispatchEvent(new Event("clutch-messages"));
  }
}

export function subscribeIncomingMessages(onEvent: () => void) {
  const db = getSupabase();
  const channel = db
    .channel("web-unread-messages")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, onEvent)
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
}

export async function fetchParentMatches(parentId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("matches")
    .select(`${MATCH_COLUMNS}`)
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
    .select(`${MATCH_COLUMNS}`)
    .eq("tutor_id", profile.id)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return matchesWithMessages((data ?? []) as Record<string, unknown>[]);
}

export async function fetchUserMatches(clerkId: string) {
  const db = getSupabase();
  const [profile, parentResult] = await Promise.all([
    fetchMyTutorProfile(clerkId),
    db
      .from("matches")
      .select(`${MATCH_COLUMNS}`)
      .eq("parent_id", clerkId)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false }),
  ]);
  if (parentResult.error) throw new Error(parentResult.error.message);

  let tutorRows: Record<string, unknown>[] = [];
  if (profile) {
    const tutorResult = await db
      .from("matches")
      .select(`${MATCH_COLUMNS}`)
      .eq("tutor_id", profile.id)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });
    if (tutorResult.error) throw new Error(tutorResult.error.message);
    tutorRows = (tutorResult.data ?? []) as Record<string, unknown>[];
  }

  const combined = new Map<string, Record<string, unknown>>();
  for (const row of (parentResult.data ?? []) as Record<string, unknown>[]) {
    combined.set(String(row.id), row);
  }
  for (const row of tutorRows) {
    combined.set(String(row.id), row);
  }

  const matches = await matchesWithMessages([...combined.values()]);
  return { matches, myTutorProfileId: profile?.id ?? null };
}

export async function findTutorMatch(parentId: string, tutorId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("matches")
    .select(`${MATCH_COLUMNS}`)
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
  const parentNames = await resolveParentNames([String(data.parent_id)], [String(data.id)]);
  return mapMatch(data as Record<string, unknown>, parentNames.get(String(data.parent_id)) || "Élève");
}

export async function fetchMatch(matchId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("matches")
    .select(`${MATCH_COLUMNS}`)
    .eq("id", matchId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const parentNames = await resolveParentNames([String(data.parent_id)], [String(data.id)]);
  return mapMatch(data as Record<string, unknown>, parentNames.get(String(data.parent_id)) || "Élève");
}

export async function contactedTutorIds(parentId: string) {
  const matches = await fetchParentMatches(parentId);
  return new Set(matches.map((match) => match.tutorId));
}

async function ensureMatch(parentId: string, tutorId: string) {
  const target = await fetchTutor(tutorId);
  if (target?.clerkId === parentId) {
    throw new Error("Tu ne peux pas t’envoyer un message à toi-même.");
  }
  const db = getSupabase();
  const { data: existing, error: existingError } = await db
    .from("matches")
    .select(`${MATCH_COLUMNS}`)
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
      .update({ status: "pending", parent_last_read_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select(`${MATCH_COLUMNS}`)
      .single();
    if (error) throw new Error(error.message);
    return mapMatch(data as Record<string, unknown>);
  }
  const { data, error } = await db
    .from("matches")
    .insert({
      parent_id: parentId,
      tutor_id: tutorId,
      status: "pending",
      parent_last_read_at: new Date().toISOString(),
    })
    .select(`${MATCH_COLUMNS}`)
    .single();
  if (error) throw new Error(error.message);
  return mapMatch(data as Record<string, unknown>);
}

export async function fetchMessages(matchId: string) {
  const db = getSupabase();
  const { data, error } = await db
    .from("messages")
    .select(MESSAGE_COLUMNS)
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => mapMessage(row))
    .filter((row): row is ChatMessage => row !== null && row.messageType !== "payment_request");
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
        if (message && message.messageType !== "payment_request") onChange(message);
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
    .select(MESSAGE_COLUMNS)
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
    diplomaTitle?: string;
    diplomaSchool?: string;
    diplomaYear?: number | null;
    contactPhone?: string | null;
    avatarUrl?: string | null;
  }
) {
  const db = getSupabase();
  const existing = await fetchMyTutorProfile(clerkId);
  const avatar = input.avatarUrl ?? existing?.avatarUrl ?? null;
  if (
    !avatar ||
    !input.city.trim() ||
    !input.bio.trim() ||
    !input.aboutTutor.trim() ||
    !input.aboutCourse.trim() ||
    !input.specialties.length ||
    !input.teachingFormats.length ||
    !input.taughtLevels.length ||
    !input.diplomaTitle?.trim() ||
    !input.diplomaSchool?.trim() ||
    input.diplomaYear == null ||
    !Number.isFinite(input.hourlyRate) ||
    input.hourlyRate < 5
  ) {
    throw new Error("Toutes les informations de l’annonce sont obligatoires.");
  }
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
    diploma_title: input.diplomaTitle?.trim() || null,
    diploma_school: input.diplomaSchool?.trim() || null,
    diploma_year: input.diplomaYear ?? null,
    contact_phone: input.contactPhone?.trim() || null,
    role: "tutor",
    ...(avatar ? { avatar_url: avatar } : {}),
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
      contact_phone: null,
    })
    .eq("clerk_id", clerkId);
  if (error) throw new Error(error.message);
}

export async function deleteAccountData(clerkId: string) {
  const db = getSupabase();
  await db.from("favorite_tutors").delete().eq("user_id", clerkId);
  await db.from("email_consents").delete().eq("clerk_id", clerkId);
  await db.from("user_profiles").delete().eq("clerk_id", clerkId);

  const profile = await fetchMyTutorProfile(clerkId);
  if (profile) {
    const { error } = await db.from("profiles").delete().eq("id", profile.id);
    if (error) {
      await db
        .from("profiles")
        .update({
          clerk_id: null,
          full_name: "Compte supprimé",
          subject: "Matière",
          specialties: [],
          bio: "",
          about_tutor: "",
          about_course: "",
          teaching_formats: [],
          taught_levels: [],
          hourly_rate: 0,
          avatar_url: null,
          city: null,
          postal_code: null,
          latitude: null,
          longitude: null,
          diploma_title: null,
          diploma_school: null,
          diploma_year: null,
          contact_phone: null,
          expo_push_token: null,
        })
        .eq("id", profile.id);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(roleKey(clerkId));
  }
}
