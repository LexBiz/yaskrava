"use client";

import {CheckCircle2, Loader2, Send} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {useEffect, useMemo, useState} from "react";

import {Link} from "@/i18n/navigation";
import type {CalculatorSnapshot} from "@/lib/applicationSchema";

type Topic = "LEASING" | "FUEL" | "VEHICLE" | "CAREER" | "OTHER";

function safeParseCalc(raw: string | null): CalculatorSnapshot | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as unknown;
    if (!obj || typeof obj !== "object") return null;
    return obj as CalculatorSnapshot;
  } catch {
    return null;
  }
}

export function ApplicationForm() {
  const t = useTranslations("ApplyForm");
  const locale = useLocale();

  const [topic, setTopic] = useState<Topic>("LEASING");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const [calc, setCalc] = useState<CalculatorSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCalc(safeParseCalc(localStorage.getItem("yaskrava_calc")));
  }, []);

  const calcSummary = useMemo(() => {
    if (!calc) return null;
    return `${calc.termMonths}m • APR ${calc.aprPercent}% • monthly ${calc.monthlyTotalCzk} CZK`;
  }, [calc]);

  async function submit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
          locale,
          sourcePath: window.location.pathname,
          topic,
          fullName,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          message: message.trim() || undefined,
          consent: consent ? true : false,
          calculator: calc ?? undefined,
        }),
      });

      const json = (await res.json()) as {id?: string; error?: string};
      if (!res.ok || !json.id) {
        setError(t("errorGeneric"));
        return;
      }

      setDoneId(json.id);
      localStorage.removeItem("yaskrava_calc");
    } catch {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  if (doneId) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <CheckCircle2 className="h-5 w-5 text-[var(--color-accent)]" />
          {t("successTitle")}
        </div>
        <div className="mt-3 text-sm text-white/70">{t("successText")}</div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/70">
          ID: <span className="font-semibold text-white">{doneId}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
      <div className="text-sm font-semibold text-white">{t("title")}</div>
      <p className="mt-2 text-sm leading-7 text-white/70">{t("subtitle")}</p>

      {calc ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs font-semibold text-white/70">{t("calcAttached")}</div>
          <div className="mt-1 text-sm text-white">{calcSummary}</div>
          <div className="mt-2 text-xs text-white/50">{t("calcTip")}</div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <form
        className="mt-6 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) void submit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-white/70">
              {t("fullName")}
            </span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
              placeholder={t("fullNamePh")}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-white/70">{t("topic")}</span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as Topic)}
              className="h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
            >
              <option value="LEASING">{t("topicLeasing")}</option>
              <option value="VEHICLE">{t("topicVehicle")}</option>
              <option value="FUEL">{t("topicFuel")}</option>
              <option value="CAREER">{t("topicCareer")}</option>
              <option value="OTHER">{t("topicOther")}</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-white/70">{t("phone")}</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
              placeholder="+420…"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-white/70">{t("email")}</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
              placeholder="name@email.com"
            />
          </label>

          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-white/70">{t("city")}</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
              placeholder={t("cityPh")}
            />
          </label>

          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-white/70">{t("message")}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
              placeholder={t("messagePh")}
            />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40"
          />
          <span className="text-sm leading-6 text-white/70">
            {t("consentPrefix")}{" "}
            <Link href="/legal/privacy" className="text-white underline underline-offset-4">
              {t("privacyLink")}
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-black disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t("send")}
        </button>

        <div className="text-xs text-white/50">{t("gdprHint")}</div>
      </form>
    </div>
  );
}

