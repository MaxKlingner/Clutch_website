"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function photoFileError(file: File) {
  const type = file.type.toLowerCase();
  const ok =
    type === "image/jpeg" ||
    type === "image/jpg" ||
    type === "image/png" ||
    type === "image/webp" ||
    /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!ok) return "La photo doit être en JPG, PNG ou WEBP.";
  if (file.size > 15 * 1024 * 1024) return "La photo dépasse 15 Mo.";
  return null;
}

function layoutOf(
  naturalW: number,
  naturalH: number,
  stage: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  const cover = Math.max(stage / naturalW, stage / naturalH);
  const width = naturalW * cover * zoom;
  const height = naturalH * cover * zoom;
  const maxX = Math.max(0, (width - stage) / 2);
  const maxY = Math.max(0, (height - stage) / 2);
  const x = Math.min(maxX, Math.max(-maxX, offsetX));
  const y = Math.min(maxY, Math.max(-maxY, offsetY));
  const left = (stage - width) / 2 + x;
  const top = (stage - height) / 2 + y;
  const scale = naturalW / width;
  return {
    left,
    top,
    width,
    height,
    offsetX: x,
    offsetY: y,
    sourceX: -left * scale,
    sourceY: -top * (naturalH / height),
    sourceSize: stage * scale,
  };
}

export default function PhotoCropper({
  file,
  shape,
  onCancel,
  onConfirm,
}: {
  file: File;
  shape: "round" | "square";
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [stage, setStage] = useState(0);
  const [zoom, setZoomState] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  function applyZoom(next: number) {
    zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    setZoomState(zoomRef.current);
  }

  function applyOffset(x: number, y: number) {
    if (!natural || stage <= 0) {
      offsetRef.current = { x, y };
      setOffset(offsetRef.current);
      return;
    }
    const laid = layoutOf(natural.w, natural.h, stage, zoomRef.current, x, y);
    offsetRef.current = { x: laid.offsetX, y: laid.offsetY };
    setOffset(offsetRef.current);
  }

  useEffect(() => {
    let active = true;
    const url = URL.createObjectURL(file);
    queueMicrotask(() => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setStage(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      applyZoom(zoomRef.current * (event.deltaY < 0 ? 1.06 : 1 / 1.06));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    if (!natural || stage <= 0) return;
    const laid = layoutOf(natural.w, natural.h, stage, zoom, offsetRef.current.x, offsetRef.current.y);
    if (laid.offsetX === offsetRef.current.x && laid.offsetY === offsetRef.current.y) return;
    offsetRef.current = { x: laid.offsetX, y: laid.offsetY };
    setOffset(offsetRef.current);
  }, [natural, stage, zoom]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      pinchRef.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        zoom: zoomRef.current,
      };
      dragRef.current = null;
      return;
    }
    dragRef.current = {
      px: event.clientX,
      py: event.clientY,
      ox: offsetRef.current.x,
      oy: offsetRef.current.y,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      applyZoom(pinchRef.current.zoom * (dist / pinchRef.current.dist));
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    applyOffset(drag.ox + (event.clientX - drag.px), drag.oy + (event.clientY - drag.py));
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  }

  async function confirm() {
    const img = imgRef.current;
    if (!img || !natural || stage <= 0 || busy) return;
    const laid = layoutOf(natural.w, natural.h, stage, zoomRef.current, offsetRef.current.x, offsetRef.current.y);
    const sourceSize = Math.min(laid.sourceSize, natural.w, natural.h);
    const sourceX = Math.max(0, Math.min(laid.sourceX, natural.w - sourceSize));
    const sourceY = Math.max(0, Math.min(laid.sourceY, natural.h - sourceSize));
    const canvas = document.createElement("canvas");
    const size = 1200;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
    setBusy(true);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      setBusy(false);
      return;
    }
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    onConfirm(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
  }

  const laid = natural && stage > 0 ? layoutOf(natural.w, natural.h, stage, zoom, offset.x, offset.y) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-title"
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-[0_16px_50px_rgba(15,28,26,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="crop-title" className="font-display text-xl font-bold">
          Recadrer la photo
        </h2>
        <p className="mt-1 text-sm text-black/55">Glisse pour déplacer, puis zoome.</p>
        <div
          ref={boxRef}
          className={`relative mt-4 aspect-square w-full cursor-grab touch-none overflow-hidden bg-[#dfe7e3] active:cursor-grabbing ${
            shape === "round" ? "rounded-full" : "rounded-3xl"
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src ? (
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={(event) => {
                const el = event.currentTarget;
                setNatural({ w: el.naturalWidth, h: el.naturalHeight });
              }}
              className="absolute max-w-none select-none"
              style={
                laid
                  ? { left: laid.left, top: laid.top, width: laid.width, height: laid.height }
                  : { visibility: "hidden" }
              }
            />
          ) : null}
        </div>
        <label className="mt-4 block text-sm font-semibold text-black/70">
          Zoom
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(event) => applyZoom(Number(event.target.value))}
            className="mt-2 w-full accent-[#12382c]"
          />
        </label>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-full border border-black/10 text-sm font-extrabold"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!natural || busy}
            className="h-11 flex-1 rounded-full bg-[#12382c] text-sm font-extrabold text-white disabled:opacity-60"
          >
            {busy ? "…" : "Utiliser cette photo"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
