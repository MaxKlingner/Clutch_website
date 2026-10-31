import { redirect } from "next/navigation";
import { queryString } from "@/lib/redirects";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  redirect(`/messages/nouveau${queryString(params)}`);
}
