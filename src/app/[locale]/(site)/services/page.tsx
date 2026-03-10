import {ArrowRight} from "lucide-react";
import {useTranslations} from "next-intl";

import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PartnerGrid} from "@/components/shared/PartnerGrid";
import {PageHero} from "@/components/site/PageHero";
import {Link} from "@/i18n/navigation";
import {PRIMARY_DOWNLOAD_URL} from "@/lib/appLinks";

export default function ServicesPage() {
  const t = useTranslations("Services");

  return (
    <div>
      {/* Orange gradient hero */}
      <PageHero variant="gradient" title={t("title")} subtitle={t("subtitle")}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/calculator"
            className="btn-white h-11 px-6 text-sm font-bold"
            style={{background: "#FFFFFF", color: "#3B3B3D"}}>
            {t("ctaCalculator")} <ArrowRight size={15}/>
          </Link>
          <DownloadButtons />
          <Link href="/fleet" className="btn-outline-white h-11 px-6 text-sm font-bold">
            {t("ctaApply")}
          </Link>
        </div>
      </PageHero>

      {/* White section — service cards */}
      <section className="section-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {k: "leasing",  href: "/calculator"},
              {k: "vehicles", href: "/fleet"},
              {k: "fuel",     href: "/fuel"},
              {k: "support",  href: PRIMARY_DOWNLOAD_URL, external: true},
            ].map(({k, href}) => (
              k === "support" ? (
                <a key={k} href={href} target="_blank" rel="noopener noreferrer"
                  className="yask-card-on-white group rounded-2xl p-7 no-underline transition-all hover:border-[#FF7918]/30">
                  <div className="w-8 h-1 rounded-full mb-4"
                    style={{background: "linear-gradient(90deg,#FF7918,#FF9902)"}} />
                  <div className="text-xl font-black" style={{color: "#3B3B3D"}}>{t(`cards.${k}Title` as never)}</div>
                  <div className="mt-3 text-base leading-relaxed font-medium" style={{color: "rgba(59,59,61,0.68)"}}>
                    {t(`cards.${k}Text` as never)}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{color: "#FF7918"}}>
                    {t("learnMore")} <ArrowRight size={13}/>
                  </div>
                </a>
              ) : (
              <Link key={k} href={href}
                className="yask-card-on-white group rounded-2xl p-7 no-underline transition-all hover:border-[#FF7918]/30">
                <div className="w-8 h-1 rounded-full mb-4"
                  style={{background: "linear-gradient(90deg,#FF7918,#FF9902)"}} />
                <div className="text-xl font-black" style={{color: "#3B3B3D"}}>{t(`cards.${k}Title` as never)}</div>
                <div className="mt-3 text-base leading-relaxed font-medium" style={{color: "rgba(59,59,61,0.68)"}}>
                  {t(`cards.${k}Text` as never)}
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{color: "#FF7918"}}>
                  {t("learnMore")} <ArrowRight size={13}/>
                </div>
              </Link>
              )
            ))}
          </div>

        </div>
      </section>

      {/* Charcoal section — partners */}
      <section className="section-charcoal py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="section-accent-line" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{color: "rgba(255,255,255,0.40)"}}>
              {t("partnersTitle")}
            </p>
          </div>
          <PartnerGrid section="all" />
          <div className="mt-6 rounded-xl p-4 text-sm font-medium"
            style={{border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.40)"}}>
            {t("partnersDisclaimer")}
          </div>
        </div>
      </section>

      {/* Orange CTA */}
      <section className="section-gradient py-14 sm:py-16 cta-section">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <p className="text-2xl font-black text-white">{t("appCtaTitle")}</p>
          <p className="mt-2 text-base font-medium" style={{color: "rgba(255,255,255,0.78)"}}>
            {t("appCtaText")}
          </p>
          <div className="mt-6">
            <DownloadButtons />
          </div>
        </div>
      </section>
    </div>
  );
}
