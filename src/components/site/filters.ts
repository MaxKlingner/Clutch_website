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

function tutorPlaces(tutor: Tutor) {
  const list: { city: string; postalCode: string | null; latitude: number | null; longitude: number | null }[] = [];
  if (tutor.city) {
    list.push({
      city: tutor.city,
      postalCode: tutor.postalCode,
      latitude: tutor.latitude,
      longitude: tutor.longitude,
    });
  }
  for (const extra of tutor.extraCities ?? []) {
    if (extra.city) list.push(extra);
  }
  return list;
}

export function centroidForCity(tutors: Tutor[], city: string) {
  const needle = fold(city);
  if (!needle) return null;
  const coords: { lat: number; lng: number }[] = [];
  for (const tutor of tutors) {
    for (const place of tutorPlaces(tutor)) {
      if (place.latitude == null || place.longitude == null) continue;
      const folded = fold(place.city);
      if (folded.includes(needle) || needle.includes(folded)) {
        coords.push({ lat: place.latitude, lng: place.longitude });
      }
    }
  }
  if (!coords.length) return null;
  return {
    lat: coords.reduce((sum, item) => sum + item.lat, 0) / coords.length,
    lng: coords.reduce((sum, item) => sum + item.lng, 0) / coords.length,
  };
}

export function sortByProximity(tutors: Tutor[], origin: { lat: number; lng: number } | null) {
  if (!origin) return tutors;
  return tutors
    .map((tutor, index) => {
      const distances = tutorPlaces(tutor)
        .filter((place) => place.latitude != null && place.longitude != null)
        .map((place) => haversineKm(origin.lat, origin.lng, place.latitude!, place.longitude!));
      return {
        tutor,
        index,
        distance: distances.length ? Math.min(...distances) : Number.POSITIVE_INFINITY,
      };
    })
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
        [
          tutor.name,
          tutor.subject,
          tutor.bio,
          tutor.city,
          ...(tutor.extraCities ?? []).map((item) => item.city),
          ...tutor.specialties,
        ]
          .filter(Boolean)
          .join(" ")
      );
      if (!haystack.includes(fold(query))) return false;
    }
  }

  const place = fold(filters.city);
  if (place) {
    const cleanZip = filters.city.replace(/\s+/g, "");
    const isZip = /^\d{4}$/.test(cleanZip);
    const matched = tutorPlaces(tutor).some((entry) => {
      const city = fold(entry.city);
      const postal = (entry.postalCode || "").replace(/\s+/g, "");
      const cityOk = city && (city.includes(place) || place.includes(city));
      const postalOk = isZip && postal === cleanZip;
      return Boolean(cityOk || postalOk);
    });
    if (!matched) return false;
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
    const withinRadius = tutorPlaces(tutor).some(
      (entry) =>
        entry.latitude != null &&
        entry.longitude != null &&
        haversineKm(filters.origin!.lat, filters.origin!.lng, entry.latitude, entry.longitude) <=
          filters.radiusKm!
    );
    if (!withinRadius) {
      return false;
    }
  }

  return true;
}

export function offersRemote(tutor: Tutor): boolean {
  return tutor.teachingFormats.some((format) => REMOTE.has(fold(format)));
}

export function tutorsForCityHub(
  tutors: Tutor[],
  hub: { name: string; lat: number; lng: number; maxKm?: number }
): Tutor[] {
  const maxKm = hub.maxKm ?? 35;
  const hubNeedle = fold(hub.name);
  const local: { tutor: Tutor; distance: number }[] = [];
  const remoteOnly: Tutor[] = [];

  for (const tutor of tutors) {
    const places = tutorPlaces(tutor);
    const cityMatch = places.some((entry) => fold(entry.city).includes(hubNeedle));
    const distances = places
      .filter((entry) => entry.latitude != null && entry.longitude != null)
      .map((entry) => haversineKm(hub.lat, hub.lng, entry.latitude!, entry.longitude!));
    const distance = distances.length ? Math.min(...distances) : Number.POSITIVE_INFINITY;

    if (cityMatch || distance <= maxKm) {
      local.push({ tutor, distance: cityMatch ? Math.min(distance, 0) : distance });
    } else if (offersRemote(tutor)) {
      remoteOnly.push(tutor);
    }
  }

  local.sort((a, b) => a.distance - b.distance);
  return [...local.map((item) => item.tutor), ...remoteOnly];
}
