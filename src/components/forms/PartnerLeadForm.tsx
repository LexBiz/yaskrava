"use client";

import {CheckCircle2, Loader2, Send} from "lucide-react";
import {useTranslations} from "next-intl";
import {useState} from "react";

export function PartnerLeadForm() {
  const t = useTranslations("PartnerForm");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [fleetSize, setFleetSize] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/partner-leads", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
          sourcePath: window.location.pathname,
          utmSource: new URLSearchParams(window.location.search).get("utm_source") || undefined,
          utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
          utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
          companyName,
          contactName,
          phone: phone.trim() || undefined,
          email: email.trim(),
          city: city.trim() || undefined,
          website: website.trim() || undefined,
          fleetSize: fleetSize.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });

      const json = (await res.json()) as {id?: string};
      if (!res.ok || !json.id) {
        setError(t("errorGeneric"));
        return;
      }

      setDoneId(json.id);
    } catch {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  if (doneId) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10">
        <div className="flex items-center gap-2 text-sm font-semibold" style={{color: "#3B3B3D"}}>
          <CheckCircle2 className="h-5 w-5" style={{color: "#FF7918"}} />
          {t("successTitle")}
        </div>
        <div className="mt-3 text-sm" style={{color: "rgba(59,59,61,0.70)"}}>{t("successText")}</div>
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs" style={{color: "rgba(59,59,61,0.70)"}}>
          ID: <span className="font-semibold" style={{color: "#3B3B3D"}}>{doneId}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10">
      <div className="text-sm font-semibold" style={{color: "#3B3B3D"}}>{t("title")}</div>
      <p className="mt-2 text-sm leading-7" style={{color: "rgba(59,59,61,0.68)"}}>{t("subtitle")}</p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
            <span className="text-xs font-semibold text-gray-600">{t("companyName")}</span>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#FF7918]"
              placeholder={t("companyNamePh")}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-gray-600">{t("contactName")}</span>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#FF7918]"
              placeholder={t("contactNamePh")}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-gray-600">{t("phone")}</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#FF7918]"
              placeholder="+420..."
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-gray-600">{t("email")}</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#FF7918]"
              placeholder="dealer@email.com"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-gray-600">{t("city")}</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#FF7918]"
              placeholder={t("cityPh")}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-gray-600">{t("fleetSize")}</span>
            <input
              value={fleetSize}
              onChange={(e) => setFleetSize(e.target.value)}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#FF7918]"
              placeholder={t("fleetSizePh")}
            />
          </label>

          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-gray-600">{t("website")}</span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#FF7918]"
              placeholder="https://..."
            />
          </label>

          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-gray-600">{t("message")}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-28 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#FF7918]"
              placeholder={t("messagePh")}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold text-white disabled:opacity-60"
          style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 4px 20px -6px rgba(255,121,24,0.55)"}}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t("send")}
        </button>
      </form>
    </div>
  );
}
