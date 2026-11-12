"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useRouter } from "next/navigation";
import { firstName, formatRate } from "@/components/site/TutorCard";
import type { Tutor } from "@/lib/db";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

type Point = { tutor: Tutor; lat: number; lng: number; dx: number; dy: number };

function safeImageUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith("/") || /^https?:\/\//i.test(url) || url.startsWith("blob:")) return url;
  return null;
}

function createPinElement(tutor: Tutor, name: string, rate: string) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tutor-pin-label";
  button.setAttribute("aria-label", `${name}, ${rate} €`);

  const avatar = safeImageUrl(tutor.avatarUrl);
  if (avatar) {
    const img = document.createElement("img");
    img.src = avatar;
    img.alt = "";
    button.appendChild(img);
  } else {
    const fallback = document.createElement("span");
    fallback.className = "tutor-pin-fallback";
    fallback.textContent = name.slice(0, 1) || "?";
    button.appendChild(fallback);
  }

  const text = document.createElement("span");
  text.className = "tutor-pin-text";
  const strong = document.createElement("strong");
  strong.textContent = name;
  const price = document.createElement("b");
  price.textContent = `${rate} €`;
  text.appendChild(strong);
  text.appendChild(price);
  button.appendChild(text);

  return button;
}

function pointsOf(tutors: Tutor[]): Point[] {
  const groups = new Map<string, Tutor[]>();
  for (const tutor of tutors) {
    if (tutor.latitude == null || tutor.longitude == null) continue;
    const key = `${tutor.latitude.toFixed(5)}:${tutor.longitude.toFixed(5)}`;
    const group = groups.get(key) ?? [];
    group.push(tutor);
    groups.set(key, group);
  }
  const points: Point[] = [];
  for (const group of groups.values()) {
    group.forEach((tutor, index) => {
      const angle = (Math.PI * 2 * index) / group.length;
      const radius = group.length === 1 ? 0 : 36;
      points.push({
        tutor,
        lat: tutor.latitude!,
        lng: tutor.longitude!,
        dx: Math.round(Math.cos(angle) * radius),
        dy: Math.round(Math.sin(angle) * radius),
      });
    });
  }
  return points;
}

function radiusBounds(lat: number, lng: number, radiusKm: number): [[number, number], [number, number]] {
  const dLat = radiusKm / 111.32;
  const dLng = radiusKm / (111.32 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat + dLat],
  ];
}

export default function TutorMap({
  tutors,
  focus = null,
}: {
  tutors: Tutor[];
  focus?: { lat: number; lng: number; zoom?: number; radiusKm?: number } | null;
}) {
  const router = useRouter();
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const signature = tutors
    .map((tutor) => `${tutor.id}:${tutor.latitude ?? ""}:${tutor.longitude ?? ""}`)
    .join("|");

  useEffect(() => {
    if (!node.current) return;
    let cancelled = false;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !node.current) return;

      const points = pointsOf(tutors);
      const map = new maplibregl.Map({
        container: node.current,
        style: MAP_STYLE,
        center: [4.45, 50.5],
        zoom: 8,
        attributionControl: false,
      });
      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

      if (focus) {
        if (focus.zoom != null) {
          map.jumpTo({ center: [focus.lng, focus.lat], zoom: focus.zoom });
        } else if (focus.radiusKm != null) {
          map.fitBounds(radiusBounds(focus.lat, focus.lng, focus.radiusKm), {
            padding: 16,
            duration: 0,
          });
        } else {
          map.jumpTo({ center: [focus.lng, focus.lat], zoom: 13 });
        }
      } else if (points.length === 1) {
        map.jumpTo({ center: [points[0].lng, points[0].lat], zoom: 12 });
      } else if (points.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        for (const point of points) bounds.extend([point.lng, point.lat]);
        map.fitBounds(bounds, { padding: 64, duration: 0, maxZoom: 14 });
      }

      for (const point of points) {
        const name = firstName(point.tutor.name);
        const rate = formatRate(point.tutor.hourlyRate);
        const el = createPinElement(point.tutor, name, rate);
        el.addEventListener("click", () => router.push(`/tuteur/${point.tutor.id}`));
        new maplibregl.Marker({
          element: el,
          anchor: "center",
          offset: [point.dx, point.dy],
        })
          .setLngLat([point.lng, point.lat])
          .addTo(map);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // signature captures the tutor set shown on the map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, router, focus?.lat, focus?.lng, focus?.zoom, focus?.radiusKm]);

  return (
    <div
      ref={node}
      className="isolate h-[calc(100dvh-19.5rem)] min-h-[360px] w-full rounded-3xl sm:h-[calc(100dvh-13rem)] sm:min-h-[520px]"
    />
  );
}
