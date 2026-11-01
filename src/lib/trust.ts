export const REPORT_REASONS = [
  "Le profil est inexact",
  "Comportement déplacé",
  "Coordonnées envoyées hors de Clutch",
  "Autre",
] as const;

export function responseLabel(minutes: number | null | undefined) {
  if (minutes == null || !Number.isFinite(minutes)) return null;
  if (minutes <= 60) return "Répond en moins d’une heure";
  if (minutes <= 24 * 60) return "Répond en moins de 24 h";
  if (minutes <= 48 * 60) return "Répond en moins de 48 h";
  return "Répond en plus de 48 h";
}

export function isAdultBirthDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }
  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setFullYear(limit.getFullYear() - 18);
  return year >= 1900 && date <= limit;
}

export function formatBirthInput(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function diplomaLine(input: {
  diplomaTitle: string;
  diplomaSchool: string;
  diplomaYear: number | null;
}) {
  if (!input.diplomaTitle) return "";
  const school = input.diplomaSchool ? `, ${input.diplomaSchool}` : "";
  const year = input.diplomaYear ? ` (${input.diplomaYear})` : "";
  return `${input.diplomaTitle}${school}${year}`;
}

export function diplomaPayload(
  title: string,
  school: string,
  year: string
):
  | { diplomaTitle: string; diplomaSchool: string; diplomaYear: number | null }
  | { error: string } {
  const diplomaTitle = title.trim();
  const diplomaSchool = school.trim();
  const rawYear = year.trim();
  if (!diplomaTitle && !diplomaSchool && !rawYear) {
    return { diplomaTitle: "", diplomaSchool: "", diplomaYear: null };
  }
  if (!diplomaTitle || !diplomaSchool || !rawYear) {
    return { error: "Le diplôme demande un intitulé, un établissement et une année." };
  }
  const diplomaYear = Number(rawYear);
  const max = new Date().getFullYear();
  if (!Number.isInteger(diplomaYear) || diplomaYear < 1950 || diplomaYear > max) {
    return { error: `L’année du diplôme doit être entre 1950 et ${max}.` };
  }
  return { diplomaTitle, diplomaSchool, diplomaYear };
}
