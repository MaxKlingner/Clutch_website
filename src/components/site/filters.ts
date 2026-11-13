import { SPECIALTIES, type Tutor } from "@/lib/db";

export const PRICE_STEPS = [15, 20, 25, 30, 35, 40, 45, 50] as const;
export const RADIUS_STEPS = [5, 10, 15, 20, 30, 50] as const;

export const LEVEL_GROUPS = [
  { id: "primaire", label: "Primaire", levels: ["Primaire"] },
  { id: "secondaire", label: "Secondaire", levels: ["Secondaire"] },
  {
    id: "superieur",
    label: "Supérieur",
    levels: ["Supérieur", "Enseignement Supérieur"],
  },
  {
    id: "adultes",
    label: "Formation pour adultes",
    levels: ["Formation pour adultes"],
  },
] as const;

const CHEZ_LE_PROF = new Set(["chez le professeur"]);
const CHEZ_L_ELEVE = new Set(["chez l'eleve", "chez l’eleve", "a domicile"]);
const LEGACY_IN_PERSON = new Set(["face a face", "presentiel", "en presentiel"]);
const REMOTE = new Set(["a distance", "en ligne"]);

export function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function subjectSuggestions(query: string) {
  const needle = fold(query);
  return SPECIALTIES.filter((item) => !needle || fold(item).includes(needle));
}

function offeredFormats(formats: string[]) {
  const mapped: string[] = [];
  for (const raw of formats) {
    const name = fold(raw);
    if ((CHEZ_LE_PROF.has(name) || LEGACY_IN_PERSON.has(name)) && !mapped.includes("Chez le professeur")) {
      mapped.push("Chez le professeur");
    }
    if ((CHEZ_L_ELEVE.has(name) || LEGACY_IN_PERSON.has(name)) && !mapped.includes("Chez l’élève")) {
      mapped.push("Chez l’élève");
    }
    if (REMOTE.has(name) && !mapped.includes("À distance")) {
      mapped.push("À distance");
    }
  }
  return mapped;
}

export function centroidForCity(tutors: Tutor[], city: string) {
  const needle = fold(city);
  if (!needle) return null;
  const placed = tutors.filter((tutor) => {
    if (tutor.latitude == null || tutor.longitude == null || !tutor.city) return false;
    const place = fold(tutor.city);
    return place.includes(needle) || needle.includes(place);
  });
  if (!placed.length) return null;
  return {
    lat: placed.reduce((sum, tutor) => sum + tutor.latitude!, 0) / placed.length,
    lng: placed.reduce((sum, tutor) => sum + tutor.longitude!, 0) / placed.length,
  };
}

export function sortByProximity(tutors: Tutor[], origin: { lat: number; lng: number } | null) {
  if (!origin) return tutors;
  return tutors
    .map((tutor, index) => ({
      tutor,
      index,
      distance:
        tutor.latitude == null || tutor.longitude == null
          ? Number.POSITIVE_INFINITY
          : haversineKm(origin.lat, origin.lng, tutor.latitude, tutor.longitude),
    }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .map((item) => item.tutor);
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function matchesTutor(
  tutor: Tutor,
  filters: {
    query: string;
    city: string;
    formats: string[];
    levels: string[];
    maxRate: number | null;
    radiusKm: number | null;
    origin: { lat: number; lng: number } | null;
  }
) {
  const query = filters.query.trim();
  if (query) {
    const exact = SPECIALTIES.find((item) => fold(item) === fold(query));
    if (exact) {
      const hasSubject =
        tutor.specialties.some((item) => fold(item) === fold(exact)) ||
        fold(tutor.subject).includes(fold(exact));
      if (!hasSubject) return false;
    } else {
      const haystack = fold(
        [tutor.name, tutor.subject, tutor.bio, tutor.city, ...tutor.specialties]
          .filter(Boolean)
          .join(" ")
      );
      if (!haystack.includes(fold(query))) return false;
    }
  }

  const place = fold(filters.city);
  if (place) {
    const city = fold(tutor.city || "");
    const postal = (tutor.postalCode || "").replace(/\s+/g, "");
    const cityOk = city && (city.includes(place) || place.includes(city));
    const postalOk = /^\d{4}$/.test(filters.city.replace(/\s+/g, "")) && postal === filters.city.replace(/\s+/g, "");
    if (!cityOk && !postalOk) return false;
  }

  if (filters.formats.length) {
    const offered = offeredFormats(tutor.teachingFormats);
    if (!filters.formats.some((format) => offered.includes(format))) return false;
  }

  if (filters.levels.length) {
    const accepted = new Set(
      LEVEL_GROUPS.filter((group) => filters.levels.includes(group.id)).flatMap((group) =>
        group.levels.map(fold)
      )
    );
    if (!tutor.taughtLevels.some((level) => accepted.has(fold(level)))) return false;
  }

  if (filters.maxRate != null && tutor.hourlyRate > filters.maxRate) return false;

  if (filters.radiusKm != null && filters.origin) {
    if (tutor.latitude == null || tutor.longitude == null) return false;
    if (haversineKm(filters.origin.lat, filters.origin.lng, tutor.latitude, tutor.longitude) > filters.radiusKm) {
      return false;
    }
  }

  return true;
}
