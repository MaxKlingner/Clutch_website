"use client";

import { useEffect, useRef, useState } from "react";
import { LEVEL_GROUPS, PRICE_STEPS, RADIUS_STEPS } from "@/components/site/filters";

const FORMATS = ["Face à face", "À distance"] as const;

type Panel = "format" | "level" | "price" | "distance" | null;

function toggleValue(current: string[], value: string) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export default function FilterBar({
  formats,
  levels,
  maxRate,
  radiusKm,
  geoState,
  onFormats,
  onLevels,
  onMaxRate,
  onRadius,
}: {
  formats: string[];
  levels: string[];
  maxRate: number | null;
  radiusKm: number | null;
  geoState: "idle" | "pending" | "denied";
  onFormats: (value: string[]) => void;
  onLevels: (value: string[]) => void;
  onMaxRate: (value: number | null) => void;
  onRadius: (value: number | null) => void;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setPanel(null);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [panel]);

  const formatLabel =
    formats.length === 1 ? formats[0] : formats.length > 1 ? `Format · ${formats.length}` : "Format";
  const selectedLevels = LEVEL_GROUPS.filter((group) => levels.includes(group.id));
  const levelLabel =
    selectedLevels.length === 1
      ? selectedLevels[0].label
      : selectedLevels.length > 1
        ? `Niveau · ${selectedLevels.length}`
        : "Niveau";
  const priceLabel = maxRate != null ? `${maxRate} €/h` : "Tarif";
  const distanceLabel =
    geoState === "pending" && radiusKm != null
      ? "Localisation…"
      : radiusKm != null
        ? `${radiusKm} km`
        : "Distance";

  const chips: { key: Exclude<Panel, null>; label: string; active: boolean }[] = [
    { key: "format", label: formatLabel, active: formats.length > 0 },
    { key: "level", label: levelLabel, active: levels.length > 0 },
    { key: "price", label: priceLabel, active: maxRate != null },
    { key: "distance", label: distanceLabel, active: radiusKm != null },
  ];

  return (
    <div ref={root} className="relative z-40 flex min-w-0 flex-1 gap-2 overflow-visible">
      {chips.map((chip, index) => (
        <div key={chip.key} className="relative min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={panel === chip.key}
            onClick={() => setPanel((current) => (current === chip.key ? null : chip.key))}
            className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
              chip.active
                ? "border-[#12382c] bg-[#12382c] text-white"
                : "border-black/10 bg-white text-black/70"
            }`}
          >
            <span className="truncate">{chip.label}</span>
            <span className="ml-1 shrink-0 text-[10px] opacity-60">
              {panel === chip.key ? "▴" : "▾"}
            </span>
          </button>
          {panel === chip.key ? (
            <div
              className={`absolute top-[calc(100%+8px)] z-50 w-56 rounded-2xl bg-white p-2 shadow-[0_18px_50px_rgba(15,28,26,0.14)] ring-1 ring-black/5 ${
                index >= chips.length - 2 ? "right-0" : "left-0"
              }`}
            >
              {chip.key === "format"
                ? FORMATS.map((item) => (
                    <Choice
                      key={item}
                      active={formats.includes(item)}
                      onClick={() => onFormats(toggleValue(formats, item))}
                    >
                      {item}
                    </Choice>
                  ))
                : null}
              {chip.key === "level"
                ? LEVEL_GROUPS.map((group) => (
                    <Choice
                      key={group.id}
                      active={levels.includes(group.id)}
                      onClick={() => onLevels(toggleValue(levels, group.id))}
                    >
                      {group.label}
                    </Choice>
                  ))
                : null}
              {chip.key === "price" ? (
                <StepSlider
                  steps={[...PRICE_STEPS, null]}
                  value={maxRate}
                  onChange={onMaxRate}
                  minLabel="15 €"
                  maxLabel="Tout"
                  format={(step) => (step == null ? "Tout" : `${step} € max`)}
                />
              ) : null}
              {chip.key === "distance" ? (
                <>
                  <StepSlider
                    steps={[...RADIUS_STEPS, null]}
                    value={radiusKm}
                    onChange={onRadius}
                    minLabel="5 km"
                    maxLabel="Illimité"
                    format={(step) => (step == null ? "Illimité" : `${step} km`)}
                  />
                  {geoState === "denied" && radiusKm != null ? (
                    <p className="px-3 pb-2 text-xs leading-5 text-black/50">
                      Autorisation refusée par le navigateur.
                    </p>
                  ) : (
                    <p className="px-3 pb-2 text-xs leading-5 text-black/45">
                      Limite les profils autour de ta position.
                    </p>
                  )}
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function StepSlider({
  steps,
  value,
  onChange,
  format,
  minLabel,
  maxLabel,
}: {
  steps: readonly (number | null)[];
  value: number | null;
  onChange: (value: number | null) => void;
  format: (value: number | null) => string;
  minLabel: string;
  maxLabel: string;
}) {
  const index = Math.max(
    0,
    steps.findIndex((step) => step === value)
  );
  return (
    <div className="px-3 pt-2 pb-1">
      <p className="text-center text-sm font-extrabold text-[#12382c]">{format(steps[index] ?? null)}</p>
      <input
        type="range"
        min={0}
        max={steps.length - 1}
        step={1}
        value={index}
        aria-valuetext={format(steps[index] ?? null)}
        onChange={(event) => onChange(steps[Number(event.target.value)] ?? null)}
        className="mt-3 h-1.5 w-full cursor-pointer accent-[#0d9f7a]"
      />
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-black/45">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold ${
        active ? "bg-[#e7f6f1] text-[#087a5c]" : "text-[#1c1c1c] hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}
