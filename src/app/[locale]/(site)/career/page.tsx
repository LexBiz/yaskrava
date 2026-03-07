import {useTranslations} from "next-intl";

import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PageHero} from "@/components/site/PageHero";
import {Link} from "@/i18n/navigation";

export default function CareerPage() {
  const t = useTranslations("Career");

  return (
    <div>
      {/* Orange gradient hero */}
      <PageHero variant="gradient" title={t("title")} subtitle={t("subtitle")}>
        <div className="flex flex-wrap gap-3">
          <Link href="/apply" className="btn-white h-11 px-6 text-sm font-bold"
            style={{background: "#FFFFFF", color: "#3B3B3D"}}>
            {t("cta")}
          </Link>
          <DownloadButtons />
        </div>
      </PageHero>

      {/* White — roles */}
      <section className="section-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="yask-card-on-white rounded-2xl p-6">
              <div className="w-8 h-1 rounded-full mb-4"
                style={{background: "linear-gradient(90deg,#FF7918,#FF9902)"}} />
              <div className="text-base font-black" style={{color: "#3B3B3D"}}>{t("roles.salesTitle")}</div>
              <div className="mt-2 text-sm leading-7" style={{color: "rgba(59,59,61,0.68)"}}>{t("roles.salesText")}</div>
            </div>
            <div className="yask-card-on-white rounded-2xl p-6">
              <div className="w-8 h-1 rounded-full mb-4"
                style={{background: "linear-gradient(90deg,#FF7918,#FF9902)"}} />
              <div className="text-base font-black" style={{color: "#3B3B3D"}}>{t("roles.opsTitle")}</div>
              <div className="mt-2 text-sm leading-7" style={{color: "rgba(59,59,61,0.68)"}}>{t("roles.opsText")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Charcoal — process */}
      <section className="section-charcoal py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="section-accent-line mb-4" />
          <h2 className="text-xl font-extrabold text-white mb-8">{t("processTitle")}</h2>
          <div className="flex flex-col sm:flex-row gap-0">
            {(t.raw("process") as string[]).map((step: string, i: number) => (
              <div key={i} className="flex-1 flex gap-4 items-start p-5 rounded-2xl"
                style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", margin: "4px"}}>
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                  style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 4px 16px -4px rgba(255,121,24,0.60)"}}>
                  {i + 1}
                </div>
                <div className="text-sm font-medium leading-relaxed text-white/75">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
