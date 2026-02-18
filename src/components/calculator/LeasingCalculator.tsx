"use client";

import { ArrowRight, Check, Copy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useRouter } from "@/i18n/navigation";
import type { CalculatorSnapshot } from "@/lib/applicationSchema";

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
function SliderField({ label, value, min, max, step, display, onChange }: SliderProps) {
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

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
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
  down, principal, interest, fees,
  labels,
}: {
  down: number; principal: number; interest: number; fees: number;
  labels: { down: string; principal: string; interest: string; fees: string };
}) {
  const total = down + principal + interest + Math.max(0, fees);
  if (total === 0) return null;

  const seg = (v: number) => `${Math.max(0, (v / total) * 100).toFixed(1)}%`;

  return (
    <div>
      {/* Bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-[2px]">
        <div className="bar-seg rounded-l-full" style={{ width: seg(down),      background: "rgba(255,255,255,0.22)" }} />
        <div className="bar-seg"               style={{ width: seg(principal), background: "rgba(6,193,103,0.35)" }} />
        <div className="bar-seg"               style={{ width: seg(interest),  background: "#06C167" }} />
        {fees > 0 && (
          <div className="bar-seg rounded-r-full" style={{ width: seg(fees), background: "rgba(255,255,255,0.10)" }} />
        )}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-3)" }}
      >
        <Leg color="rgba(255,255,255,0.22)" label={labels.down} />
        <Leg color="rgba(6,193,103,0.35)"   label={labels.principal} />
        <Leg color="#06C167"                 label={labels.interest} />
        {fees > 0 && <Leg color="rgba(255,255,255,0.10)" label={labels.fees} />}
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

export function LeasingCalculator() {
  const t      = useTranslations("CalculatorUI");
  const locale = useLocale();
  const router = useRouter();

  /* State */
  const [price,       setPrice]       = useState(600_000);
  const [downPct,     setDownPct]     = useState(20);
  const [months,      setMonths]      = useState(48);
  const [apr,         setApr]         = useState(10);
  const [residualPct, setResidualPct] = useState(20);
  const [fees,        setFees]        = useState(0);
  const [copied,      setCopied]      = useState(false);

  /* CZK formatter */
  const czk = useMemo(
    () => new Intl.NumberFormat(localeTag(locale), {
      style: "currency", currency: "CZK", maximumFractionDigits: 0,
    }),
    [locale],
  );

  /* Computation */
  const r = useMemo(() => {
    const down     = Math.round((price * downPct)     / 100);
    const residual = Math.round((price * residualPct) / 100);
    const principal = Math.max(0, price - down);
    const rMonthly = apr / 100 / 12;

    const monthly      = Math.round(Math.max(0, pmt(principal, rMonthly, months, residual)));
    const monthlyTotal = monthly + fees;
    const totalPaid    = monthly * months + down + residual;
    const totalInterest = Math.max(0, totalPaid - price);
    const totalFees    = fees * months;

    return { down, residual, principal, monthly, monthlyTotal, totalPaid, totalInterest, totalFees };
  }, [price, downPct, months, apr, residualPct, fees]);

  /* Snapshot */
  const snapshot: CalculatorSnapshot = {
    priceCzk: price, downPaymentCzk: r.down, termMonths: months,
    aprPercent: apr, residualCzk: r.residual, monthlyFeesCzk: fees,
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
        </div>

        <SliderField
          label={t("price")}
          value={price}
          min={50_000}
          max={3_000_000}
          step={10_000}
          display={czk.format(price)}
          onChange={setPrice}
        />

        <SliderField
          label={t("downPaymentPct")}
          value={downPct}
          min={0}
          max={90}
          step={1}
          display={`${downPct}% · ${czk.format(r.down)}`}
          onChange={setDownPct}
        />

        <SliderField
          label={t("termMonths")}
          value={months}
          min={12}
          max={84}
          step={6}
          display={monthLabel}
          onChange={setMonths}
        />

        <SliderField
          label={t("apr")}
          value={apr}
          min={1}
          max={30}
          step={0.5}
          display={`${apr}%`}
          onChange={setApr}
        />

        <SliderField
          label={t("residualPct")}
          value={residualPct}
          min={0}
          max={60}
          step={1}
          display={`${residualPct}% · ${czk.format(r.residual)}`}
          onChange={setResidualPct}
        />

        {/* Monthly fees — plain number input */}
        <div className="space-y-0">
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--text-3)" }}
            >
              {t("monthlyFees")}
            </span>
            <span className="text-sm font-bold text-white tabular-nums">{czk.format(fees)}</span>
          </div>
          <input
            type="number"
            value={fees}
            min={0}
            step={100}
            onChange={e => setFees(Math.max(0, Number(e.target.value || 0)))}
            placeholder="0"
            className="w-full h-9 bg-transparent text-sm text-white outline-none placeholder:text-white/20 tabular-nums"
            style={{
              borderBottom: "1px solid var(--border-md)",
              transition: "border-color 200ms ease",
            }}
            onFocus={e  => (e.currentTarget.style.borderBottomColor = "var(--color-accent)")}
            onBlur={e => (e.currentTarget.style.borderBottomColor = "var(--border-md)")}
          />
        </div>

        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
          {t("disclaimer")}
        </p>
      </div>

      {/* ══ RIGHT: Results ════════════════════════════════════ */}
      <div className="yask-calc-results p-7 sm:p-9 flex flex-col gap-6">

        {/* Monthly payment — BIG green gradient number */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4"
            style={{ color: "rgba(6,193,103,0.65)" }}
          >
            {t("monthlyTotal")}
          </p>

          <p
            key={Math.round(r.monthlyTotal / 500)}
            className="amount-pop text-gradient-accent font-black leading-none tabular-nums"
            style={{ fontSize: "clamp(2.8rem, 5vw, 3.8rem)" }}
          >
            {czk.format(r.monthlyTotal)}
          </p>

          {fees > 0 && (
            <p className="mt-2 text-sm" style={{ color: "var(--text-2)" }}>
              {t("monthlyLease")}: <span className="font-semibold text-white">{czk.format(r.monthly)}</span>
            </p>
          )}
        </div>

        {/* Breakdown bar — animated */}
        <BreakdownBar
          down={r.down}
          principal={r.principal}
          interest={r.totalInterest}
          fees={r.totalFees}
          labels={{
            down:      t("downPayment"),
            principal: t("principalLabel"),
            interest:  t("interestLabel"),
            fees:      t("feesTotal"),
          }}
        />

        {/* Summary rows */}
        <div>
          <Row label={t("downPayment")}    value={czk.format(r.down)} />
          <Row label={t("residual")}       value={czk.format(r.residual)} />
          {r.totalFees > 0 && (
            <Row label={t("feesTotal")}    value={czk.format(r.totalFees)} />
          )}
          <Row label={t("interestLabel")}  value={czk.format(r.totalInterest)} />
          <Row label={t("totalPaid")}      value={czk.format(r.totalPaid + r.totalFees)} bold />
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
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] text-black text-sm font-extrabold hover:brightness-95 transition-all"
            style={{ boxShadow: "0 0 30px -8px rgba(6,193,103,0.5)" }}
          >
            {t("sendWithCalc")}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
