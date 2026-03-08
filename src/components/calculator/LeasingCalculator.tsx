"use client";

import {ArrowRight, Check, Copy} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {useMemo, useState} from "react";

import {useRouter} from "@/i18n/navigation";
import type {CalculatorSnapshot} from "@/lib/applicationSchema";

/* ═══════════════════════════════════════════
   MATH
═══════════════════════════════════════════ */

function pmt(P: number, r: number, n: number, FV: number): number {
  if (n <= 0) return 0;
  if (r === 0) return (P - FV) / n;
  const pow = Math.pow(1 + r, n);
  return (P * r * pow - FV * r) / (pow - 1);
}

function localeTag(locale: string) {
  if (locale === "cs") return "cs-CZ";
  if (locale === "uk") return "uk-UA";
  return "en-US";
}

/* ═══════════════════════════════════════════
   CAR SLIDER — the showpiece
═══════════════════════════════════════════ */

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange(v: number): void;
}

/* The car IS the thumb — via CSS background-image in globals.css */
function SliderField({label, value, min, max, step, display, onChange}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
          style={{ color: "var(--text-3)" }}
        >
          {label}
        </span>
        <span className="text-base font-black text-white tabular-nums">{display}</span>
      </div>

      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ "--sp": `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUMMARY ROW
═══════════════════════════════════════════ */

function Row({label, value, bold}: {label: string; value: string; bold?: boolean}) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text-2)" }}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? "font-extrabold text-white" : "font-semibold text-white/90"}`}>
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BREAKDOWN BAR
═══════════════════════════════════════════ */

