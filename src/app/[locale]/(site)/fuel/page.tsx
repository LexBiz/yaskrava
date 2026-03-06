import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { DownloadButtons } from "@/components/shared/DownloadButtons";
import { PageHero } from "@/components/site/PageHero";
import { Link } from "@/i18n/navigation";

export default function FuelPage() {
  const t = useTranslations("Fuel");

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")}>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-white text-sm font-extrabold tracking-wide hover:brightness-105 transition-all"
            style={{ background: "linear-gradient(135deg,#FE9302,#FF5A2A)", boxShadow: "0 0 30px -8px rgba(255,121,24,0.60)" }}
          >
            {t("cta")} <ArrowRight size={15} />
          </Link>
          <DownloadButtons />
        </div>
      </PageHero>

      <section style={{background:"linear-gradient(160deg,#3D2A12 0%,#2F1F0C 50%,#251809 100%)"}} className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">

          {/* Partners label */}
          <div className="flex items-center gap-3 mb-10">
            <div className="section-accent-line" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "var(--text-3)" }}>
              {t("partnersTitle")}
            </p>
          </div>

          {/* Partner cards */}
          <div className="grid gap-5 lg:grid-cols-3">

            {/* Shell */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "rgba(255,213,0,0.08)",
                border: "1.5px solid rgba(255,213,0,0.30)",
                boxShadow: "inset 0 1px 0 rgba(255,213,0,0.12)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{ background: "#FFD500", color: "#CC0000" }}>SH</span>
                  <span className="text-2xl font-black text-white">Shell</span>
                </div>
                <span className="text-[11px] font-bold rounded-full px-3 py-1"
                  style={{ border: "1.5px solid rgba(255,213,0,0.3)", color: "#FFD500" }}>
                  {t("shell.badge")}
                </span>
              </div>
              <p className="mt-4 text-base leading-relaxed font-medium" style={{ color: "var(--text-2)" }}>
                {t("shell.text")}
              </p>
              <div className="mt-6">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--text-3)" }}>
                  {t("shell.howTitle")}
                </div>
                <ol className="space-y-2 text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                      style={{ background: "rgba(255,213,0,0.15)", color: "#FFD500" }}>1</span>
                    {t("shell.how.0")}
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                      style={{ background: "rgba(255,213,0,0.15)", color: "#FFD500" }}>2</span>
                    {t("shell.how.1")}
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                      style={{ background: "rgba(255,213,0,0.15)", color: "#FFD500" }}>3</span>
                    {t("shell.how.2")}
                  </li>
                </ol>
              </div>
            </div>

            {/* ORLEN */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "rgba(228,0,43,0.08)",
                border: "1.5px solid rgba(228,0,43,0.28)",
                boxShadow: "inset 0 1px 0 rgba(228,0,43,0.12)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{ background: "#E4002B", color: "#ffffff" }}>OR</span>
                  <span className="text-2xl font-black text-white">ORLEN</span>
                </div>
                <span className="text-[11px] font-black rounded-full px-3 py-1"
                  style={{ border: "1.5px solid rgba(228,0,43,0.4)", color: "#ff3b5c", background: "rgba(228,0,43,0.12)" }}>
                  {t("orlen.badge")}
                </span>
              </div>
              <p className="mt-4 text-base leading-relaxed font-medium" style={{ color: "var(--text-2)" }}>
                {t("orlen.text")}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {(t.raw("orlen.fuel") as string[]).map((f: string) => (
                  <span key={f} className="rounded-xl px-4 py-3 text-sm font-bold text-center"
                    style={{ background: "rgba(228,0,43,0.12)", border: "1px solid rgba(228,0,43,0.2)", color: "#ff3b5c" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* OMV */}
            <div
              className="rounded-2xl p-7 opacity-55"
              style={{ background: "linear-gradient(150deg,rgba(255,200,100,0.06),rgba(255,150,30,0.02))", border: "1px solid rgba(255,180,60,0.14)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{ background: "rgba(255,180,60,0.16)", color: "rgba(255,180,60,0.70)" }}>OM</span>
                  <span className="text-2xl font-black text-white">OMV</span>
                </div>
                <span className="text-[11px] font-bold rounded-full px-3 py-1"
                  style={{ border: "1.5px solid var(--border)", color: "var(--text-3)" }}>
                  {t("omv.badge")}
                </span>
              </div>
              <p className="mt-4 text-base leading-relaxed font-medium" style={{ color: "var(--text-3)" }}>
                {t("omv.text")}
              </p>
            </div>
          </div>

          {/* Download */}
          <div className="mt-12 rounded-2xl p-7 sm:p-8"
            style={{ background: "linear-gradient(150deg,rgba(254,147,2,0.12),rgba(255,90,42,0.04))", border: "1px solid rgba(254,147,2,0.22)" }}>
            <p className="text-lg font-black text-white">Use fuel cashback right in the app</p>
            <p className="mt-2 text-base font-medium" style={{ color: "var(--text-2)" }}>
              Download Yaskrava to get started with Shell, ORLEN and more.
            </p>
            <div className="mt-5">
              <DownloadButtons />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 rounded-xl p-4 text-sm font-medium" style={{ border: "1px solid rgba(255,170,60,0.14)", color: "var(--text-3)" }}>
            {t("disclaimer")}
          </div>
        </div>
      </section>
    </div>
  );
}
