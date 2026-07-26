/** URL canonique officielle du site Clutch. */
export const SITE_URL = "https://clutch.education";

/**
 * Retourne l'URL publique du site.
 * Priorité : NEXT_PUBLIC_SITE_URL → domaine officiel.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return SITE_URL;
}
