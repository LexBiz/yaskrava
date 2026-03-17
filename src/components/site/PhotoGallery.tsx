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
  const touchStartX = useRef<number | null>(null);

  const isOpen = lightboxIndex !== null;

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i !== null ? (i > 0 ? i - 1 : images.length - 1) : null
      ),
    [images.length]
  );
  const next = useCallback(
    () =>
      setLightboxIndex((i) =>
        i !== null ? (i < images.length - 1 ? i + 1 : 0) : null
      ),
    [images.length]
  );

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

  const [primary, ...rest] = images;

  return (
    <>
      {/* Primary image */}
      <button
        type="button"
        onClick={() => setLightboxIndex(0)}
        className="group relative block h-[380px] w-full overflow-hidden rounded-3xl border border-gray-200 bg-white"
        aria-label={`${vehicleTitle} — відкрити фото`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primary}
          alt={vehicleTitle}
          className="h-[380px] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/20">
          <div className="scale-75 rounded-full bg-white/80 p-3 opacity-0 shadow-lg backdrop-blur-sm transition duration-300 group-hover:scale-100 group-hover:opacity-100">
            <ZoomIn className="h-6 w-6 text-gray-800" />
          </div>
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            1 / {images.length}
          </div>
        )}
      </button>

      {/* Thumbnail grid */}
      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {rest.slice(0, 7).map((url, idx) => (
            <button
              key={url}
              type="button"
              onClick={() => setLightboxIndex(idx + 1)}
              className="group relative h-16 overflow-hidden rounded-xl border border-gray-200 bg-white"
              aria-label={`Фото ${idx + 2}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${vehicleTitle} ${idx + 2}`}
                className="h-16 w-full object-cover transition duration-300 group-hover:scale-[1.06]"
                loading="lazy"
              />
              {idx === 6 && rest.length > 7 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">
                  +{rest.length - 7}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox overlay */}
      {isOpen && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/92 backdrop-blur-md"
          onClick={close}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            if (Math.abs(dx) > 50) {
              dx < 0 ? next() : prev();
            }
            touchStartX.current = null;
          }}
        >
          {/* Content wrapper — stops click from bubbling */}
          <div
            className="relative flex h-full w-full flex-col items-center justify-center px-4 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
              aria-label="Закрити"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${vehicleTitle} ${lightboxIndex + 1}`}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
              draggable={false}
            />

            {/* Counter */}
            <div className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:left-4"
                  aria-label="Попереднє фото"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:right-4"
                  aria-label="Наступне фото"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
