import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Landing from "@/components/home/Landing";
import JsonLd from "@/components/site/JsonLd";
import { fetchTutors, type Tutor } from "@/lib/db";
import { queryString } from "@/lib/redirects";
import { faqJsonLd, HOME_FAQ } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

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

  return (
    <>
      <JsonLd data={faqJsonLd(HOME_FAQ)} />
      <Landing initialTutors={initialTutors} />
    </>
  );
}
