import POSTAL_ROWS from "@/lib/postalLocalities.json";

type Locality = {
  name: string;
  zip: string;
  latitude: number;
  longitude: number;
  main: boolean;
};

export type ResolvedPlace = {
  name: string;
  postalCode: string;
  latitude: number;
  longitude: number;
};

const LOCALITIES: Locality[] = (POSTAL_ROWS as [string, string, number, number, number][]).map(
  ([zip, name, latitude, longitude, main]) => ({
    name,
    zip,
    latitude,
    longitude,
    main: main === 1,
  })
);

function fold(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function toResolved(place: Locality): ResolvedPlace {
  return {
    name: place.name,
    postalCode: place.zip,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

function byPostalRank(left: Locality, right: Locality) {
  if (left.main !== right.main) return left.main ? -1 : 1;
  return left.name.localeCompare(right.name, "fr");
}

export function resolveLocationQuery(query: string): ResolvedPlace | null {
  const raw = query.trim();
  if (!raw) return null;
  const compact = raw.replace(/\s+/g, "");
  if (/^\d{4}$/.test(compact)) {
    const matches = LOCALITIES.filter((place) => place.zip === compact).sort(byPostalRank);
    if (matches[0]) return toResolved(matches[0]);
  }
  const named = raw.replace(/\s+\d{4}$/, "");
  const needle = fold(named);
  if (needle.length < 2) return null;
  const trailingPostal = raw.match(/(\d{4})$/)?.[1];
  const exact = LOCALITIES.find(
    (place) => fold(place.name) === needle && (!trailingPostal || place.zip === trailingPostal)
  );
  return exact ? toResolved(exact) : null;
}

export function suggestLocations(query: string): ResolvedPlace[] {
  const raw = query.trim();
  const digits = raw.replace(/\s+/g, "");
  if (/^\d{1,4}$/.test(digits)) {
    if (digits.length < 2) return [];
    return LOCALITIES.filter((place) => place.zip.startsWith(digits))
      .sort(byPostalRank)
      .slice(0, 8)
      .map(toResolved);
  }
  const needle = fold(raw);
  if (needle.length < 2) return [];
  return LOCALITIES.filter((place) => fold(place.name).includes(needle))
    .sort((left, right) => {
      const leftStart = fold(left.name).startsWith(needle) ? 0 : 1;
      const rightStart = fold(right.name).startsWith(needle) ? 0 : 1;
      if (leftStart !== rightStart) return leftStart - rightStart;
      return byPostalRank(left, right);
    })
    .slice(0, 8)
    .map(toResolved);
}
