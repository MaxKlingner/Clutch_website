"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Around = { lat: number; lng: number };

type SearchState = {
  query: string;
  city: string;
  setQuery: (value: string) => void;
  setCity: (value: string) => void;
  around: Around | null;
  aroundState: "idle" | "pending" | "denied";
  requestAround: () => void;
  clearAround: () => void;
};

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [around, setAround] = useState<Around | null>(null);
  const [aroundState, setAroundState] = useState<"idle" | "pending" | "denied">("idle");

  function requestAround() {
    if (!navigator.geolocation) {
      setAroundState("denied");
      return;
    }
    setAroundState("pending");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAround({ lat: position.coords.latitude, lng: position.coords.longitude });
        setAroundState("idle");
        setCity("");
      },
      () => setAroundState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
    );
  }

  function clearAround() {
    setAround(null);
    setAroundState("idle");
  }

  const value = useMemo(
    () => ({ query, city, setQuery, setCity, around, aroundState, requestAround, clearAround }),
    [query, city, around, aroundState]
  );
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSiteSearch() {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error("Recherche indisponible.");
  }
  return value;
}
