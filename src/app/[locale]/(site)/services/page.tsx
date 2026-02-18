import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { DownloadButtons } from "@/components/shared/DownloadButtons";
import { PartnerGrid } from "@/components/shared/PartnerGrid";
import { PageHero } from "@/components/site/PageHero";
import { Link } from "@/i18n/navigation";

export default function ServicesPage() {
  const t = useTranslations("Services");

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-extrabold tracking-wide text-black hover:brightness-95 transition-all"
            style={{ boxShadow: "0 0 28px -8px rgba(8,217,110,0.5)" }}
          >
            {t("ctaCalculator")} <ArrowRight size={15} />
          </Link>
          <Link
            href="/apply"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white hover:bg-white/[0.04] transition-colors"
            style={{ border: "1.5px solid var(--border-md)" }}
          >
            {t("ctaApply")}
          </Link>
        </div>
      </PageHero>

      {/* Main service cards */}
      <section className="bg-black py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { k: "leasing",  href: "/calculator" },
              { k: "vehicles", href: "/fleet"      },
              { k: "fuel",     href: "/fuel"       },
              { k: "support",  href: "/apply"      },
            ].map(({ k, href }) => (
              <div key={k} className="yask-card rounded-2xl p-7">
                <div className="text-xl font-black text-white">{t(`cards.${k}Title` as never)}</div>
                <div className="mt-3 text-base leading-relaxed font-medium" style={{ color: "var(--text-2)" }}>
                  {t(`cards.${k}Text` as never)}
                </div>
                {k === "fuel" && (
                  <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-accent)]">
                    {t("ctaFuel")} <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Partner logos */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="section-accent-line" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "var(--text-3)" }}>
                {t("partnersTitle")}
              </p>
            </div>

            <PartnerGrid section="all" />

            <div className="mt-6 rounded-xl p-4 text-sm font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-3)" }}>
              {t("partnersDisclaimer")}
            </div>
          </div>

          {/* Download CTA */}
          <div className="mt-16 rounded-2xl p-7 sm:p-9"
            style={{
              background: "linear-gradient(150deg, rgba(8,217,110,0.09), rgba(8,217,110,0.02))",
              border: "1.5px solid rgba(8,217,110,0.2)",
            }}>
            <p className="text-2xl font-black text-white">Access all services in the app</p>
            <p className="mt-2 text-base font-medium" style={{ color: "var(--text-2)" }}>
              All partner offers, cashback and features — in one place.
            </p>
            <div className="mt-6">
              <DownloadButtons />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
