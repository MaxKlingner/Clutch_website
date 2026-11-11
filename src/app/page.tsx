import Catalog from "@/components/catalog/Catalog";
import { fetchTutors } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialView = params.vue === "carte" ? "carte" : "liste";
  let initialTutors;
  try {
    initialTutors = await fetchTutors();
  } catch {
    initialTutors = undefined;
  }
  return <Catalog initialTutors={initialTutors} initialView={initialView} />;
}
