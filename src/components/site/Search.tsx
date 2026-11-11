"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type Around = { lat: number; lng: number };

type SearchState = {
  query: string;
  city: string;
  setQuery: (value: string) => void;
  setCity: (value: string) => void;
  around: Around | null;
  aroundState: "idle" | "pending" | "denied";
  requestAround: () => void;
  promptAroundOnce: () => void;
  clearAround: () => void;
};

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [around, setAround] = useState<Around | null>(null);
  const [aroundState, setAroundState] = useState<"idle" | "pending" | "denied">("idle");
  const promptedRef = useRef(false);

  const requestAround = useCallback(() => {
    if (!navigator.geolocation) {
      setAroundState("denied");
      return;
    }
    promptedRef.current = true;
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
  }, []);

  const promptAroundOnce = useCallback(() => {
    if (promptedRef.current || around || aroundState !== "idle") return;
    promptedRef.current = true;
    requestAround();
  }, [around, aroundState, requestAround]);

  const clearAround = useCallback(() => {
    setAround(null);
    setAroundState("idle");
  }, []);

  const value = useMemo(
    () => ({
      query,
      city,
      setQuery,
      setCity,
      around,
      aroundState,
      requestAround,
      promptAroundOnce,
      clearAround,
    }),
    [query, city, around, aroundState, requestAround, promptAroundOnce, clearAround]
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
