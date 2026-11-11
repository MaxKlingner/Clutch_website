"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { useRouter } from "next/navigation";
import { firstName, formatRate } from "@/components/site/TutorCard";
import type { Tutor } from "@/lib/db";

type Point = { tutor: Tutor; lat: number; lng: number; dx: number; dy: number };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeImageUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith("/") || /^https?:\/\//i.test(url) || url.startsWith("blob:")) return url;
  return null;
}

function pinHtml(tutor: Tutor, name: string, rate: string, dx: number, dy: number) {
  const safeName = escapeHtml(name);
  const avatar = safeImageUrl(tutor.avatarUrl);
  const photo = avatar
    ? `<img src="${escapeHtml(avatar)}" alt="" />`
    : `<span class="tutor-pin-fallback">${escapeHtml(name.slice(0, 1) || "?")}</span>`;
  const shift = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  return `<span class="tutor-pin-label" style="transform:${shift}">${photo}<span class="tutor-pin-text"><strong>${safeName}</strong><b>${escapeHtml(rate)} €</b></span></span>`;
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

export default function TutorMap({
  tutors,
  focus = null,
}: {
  tutors: Tutor[];
  focus?: { lat: number; lng: number; zoom?: number; radiusKm?: number } | null;
}) {
  const router = useRouter();
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const signature = tutors
    .map((tutor) => `${tutor.id}:${tutor.latitude ?? ""}:${tutor.longitude ?? ""}`)
    .join("|");

  useEffect(() => {
    if (!node.current) return;
    let cancelled = false;
    let timer = 0;

    (async () => {
      const loaded = (await import("leaflet")) as typeof import("leaflet") & {
        default?: typeof import("leaflet");
      };
      const L = typeof loaded.map === "function" ? loaded : loaded.default;
      if (!L || cancelled || !node.current) return;
      if (cancelled || !node.current) return;

      const map = L.map(node.current, { scrollWheelZoom: true, zoomSnap: 0, zoomDelta: 1 });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const points = pointsOf(tutors);
      for (const point of points) {
        const name = firstName(point.tutor.name);
        const rate = formatRate(point.tutor.hourlyRate);
        const icon = L.divIcon({
          className: "tutor-pin",
          html: pinHtml(point.tutor, name, rate, point.dx, point.dy),
          iconSize: [1, 1],
          iconAnchor: [0, 0],
        });
        const marker = L.marker([point.lat, point.lng], { icon, title: name }).addTo(map);
        marker.on("click", () => router.push(`/tuteur/${point.tutor.id}`));
      }

      const frame = () => {
        if (focus) {
          if (focus.zoom != null) {
            map.setView([focus.lat, focus.lng], focus.zoom);
          } else if (focus.radiusKm != null) {
            map.fitBounds(L.latLng(focus.lat, focus.lng).toBounds(focus.radiusKm * 2000), {
              padding: [8, 8],
            });
          } else {
            map.setView([focus.lat, focus.lng], 13);
          }
        } else if (points.length === 1) {
          map.setView([points[0].lat, points[0].lng], 12);
        } else if (points.length > 1) {
          map.fitBounds(
            L.latLngBounds(points.map((point) => [point.lat, point.lng])),
            { padding: [48, 48] }
          );
        } else {
          map.setView([50.5, 4.45], 8);
        }
      };
      frame();
      timer = window.setTimeout(() => {
        if (cancelled) return;
        map.invalidateSize();
        frame();
      }, 50);
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
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
