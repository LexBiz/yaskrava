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
      className="relative rounded-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, rgba(254,147,2,0.13) 0%, rgba(255,121,24,0.07) 40%, rgba(255,90,42,0.03) 70%, rgba(16,14,11,0) 100%)",
        border: "1px solid rgba(254,147,2,0.28)",
        boxShadow:
          "inset 0 1px 0 rgba(255,210,120,0.18)," +
          "0 0 0 1px rgba(255,90,42,0.06)," +
          "0 0 80px -22px rgba(255,121,24,0.36)," +
          "0 40px 80px -32px rgba(0,0,0,0.85)",
      }}
    >
      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Corner glow */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{background: "radial-gradient(circle, rgba(254,147,2,0.18) 0%, transparent 70%)"}}
      />

      {/* Header */}
      <div className="relative">
        <span className="yask-badge">{t("title")}</span>
        <p className="mt-3 text-sm font-medium" style={{color: "var(--text-3)"}}>
          {t("assumptions")}
        </p>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{color: "var(--text-3)"}}>
            {t("priceLabel")}
          </span>
          <span className="text-base font-black tabular-nums" style={{color: "var(--text-1)"}}>
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

      {/* Result panel */}
      <div
        className="relative rounded-xl p-5 text-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(20,14,8,0.70) 100%)",
          border: "1px solid rgba(254,147,2,0.20)",
          boxShadow: "inset 0 1px 0 rgba(254,147,2,0.12)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(254,147,2,0.10) 0%, transparent 70%)",
          }}
        />

        <p
          className="relative text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{color: "rgba(254,147,2,0.75)"}}
        >
          {t("monthlyLabel")}
        </p>
        <p
          key={Math.round(monthly / 500)}
          className="relative amount-pop font-black leading-none tabular-nums mt-2"
          style={{
            fontSize: "clamp(2.0rem, 4.5vw, 3.0rem)",
            background: "linear-gradient(135deg, #FE9302 0%, #FF9A30 40%, #FF5A2A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 18px rgba(255,121,24,0.40))",
          }}
        >
          {CZK.format(monthly)}
        </p>
        <p className="relative mt-2 text-xs" style={{color: "var(--text-3)"}}>
          за місяць · 20% аванс · 48 міс
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/calculator"
        className="relative flex items-center justify-between w-full h-12 px-5 rounded-xl text-white text-sm font-bold hover:brightness-105 transition-all"
        style={{
          background: "linear-gradient(135deg, #FE9302 0%, #FF7918 50%, #FF5A2A 100%)",
          boxShadow:
            "0 4px 28px -8px rgba(255,121,24,0.60)," +
            "0 1px 0 rgba(255,220,140,0.22) inset",
        }}
      >
        {t("cta")}
        <ArrowRight size={16}/>
      </Link>
    </div>
  );
}
