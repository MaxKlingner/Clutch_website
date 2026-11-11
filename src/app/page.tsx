import { redirect } from "next/navigation";
import Landing from "@/components/home/Landing";
import { fetchTutors, type Tutor } from "@/lib/db";
import { queryString } from "@/lib/redirects";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.q || params.ville || params.vue) {
    redirect(`/professeurs${queryString(params)}`);
  }

  let initialTutors: Tutor[] = [];
  try {
    initialTutors = await fetchTutors();
  } catch {
    initialTutors = [];
  }

  return <Landing initialTutors={initialTutors} />;
}
