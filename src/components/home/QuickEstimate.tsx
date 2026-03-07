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

const CZK = new Intl.NumberFormat("cs-CZ", {style: "currency", currency: "CZK", maximumFractionDigits: 0});

export function QuickEstimate() {
  const t = useTranslations("QuickEstimate");
  const MIN = 100_000;
  const MAX = 3_000_000;

  const [price, setPrice] = useState(600_000);
  const monthly = useMemo(() => estimate(price), [price]);
  const pct = Math.round(((price - MIN) / (MAX - MIN)) * 100);

  return (
    <div
      className="relative rounded-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, rgba(255,153,2,0.16) 0%, rgba(255,121,24,0.10) 45%, rgba(255,255,255,0.04) 100%)",
        border: "1.5px solid rgba(255,121,24,0.35)",
        boxShadow:
          "inset 0 1px 0 rgba(255,200,100,0.22)," +
          "0 0 80px -22px rgba(255,121,24,0.40)," +
          "0 40px 80px -32px rgba(0,0,0,0.55)",
      }}
    >
      {/* Corner glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{background: "radial-gradient(circle, rgba(255,153,2,0.20) 0%, transparent 70%)"}}
      />

      <div className="relative">
        <span className="yask-badge">{t("title")}</span>
        <p className="mt-3 text-sm font-medium" style={{color: "rgba(255,255,255,0.45)"}}>
          {t("assumptions")}
        </p>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{color: "rgba(255,255,255,0.45)"}}>
            {t("priceLabel")}
          </span>
          <span className="text-base font-black text-white tabular-nums">
            {CZK.format(price)}
          </span>
        </div>
        <input
          type="range" className="slider w-full" min={MIN} max={MAX} step={25_000}
          value={price} onChange={e => setPrice(Number(e.target.value))}
          style={{"--sp": `${pct}%`} as React.CSSProperties}
        />
      </div>

      {/* Result */}
      <div className="relative rounded-xl p-5 text-center overflow-hidden"
        style={{
          background: "rgba(44,44,46,0.85)",
          border: "1px solid rgba(255,121,24,0.28)",
          boxShadow: "inset 0 1px 0 rgba(255,121,24,0.18)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,121,24,0.12) 0%, transparent 70%)"}}
        />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{color: "rgba(255,153,2,0.80)"}}>
          {t("monthlyLabel")}
        </p>
        <p
          key={Math.round(monthly / 500)}
          className="relative amount-pop font-black leading-none tabular-nums mt-2 text-gradient-brand"
          style={{fontSize: "clamp(2.0rem, 4.5vw, 3.0rem)"}}
        >
          {CZK.format(monthly)}
        </p>
        <p className="relative mt-2 text-xs" style={{color: "rgba(255,255,255,0.38)"}}>
          за місяць · 20% аванс · 48 міс
        </p>
      </div>

      <Link
        href="/calculator"
        className="relative flex items-center justify-between w-full h-12 px-5 rounded-xl text-white text-sm font-bold hover:brightness-108 transition-all"
        style={{
          background: "linear-gradient(135deg, #FF7918 0%, #FF9902 100%)",
          boxShadow: "0 4px 28px -6px rgba(255,121,24,0.65), 0 1px 0 rgba(255,255,255,0.22) inset",
        }}
      >
        {t("cta")}
        <ArrowRight size={16}/>
      </Link>
    </div>
  );
}
