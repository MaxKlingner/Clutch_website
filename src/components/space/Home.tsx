"use client";

import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { getUserRole, type Role } from "@/lib/db";
import Discover from "@/components/space/Discover";
import { TutorHome } from "@/components/space/More";

export default function Home() {
  const { userId } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  useEffect(() => {
    if (!userId) return;
    getUserRole(userId).then(setRole);
  }, [userId]);
  if (!role) return null;
  return role === "tutor" ? <TutorHome /> : <Discover />;
}
