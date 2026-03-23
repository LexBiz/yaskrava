"use client";

import {ChevronLeft, ChevronRight, X, ZoomIn} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";

/* ─── iOS-safe scroll lock ────────────────────────────────────────────────── */
function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.overflow = "hidden";
  document.body.dataset.scrollY = String(scrollY);
}
function unlockBodyScroll() {
  const scrollY = Number(document.body.dataset.scrollY ?? 0);
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.overflow = "";
  delete document.body.dataset.scrollY;
  window.scrollTo(0, scrollY);
}

export function PhotoGallery({
  images,
  vehicleTitle,
}: {
  images: string[];
  vehicleTitle: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeThumb, setActiveThumb] = useState(0);
  const lbThumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  /* Scroll active thumbnail into view */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const container = lbThumbsRef.current;
    if (!container) return;
    const thumb = container.children[lightboxIndex] as HTMLElement | undefined;
    thumb?.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"});
  }, [lightboxIndex]);

  /* Keyboard + iOS-safe body scroll lock */
  useEffect(() => {
    if (!isOpen) return;

    lockBodyScroll();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
      unlockBodyScroll();
    };
  }, [isOpen, close, prev, next]);

  if (!images.length) return null;

  const heroSrc = images[activeThumb] ?? images[0];

  return (
    <>
      {/* ── Hero preview ── */}
      <div className="w-full overflow-hidden rounded-2xl bg-[#0d0d0f]">
        <button
          type="button"
          onClick={() => setLightboxIndex(activeThumb)}
          className="group relative block w-full aspect-[4/3] sm:aspect-[16/10]"
          aria-label="Open fullscreen gallery"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt={vehicleTitle}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            style={{objectPosition: "center center"}}
          />
          {/* Tap hint — always visible on touch (not just hover) */}
          <div className="absolute inset-0 flex items-end justify-end p-3">
            <div className="flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <ZoomIn className="h-3.5 w-3.5" />
              {images.length > 1 && (
                <span>{activeThumb + 1} / {images.length}</span>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => {
                if (i === activeThumb) setLightboxIndex(i);
                else setActiveThumb(i);
              }}
              className={`relative aspect-[3/2] w-16 shrink-0 overflow-hidden rounded-lg border-2 transition duration-200 sm:w-20 ${
                i === activeThumb
                  ? "border-[var(--color-accent)] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${vehicleTitle} ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox — truly fullscreen, works on iOS ── */}
      {isOpen && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{
            background: "rgba(0,0,0,0.97)",
            /* iOS Safari needs height: -webkit-fill-available fallback */
            height: "100dvh",
            /* Prevent any internal overflow from creating scrollbars */
            overflow: "hidden",
            /* Prevent iOS rubber-band scrolling on the overlay itself */
            overscrollBehavior: "none",
            touchAction: "none",
          }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
            touchStartY.current = e.touches[0]?.clientY ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || touchStartY.current === null) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            const dy = (e.changedTouches[0]?.clientY ?? 0) - touchStartY.current;
            /* Only swipe horizontally if horizontal movement dominates */
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
              dx < 0 ? next() : prev();
            }
            touchStartX.current = null;
            touchStartY.current = null;
          }}
          onTouchMove={(e) => e.preventDefault()}
        >
          {/* ── Top bar (48px) ── */}
          <div
            className="flex h-12 shrink-0 items-center justify-between px-4"
            style={{borderBottom: "1px solid rgba(255,255,255,0.08)"}}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate text-sm font-semibold text-white/70 pr-4">
              {vehicleTitle}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-white/50">
                {lightboxIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition active:bg-white/25 hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── Main image (flex-1 → fills all remaining height) ── */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            style={{touchAction: "none"}}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${vehicleTitle} ${lightboxIndex + 1}`}
              className="rounded-lg object-contain"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                /* Padding via max dimensions to leave room for nav buttons */
                padding: "0 52px",
                boxSizing: "border-box",
              }}
              draggable={false}
            />

            {/* Nav buttons — large touch targets */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition active:bg-white/30 hover:bg-white/20 sm:left-3"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition active:bg-white/30 hover:bg-white/20 sm:right-3"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* ── Bottom thumbnails (72px) ── */}
          {images.length > 1 && (
            <div
              ref={lbThumbsRef}
              className="flex h-[72px] shrink-0 items-center gap-2 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{borderTop: "1px solid rgba(255,255,255,0.07)", touchAction: "pan-x"}}
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition duration-150 ${
                    i === lightboxIndex
                      ? "border-[var(--color-accent)] opacity-100"
                      : "border-white/10 opacity-45 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
