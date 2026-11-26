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
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [flipX, setFlipX] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  const oriented = natural
    ? {
        w: rotation % 180 === 0 ? natural.w : natural.h,
        h: rotation % 180 === 0 ? natural.h : natural.w,
      }
    : null;

  function applyZoom(next: number) {
    zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    setZoomState(zoomRef.current);
  }

  function rotateBy(delta: -90 | 90) {
    setRotation((prev) => (((prev + delta + 360) % 360) as 0 | 90 | 180 | 270));
  }

  function resetAll() {
    setRotation(0);
    setFlipX(false);
    applyZoom(1);
    offsetRef.current = { x: 0, y: 0 };
    setOffset(offsetRef.current);
  }

  function applyOffset(x: number, y: number) {
    if (!oriented || stage <= 0) {
      offsetRef.current = { x, y };
      setOffset(offsetRef.current);
      return;
    }
    const laid = layoutOf(oriented.w, oriented.h, stage, zoomRef.current, x, y);
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
    const orientedW = rotation % 180 === 0 ? natural.w : natural.h;
    const orientedH = rotation % 180 === 0 ? natural.h : natural.w;
    const laid = layoutOf(orientedW, orientedH, stage, zoom, offsetRef.current.x, offsetRef.current.y);
    if (laid.offsetX === offsetRef.current.x && laid.offsetY === offsetRef.current.y) return;
    offsetRef.current = { x: laid.offsetX, y: laid.offsetY };
    setOffset(offsetRef.current);
  }, [natural, rotation, stage, zoom]);

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
    if (!img || !oriented || stage <= 0 || busy) return;
    const laid = layoutOf(
      oriented.w,
      oriented.h,
      stage,
      zoomRef.current,
      offsetRef.current.x,
      offsetRef.current.y
    );
    const canvas = document.createElement("canvas");
    const size = 1200;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleOut = size / stage;
    const cx = (laid.left + laid.width / 2) * scaleOut;
    const cy = (laid.top + laid.height / 2) * scaleOut;
    const drawW = (rotation % 180 === 0 ? laid.width : laid.height) * scaleOut;
    const drawH = (rotation % 180 === 0 ? laid.height : laid.width) * scaleOut;

    ctx.save();
    ctx.translate(cx, cy);
    if (flipX) ctx.scale(-1, 1);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    setBusy(true);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      setBusy(false);
      return;
    }
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    onConfirm(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
  }

  const laid = oriented && stage > 0 ? layoutOf(oriented.w, oriented.h, stage, zoom, offset.x, offset.y) : null;
  const imgBoxW = laid ? (rotation % 180 === 0 ? laid.width : laid.height) : 0;
  const imgBoxH = laid ? (rotation % 180 === 0 ? laid.height : laid.width) : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-[0_16px_50px_rgba(15,28,26,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="crop-title" className="font-display text-xl font-bold">
          Ajuster la photo
        </h2>
        <p className="mt-1 text-sm text-black/55">
          Glisse pour recadrer, pivote, retourne ou zoome.
        </p>
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
            <div
              className="absolute"
              style={
                laid
                  ? { left: laid.left, top: laid.top, width: laid.width, height: laid.height }
                  : { visibility: "hidden" }
              }
            >
              {/* Local blob: preview positioned dynamically in px before drawing onto <canvas>; next/image is unsupported here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt=""
                draggable={false}
                onLoad={(event) => {
                  const el = event.currentTarget;
                  setNatural({ w: el.naturalWidth, h: el.naturalHeight });
                }}
                className="absolute top-1/2 left-1/2 max-w-none select-none"
                style={
                  laid
                    ? {
                        width: imgBoxW,
                        height: imgBoxH,
                        transform: `translate(-50%, -50%) scaleX(${flipX ? -1 : 1}) rotate(${rotation}deg)`,
                      }
                    : { visibility: "hidden" }
                }
              />
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => rotateBy(-90)}
            title="Pivoter à gauche"
            className="flex h-10 items-center justify-center gap-1 rounded-2xl border border-black/10 bg-[#f6f7f8] text-xs font-bold text-[#0f1c1a] transition hover:border-[#087a5c]/30 hover:bg-[#e7f6f1] hover:text-[#087a5c]"
          >
            ↺ 90°
          </button>
          <button
            type="button"
            onClick={() => rotateBy(90)}
            title="Pivoter à droite"
            className="flex h-10 items-center justify-center gap-1 rounded-2xl border border-black/10 bg-[#f6f7f8] text-xs font-bold text-[#0f1c1a] transition hover:border-[#087a5c]/30 hover:bg-[#e7f6f1] hover:text-[#087a5c]"
          >
            ↻ 90°
          </button>
          <button
            type="button"
            onClick={() => setFlipX((prev) => !prev)}
            aria-pressed={flipX}
            title="Retourner horizontalement"
            className={`flex h-10 items-center justify-center gap-1 rounded-2xl border text-xs font-bold transition ${
              flipX
                ? "border-[#087a5c] bg-[#e7f6f1] text-[#087a5c]"
                : "border-black/10 bg-[#f6f7f8] text-[#0f1c1a] hover:border-[#087a5c]/30 hover:bg-[#e7f6f1] hover:text-[#087a5c]"
            }`}
          >
            ⇄ Miroir
          </button>
          <button
            type="button"
            onClick={resetAll}
            title="Réinitialiser"
            className="flex h-10 items-center justify-center rounded-2xl border border-black/10 bg-[#f6f7f8] text-xs font-bold text-black/65 transition hover:bg-black/5 hover:text-[#0f1c1a]"
          >
            Reset
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-bold text-black/60">
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)} %</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyZoom(zoom - 0.2)}
              aria-label="Dézoomer"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 text-sm font-extrabold text-[#0f1c1a] hover:bg-[#f6f7f8]"
            >
              −
            </button>
            <input
              type="range"
              aria-label="Zoom"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(event) => applyZoom(Number(event.target.value))}
              className="w-full accent-[#12382c]"
            />
            <button
              type="button"
              onClick={() => applyZoom(zoom + 0.2)}
              aria-label="Zoomer"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 text-sm font-extrabold text-[#0f1c1a] hover:bg-[#f6f7f8]"
            >
              +
            </button>
          </div>
        </div>
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
