import {useTranslations} from "next-intl";

import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PageHero} from "@/components/site/PageHero";

export default function FuelPage() {
  const t = useTranslations("Fuel");

  return (
    <div>
      {/* Charcoal hero */}
      <PageHero variant="charcoal" title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons />
      </PageHero>

      {/* White section — partner cards */}
      <section className="section-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="section-accent-line-orange" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{color: "rgba(59,59,61,0.50)"}}>
              {t("partnersTitle")}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {/* Shell */}
            <div className="rounded-2xl p-7 yask-card-on-white"
              style={{border: "1.5px solid rgba(255,213,0,0.30)"}}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{background: "#FFD500", color: "#CC0000"}}>SH</span>
                  <span className="text-2xl font-black" style={{color: "#3B3B3D"}}>Shell</span>
                </div>
                <span className="text-[11px] font-bold rounded-full px-3 py-1"
                  style={{border: "1.5px solid rgba(255,213,0,0.40)", color: "#B8960A", background: "rgba(255,213,0,0.10)"}}>
                  {t("shell.badge")}
                </span>
              </div>
              <p className="mt-4 text-base leading-relaxed font-medium" style={{color: "rgba(59,59,61,0.70)"}}>
                {t("shell.text")}
              </p>
              <div className="mt-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{color: "rgba(59,59,61,0.45)"}}>
                  {t("shell.howTitle")}
                </div>
                <ol className="space-y-2 text-sm font-medium" style={{color: "rgba(59,59,61,0.70)"}}>
                  {([t("shell.how.0"), t("shell.how.1"), t("shell.how.2")] as string[]).map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 text-white"
                        style={{background: "linear-gradient(135deg,#FF7918,#FF9902)"}}>
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* ORLEN */}
            <div className="rounded-2xl p-7 yask-card-on-white"
              style={{border: "1.5px solid rgba(228,0,43,0.25)"}}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{background: "#E4002B", color: "#ffffff"}}>OR</span>
                  <span className="text-2xl font-black" style={{color: "#3B3B3D"}}>ORLEN</span>
                </div>
                <span className="text-[11px] font-black rounded-full px-3 py-1"
                  style={{border: "1.5px solid rgba(228,0,43,0.30)", color: "#E4002B", background: "rgba(228,0,43,0.08)"}}>
                  {t("orlen.badge")}
                </span>
              </div>
              <p className="mt-4 text-base leading-relaxed font-medium" style={{color: "rgba(59,59,61,0.70)"}}>
                {t("orlen.text")}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {(t.raw("orlen.fuel") as string[]).map((f: string) => (
                  <span key={f} className="rounded-xl px-4 py-3 text-sm font-bold text-center"
                    style={{background: "rgba(228,0,43,0.08)", border: "1px solid rgba(228,0,43,0.18)", color: "#E4002B"}}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* OMV */}
            <div className="rounded-2xl p-7 opacity-60"
              style={{border: "1px solid rgba(59,59,61,0.14)", background: "#F5F5F5"}}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{background: "rgba(59,59,61,0.12)", color: "rgba(59,59,61,0.50)"}}>OM</span>
                  <span className="text-2xl font-black" style={{color: "#3B3B3D"}}>OMV</span>
                </div>
                <span className="text-[11px] font-bold rounded-full px-3 py-1"
                  style={{border: "1px solid rgba(59,59,61,0.15)", color: "rgba(59,59,61,0.50)"}}>
                  {t("omv.badge")}
                </span>
              </div>
              <p className="mt-4 text-base leading-relaxed font-medium" style={{color: "rgba(59,59,61,0.50)"}}>
                {t("omv.text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Orange download CTA */}
      <section className="section-gradient py-14 sm:py-16 cta-section">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <p className="text-xl font-black text-white">{t("appCtaTitle")}</p>
          <p className="mt-2 text-base font-medium" style={{color: "rgba(255,255,255,0.78)"}}>
            {t("appCtaText")}
          </p>
          <div className="mt-5"><DownloadButtons /></div>
        </div>
      </section>

      {/* Charcoal disclaimer */}
      <div className="section-charcoal px-6 py-4 text-sm font-medium text-center"
        style={{color: "rgba(255,255,255,0.40)"}}>
        {t("disclaimer")}
      </div>
    </div>
  );
}
