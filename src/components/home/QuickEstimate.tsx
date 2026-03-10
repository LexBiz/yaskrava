"use client";

import {ArrowRight} from "lucide-react";
import {useTranslations} from "next-intl";
import {useMemo, useState} from "react";

import {Link} from "@/i18n/navigation";

const MIN_PRICE = 180_000;
const MAX_PRICE = 3_000_000;
const DOWN_PRIVATE = 0.35;
const MONTHS = 24;

function estimate(price: number, isPrivate: boolean): number {
  const downPct  = isPrivate ? DOWN_PRIVATE : 0.20;
  const down     = price * downPct;
  const P        = price - down;
  const r        = 0.15 / 12;
  const pow      = Math.pow(1 + r, MONTHS);
  return Math.round(Math.max(0, (P * r * pow) / (pow - 1)));
}

const CZK = new Intl.NumberFormat("cs-CZ", {style: "currency", currency: "CZK", maximumFractionDigits: 0});

export function QuickEstimate() {
  const t = useTranslations("QuickEstimate");
  const tCalc = useTranslations("CalculatorUI");

  const [grossPrice, setGrossPrice] = useState(600_000);
  const [priceInput, setPriceInput] = useState("600000");
  const [isPrivate, setIsPrivate] = useState(true);

  const monthly = useMemo(() => estimate(grossPrice, isPrivate), [grossPrice, isPrivate]);
  const pct = Math.round(((grossPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100);

  function handlePriceInput(raw: string) {
    const digits = raw.replace(/\D/g, "");
    setPriceInput(digits);
    const n = Number(digits);
    if (n >= MIN_PRICE && n <= MAX_PRICE) setGrossPrice(n);
  }

  function handlePriceBlur() {
    const n = Number(priceInput.replace(/\D/g, ""));
    const v = Math.max(MIN_PRICE, Math.min(MAX_PRICE, isNaN(n) ? MIN_PRICE : n));
    setGrossPrice(v);
    setPriceInput(String(v));
  }

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
          {(isPrivate ? "35%" : "20%")} {tCalc("downPaymentPct").toLowerCase()} · {MONTHS} {tCalc("termMonths").toLowerCase().replace(/\s/g, "")}
        </p>
        <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setIsPrivate(true)}
            className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition-all"
            style={{background: isPrivate ? "rgba(255,121,24,0.22)" : "transparent"}}
          >
            {tCalc("customerTypePrivate")}
          </button>
          <button
            type="button"
            onClick={() => setIsPrivate(false)}
            className="rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition-all"
            style={{background: !isPrivate ? "rgba(255,121,24,0.22)" : "transparent"}}
          >
            {tCalc("customerTypeBusiness")}
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{color: "rgba(255,255,255,0.45)"}}>
            {t("priceLabel")}
          </span>
          <span className="text-base font-black text-white tabular-nums">
            {CZK.format(grossPrice)}
          </span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={priceInput}
          onChange={e => handlePriceInput(e.target.value)}
          onBlur={handlePriceBlur}
          placeholder={String(MIN_PRICE)}
          className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white tabular-nums outline-none focus:border-[var(--color-accent)] transition-colors mb-2"
        />
        <input
          type="range" className="slider w-full" min={MIN_PRICE} max={MAX_PRICE} step={25_000}
          value={grossPrice} onChange={e => {
            const v = Number(e.target.value);
            setGrossPrice(v);
            setPriceInput(String(v));
          }}
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
          {t("summary")} · {isPrivate ? "35%" : "20%"} {tCalc("downPaymentPct").toLowerCase()} · {MONTHS} {tCalc("termMonths").toLowerCase().replace(/\s/g,"")}
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
