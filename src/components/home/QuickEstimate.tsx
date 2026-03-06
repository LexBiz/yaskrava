"use client";

import {ArrowRight} from "lucide-react";
import {useTranslations} from "next-intl";
import {useMemo, useState} from "react";

import {Link} from "@/i18n/navigation";

function estimate(price: number): number {
  const down     = price * 0.2;
  const residual = price * 0.2;
  const P        = price - down;
  const r        = 0.10 / 12;
  const n        = 48;
  const pow      = Math.pow(1 + r, n);
  return Math.round(Math.max(0, (P * r * pow - residual * r) / (pow - 1)));
}

const CZK = new Intl.NumberFormat("cs-CZ", {
  style: "currency", currency: "CZK", maximumFractionDigits: 0,
});

export function QuickEstimate() {
  const t = useTranslations("QuickEstimate");
  const MIN = 100_000;
  const MAX = 3_000_000;

  const [price, setPrice] = useState(600_000);
  const monthly = useMemo(() => estimate(price), [price]);
  const pct     = Math.round(((price - MIN) / (MAX - MIN)) * 100);

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
      style={{
        background: "linear-gradient(150deg, rgba(255,121,24,0.10) 0%, rgba(255,90,42,0.04) 50%, rgba(255,255,255,0.02) 100%)",
        border: "1.5px solid rgba(255,121,24,0.26)",
        boxShadow:
          "inset 0 1px 0 rgba(255,121,24,0.16)," +
          "0 0 70px -22px rgba(255,121,24,0.32)," +
          "0 32px 80px -32px rgba(0,0,0,0.80)",
      }}
    >
      {/* Header */}
      <div>
        <span className="yask-badge">{t("title")}</span>
        <p className="mt-3 text-sm font-semibold" style={{color: "var(--text-3)"}}>
          {t("assumptions")}
        </p>
      </div>

      {/* Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{color: "var(--text-3)"}}
          >
            {t("priceLabel")}
          </span>
          <span className="text-base font-black text-white tabular-nums">
            {CZK.format(price)}
          </span>
        </div>
        <input
          type="range"
          className="slider w-full"
          min={MIN}
          max={MAX}
          step={25_000}
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
          style={{"--sp": `${pct}%`} as React.CSSProperties}
        />
      </div>

      {/* Result */}
      <div
        className="rounded-xl p-5 text-center"
        style={{
          background: "rgba(0,0,0,0.40)",
          border: "1px solid rgba(255,121,24,0.18)",
          boxShadow: "0 0 40px -16px rgba(255,121,24,0.20)",
        }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{color: "rgba(255,121,24,0.75)"}}
        >
          {t("monthlyLabel")}
        </p>
        <p
          key={Math.round(monthly / 500)}
          className="amount-pop font-black leading-none tabular-nums mt-2"
          style={{
            fontSize: "clamp(2.2rem,5vw,3.2rem)",
            background: "linear-gradient(135deg, #FE9302 0%, #FF7918 50%, #FF5A2A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {CZK.format(monthly)}
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/calculator"
        className="flex items-center justify-between w-full h-12 px-5 rounded-xl text-white text-sm font-bold hover:brightness-105 transition-all"
        style={{
          background: "linear-gradient(135deg, #FE9302 0%, #FF7918 50%, #FF5A2A 100%)",
          boxShadow: "0 4px 28px -8px rgba(255,121,24,0.55)",
        }}
      >
        {t("cta")}
        <ArrowRight size={16}/>
      </Link>
    </div>
  );
}
