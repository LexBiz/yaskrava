import { useTranslations } from "next-intl";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import { PageHero } from "@/components/site/PageHero";

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons />
      </PageHero>

      <section className="bg-black py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Mission */}
            <div className="lg:col-span-7">
              <div className="section-accent-line mb-5" />
              <h2 className="text-xl font-extrabold text-white">{t("missionTitle")}</h2>
              <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
                {t("missionText")}
              </p>
            </div>

            {/* Principles */}
            <div className="lg:col-span-5">
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "linear-gradient(150deg, rgba(6,193,103,0.06), rgba(6,193,103,0.01))",
                  border: "1px solid rgba(6,193,103,0.18)",
                  boxShadow: "inset 0 1px 0 rgba(6,193,103,0.1)",
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(6,193,103,0.7)" }}>
                  {t("principlesTitle")}
                </p>
                <ul className="mt-4 space-y-3 text-sm" style={{ color: "var(--text-2)" }}>
                  {(t.raw("principles") as string[]).map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-[3px] shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{ background: "rgba(6,193,103,0.15)", color: "var(--color-accent)" }}
                      >
                        ✓
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 3 value cards */}
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {(["speed", "transparency", "compliance"] as const).map(k => (
              <div key={k} className="yask-card rounded-2xl p-6">
                <p className="text-sm font-extrabold text-white">{t(`cards.${k}Title`)}</p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {t(`cards.${k}Text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
