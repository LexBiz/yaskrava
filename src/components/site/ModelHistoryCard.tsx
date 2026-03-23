"use client";

import {useEffect, useState} from "react";

interface Props {
  make: string | null;
  model: string | null;
  year: number | null;
  locale: string;
}

export function ModelHistoryCard({make, model, year, locale}: Props) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!make || !model) { setLoading(false); return; }

    const cacheKey = `model-history:${make}:${model}:${year ?? ""}:${locale}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setText(cached);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({make, model, locale});
    if (year) params.set("year", String(year));

    fetch(`/api/model-history?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.text) {
          sessionStorage.setItem(cacheKey, data.text);
          setText(data.text);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [make, model, year, locale]);

  if (!make || !model) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{background: "rgba(255,121,24,0.05)", border: "1px solid rgba(255,121,24,0.15)"}}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">✦</span>
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{color: "rgba(255,121,24,0.8)"}}
        >
          {make} {model}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full" style={{background: "rgba(255,255,255,0.07)"}} />
          <div className="h-3 w-4/5 animate-pulse rounded-full" style={{background: "rgba(255,255,255,0.07)"}} />
          <div className="h-3 w-3/5 animate-pulse rounded-full" style={{background: "rgba(255,255,255,0.07)"}} />
        </div>
      ) : text ? (
        <p className="text-sm leading-6" style={{color: "rgba(255,255,255,0.72)"}}>
          {text}
        </p>
      ) : null}

      {/* Decorative accent */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl"
        style={{background: "rgba(255,121,24,0.12)"}}
      />
    </div>
  );
}
