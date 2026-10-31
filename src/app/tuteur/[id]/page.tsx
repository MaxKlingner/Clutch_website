"use client";

import { useParams } from "next/navigation";
import PublicTutor from "@/components/catalog/PublicTutor";

export default function Page() {
  const params = useParams<{ id: string }>();
  return <PublicTutor id={params.id} />;
}