function BreakdownBar({
  down,
  principal,
  interest,
  labels,
}: {
  down: number;
  principal: number;
  interest: number;
  labels: {down: string; principal: string; interest: string};
}) {
  const total = down + principal + interest;
  if (total === 0) return null;

  const seg = (v: number) => `${Math.max(0, (v / total) * 100).toFixed(1)}%`;

  return (
    <div>
      {/* Bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-[2px]">
        <div className="bar-seg rounded-l-full" style={{ width: seg(down),      background: "rgba(255,255,255,0.22)" }} />
        <div className="bar-seg"               style={{ width: seg(principal), background: "rgba(255,121,24,0.35)" }} />
        <div className="bar-seg"               style={{ width: seg(interest),  background: "#FF7918" }} />
        <div className="bar-seg rounded-r-full" style={{ width: seg(interest),  background: "#FF7918" }} />
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-3)" }}
      >
        <Leg color="rgba(255,255,255,0.22)" label={labels.down} />
        <Leg color="rgba(255,121,24,0.35)" label={labels.principal} />
        <Leg color="#FF7918" label={labels.interest} />
      </div>
    </div>
  );
}

function Leg({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */

type Props = {
  initialPrice?: number;
  lockPrice?: boolean;
  vehicleTitle?: string;
};

type CustomerType = "PRIVATE" | "BUSINESS";

export function LeasingCalculator({
  initialPrice = 600_000,
  lockPrice = false,
  vehicleTitle,
}: Props) {
  const t      = useTranslations("CalculatorUI");
  const locale = useLocale();
  const router = useRouter();

  /* State */
  const [price,       setPrice]       = useState(initialPrice);
  const [customerType, setCustomerType] = useState<CustomerType>("PRIVATE");
  const [downPct,     setDownPct]     = useState(20);
  const [months,      setMonths]      = useState(48);
  const [copied,      setCopied]      = useState(false);

  const apr = 15;
  const minDownPct = customerType === "BUSINESS" ? 10 : 20;
  function selectCustomerType(nextType: CustomerType) {
    const nextMinDown = nextType === "BUSINESS" ? 10 : 20;
    setCustomerType(nextType);
    setDownPct((current) => Math.max(current, nextMinDown));
  }


  /* CZK formatter */
  const czk = useMemo(
    () => new Intl.NumberFormat(localeTag(locale), {
      style: "currency", currency: "CZK", maximumFractionDigits: 0,
    }),
    [locale],
  );

  const priceWithoutVat = useMemo(() => Math.round(price / 1.21), [price]);

  /* Computation */
  const r = useMemo(() => {
    const down     = Math.round((price * downPct)     / 100);
    const principal = Math.max(0, price - down);
    const rMonthly = apr / 100 / 12;

    const residual = 0;
    const monthly      = Math.round(Math.max(0, pmt(principal, rMonthly, months, residual)));
    const monthlyTotal = monthly;
    const totalPaid    = monthly * months + down;
    const totalInterest = Math.max(0, totalPaid - price);

    return { down, residual, principal, monthly, monthlyTotal, totalPaid, totalInterest };
  }, [price, downPct, months, apr]);

  /* Snapshot */
  const snapshot: CalculatorSnapshot = {
    priceCzk: price, downPaymentCzk: r.down, termMonths: months,
    aprPercent: apr, residualCzk: 0, monthlyFeesCzk: 0,
    monthlyPaymentCzk: r.monthly, monthlyTotalCzk: r.monthlyTotal,
  };

  /* Month label */
  const monthLabel =
    locale === "cs" ? `${months} měs.` :
    locale === "uk" ? `${months} міс.` :
    `${months} mo.`;

  function handleCopy() {
    navigator.clipboard.writeText([
      "YASKRAVA · Leasing estimate",
      `${t("price")}: ${czk.format(price)}`,
      `${t("priceWithoutVat")}: ${czk.format(priceWithoutVat)}`,
      `${t("customerType")}: ${customerType === "BUSINESS" ? t("customerTypeBusiness") : t("customerTypePrivate")}`,
      `${t("downPaymentPct")}: ${downPct}% · ${czk.format(r.down)}`,
      `${t("termMonths")}: ${months}`,
      `${t("apr")}: ${apr}%`,
      `${t("monthlyTotal")}: ${czk.format(r.monthlyTotal)}`,
    ].join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleApply() {
    localStorage.setItem("yaskrava_calc", JSON.stringify(snapshot));
    router.push("/apply");
  }

  return (
    <div
      className="grid lg:grid-cols-[1fr_1.15fr] overflow-hidden rounded-2xl"
      style={{ border: "1.5px solid var(--border-md)" }}
    >

      {/* ══ LEFT: Inputs ══════════════════════════════════════ */}
      <div className="yask-calc-inputs p-7 sm:p-9 space-y-6">
        <div>
          <div className="section-accent-line mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--text-3)" }}>
            {t("inputsTitle")}
          </p>
          {vehicleTitle ? (
            <p className="mt-3 text-sm font-semibold text-white">{vehicleTitle}</p>
          ) : null}
          <p className="mt-2 text-xs text-white/60">{t("fixedAprNote")}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "var(--text-3)" }}>
              {t("customerType")}
            </span>
            <span className="text-sm font-semibold text-white">
              {customerType === "BUSINESS" ? t("customerTypeBusiness") : t("customerTypePrivate")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => selectCustomerType("PRIVATE")}
              className="h-11 rounded-2xl border text-sm font-semibold transition-all"
              style={{
                borderColor: customerType === "PRIVATE" ? "var(--color-accent)" : "var(--border-md)",
                background: customerType === "PRIVATE" ? "rgba(255,121,24,0.18)" : "rgba(255,255,255,0.04)",
                color: "#fff",
              }}
            >
              {t("customerTypePrivate")}
            </button>
            <button
              type="button"
              onClick={() => selectCustomerType("BUSINESS")}
              className="h-11 rounded-2xl border text-sm font-semibold transition-all"
              style={{
                borderColor: customerType === "BUSINESS" ? "var(--color-accent)" : "var(--border-md)",
                background: customerType === "BUSINESS" ? "rgba(255,121,24,0.18)" : "rgba(255,255,255,0.04)",
                color: "#fff",
              }}
            >
              {t("customerTypeBusiness")}
            </button>
          </div>
        </div>

        {lockPrice ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "var(--text-3)" }}>
                {t("price")}
              </span>
              <span className="text-base font-black text-white tabular-nums">{czk.format(price)}</span>
            </div>
            <div className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 flex items-center text-white/80 text-sm">
              {czk.format(price)}
            </div>
            <div className="mt-2 text-xs text-white/55">
              {t("priceWithoutVat")}: <span className="font-semibold text-white">{czk.format(priceWithoutVat)}</span>
            </div>
          </div>
        ) : (
          <SliderField
            label={t("price")}
            value={price}
            min={50_000}
            max={3_000_000}
            step={10_000}
            display={czk.format(price)}
            onChange={setPrice}
          />
        )}

        {!lockPrice ? (
          <div className="text-xs text-white/55 -mt-3">
            {t("priceWithoutVat")}: <span className="font-semibold text-white">{czk.format(priceWithoutVat)}</span>
          </div>
        ) : null}

        <SliderField
          label={t("downPaymentPct")}
          value={downPct}
          min={minDownPct}
          max={90}
          step={1}
          display={`${downPct}% · ${czk.format(r.down)}`}
          onChange={setDownPct}
        />

        <div className="text-xs text-white/55 -mt-3">
          {customerType === "BUSINESS" ? t("downPaymentBusinessHint") : t("downPaymentPrivateHint")}
        </div>

        <SliderField
          label={t("termMonths")}
          value={months}
          min={12}
          max={60}
          step={12}
          display={monthLabel}
          onChange={setMonths}
        />

        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
          {t("disclaimer")}
        </p>
      </div>

      {/* ══ RIGHT: Results ════════════════════════════════════ */}
      <div className="yask-calc-results p-7 sm:p-9 flex flex-col gap-6">

        {/* Preliminary payment */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4"
            style={{ color: "rgba(255,121,24,0.75)" }}
          >
            {t("preliminaryPayment")}
          </p>

          <p
            key={Math.round(r.monthlyTotal / 500)}
            className="amount-pop text-gradient-accent font-black leading-none tabular-nums"
            style={{ fontSize: "clamp(2.8rem, 5vw, 3.8rem)" }}
          >
            {czk.format(r.monthlyTotal)}
          </p>

          <p className="mt-2 text-sm" style={{ color: "var(--text-2)" }}>
            {t("fixedAprBadge")}: <span className="font-semibold text-white">15%</span>
          </p>
          <p className="mt-1 text-xs text-white/55">
            {t("priceWithoutVat")}: <span className="font-semibold text-white">{czk.format(priceWithoutVat)}</span>
          </p>
        </div>

        {/* Breakdown bar — animated */}
        <BreakdownBar
          down={r.down}
          principal={r.principal}
          interest={r.totalInterest}
          labels={{
            down:      t("downPayment"),
            principal: t("principalLabel"),
            interest:  t("interestLabel"),
          }}
        />

        {/* Summary rows */}
        <div>
          <Row label={t("downPayment")}    value={czk.format(r.down)} />
          <Row label={t("interestLabel")}  value={czk.format(r.totalInterest)} />
          <Row label={t("totalPaid")}      value={czk.format(r.totalPaid)} bold />
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/[0.05]"
            style={{
              border: "1px solid var(--border-md)",
              color:  "var(--text-2)",
            }}
          >
            {copied ? <Check size={15} className="text-[var(--color-accent)]" /> : <Copy size={15} />}
            {copied ? t("copied") : t("copy")}
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-extrabold hover:brightness-105 transition-all"
            style={{background: "linear-gradient(135deg, #FE9302 0%, #FF7918 50%, #FF5A2A 100%)", boxShadow: "0 4px 28px -8px rgba(255,121,24,0.55)"}}
          >
            {t("sendWithCalc")}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
