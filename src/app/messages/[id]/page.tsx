"use client";

import { useParams } from "next/navigation";
import Inbox from "@/components/site/Inbox";

export default function Page() {
  const params = useParams<{ id: string }>();
  return <Inbox matchId={params.id} />;
}
