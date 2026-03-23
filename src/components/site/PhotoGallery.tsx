"use client";

import {ChevronLeft, ChevronRight, X, ZoomIn} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";

export function PhotoGallery({
  images,
  vehicleTitle,
}: {
  images: string[];
  vehicleTitle: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeThumb, setActiveThumb] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const isOpen = lightboxIndex !== null;

  const close = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? (i > 0 ? i - 1 : images.length - 1) : null
    );
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? (i < images.length - 1 ? i + 1 : 0) : null
    );
  }, [images.length]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (lightboxIndex === null) return;
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[lightboxIndex] as HTMLElement | undefined;
    thumb?.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"});
  }, [lightboxIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, prev, next]);

  if (!images.length) return null;

  const heroSrc = images[activeThumb] ?? images[0];

  return (
    <>
      {/* ── Hero image ── */}
      <div className="w-full overflow-hidden rounded-2xl bg-black">
        <button
          type="button"
          onClick={() => setLightboxIndex(activeThumb)}
          className="group relative block w-full"
          aria-label={`${vehicleTitle} — відкрити у повному розмірі`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt={vehicleTitle}
            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.025] sm:aspect-[16/9]"
          />
          {/* Zoom hint */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/15">
            <div className="scale-75 rounded-full bg-white/90 p-3 opacity-0 shadow-xl backdrop-blur-sm transition duration-300 group-hover:scale-100 group-hover:opacity-100">
              <ZoomIn className="h-5 w-5 text-gray-800" />
            </div>
          </div>
          {/* Counter badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <span>{activeThumb + 1}</span>
              <span className="text-white/40">/</span>
              <span>{images.length}</span>
            </div>
          )}
        </button>
      </div>

      {/* ── Scrollable thumbnail strip ── */}
      {images.length > 1 && (
        <div className="relative mt-2">
          <div
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => {
                  if (i === activeThumb) {
                    setLightboxIndex(i);
                  } else {
                    setActiveThumb(i);
                  }
                }}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition duration-200 ${
                  i === activeThumb
                    ? "border-[var(--color-accent)] opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90"
                }`}
                aria-label={`Фото ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${vehicleTitle} ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          {/* Hint: single click switches main image; double-click or click main opens lightbox */}
        </div>
      )}

      {/* ── Lightbox ── */}
      {isOpen && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[999] flex flex-col bg-black/96 backdrop-blur-md"
          onClick={close}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
            touchStartX.current = null;
          }}
        >
          {/* Top bar */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-sm font-semibold text-white/70">
              {vehicleTitle}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/50">
                {lightboxIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
                aria-label="Закрити"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main image area */}
          <div
            className="relative flex flex-1 items-center justify-center px-12 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${vehicleTitle} ${lightboxIndex + 1}`}
              className="max-h-full max-w-full rounded-xl object-contain"
              draggable={false}
            />

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:left-4"
                  aria-label="Попереднє фото"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:right-4"
                  aria-label="Наступне фото"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Bottom thumbnail strip */}
          {images.length > 1 && (
            <div
              ref={thumbsRef}
              className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-4 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                  }}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition duration-150 ${
                    i === lightboxIndex
                      ? "border-[var(--color-accent)] opacity-100"
                      : "border-white/10 opacity-45 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
