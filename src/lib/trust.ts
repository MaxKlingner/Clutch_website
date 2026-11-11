export const REPORT_REASONS = [
  "Le profil est inexact",
  "Comportement déplacé",
  "Contenu commercial ou spam",
  "Autre",
] as const;

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
