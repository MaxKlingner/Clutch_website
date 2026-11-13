import type { Metadata } from "next";
import Catalog from "@/components/catalog/Catalog";
import { fetchTutors } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Professeurs particuliers — Clutch",
  description:
    "Filtrez les professeurs particuliers par matière, niveau, format, tarif et distance autour de vous.",
};

export default async function TutorsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialView = params.vue === "carte" ? "carte" : "liste";
  const highlightId = typeof params.highlight === "string" ? params.highlight : undefined;
  let initialTutors;
  try {
    initialTutors = await fetchTutors();
  } catch {
    initialTutors = undefined;
  }
  return <Catalog initialTutors={initialTutors} initialView={initialView} highlightId={highlightId} />;
}
