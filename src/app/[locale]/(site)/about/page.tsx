import Image from "next/image";
import {useTranslations} from "next-intl";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PageHero} from "@/components/site/PageHero";

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <div>
      {/* Charcoal hero */}
      <PageHero variant="charcoal" title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons />
      </PageHero>

      {/* White section — mission */}
      <section className="section-white py-20 sm:py-24" style={{borderBottom: "1px solid rgba(59,59,61,0.08)"}}>
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="section-accent-line-orange mb-5" />
              <h2 className="text-2xl font-extrabold" style={{color: "#3B3B3D"}}>{t("missionTitle")}</h2>
              <p className="mt-4 text-base leading-relaxed" style={{color: "rgba(59,59,61,0.72)"}}>
                {t("missionText")}
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-[26px] border border-[rgba(255,121,24,0.18)] bg-white shadow-[0_24px_70px_-36px_rgba(255,121,24,0.32)]">
                <div className="relative h-56 sm:h-64">
                  <Image
                    src="/Photo1.jpg"
                    alt={t("officialImageAlt")}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,18,12,0.76)] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed" style={{color: "rgba(59,59,61,0.70)"}}>
                    {t("officialText")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl p-6"
            style={{
              background: "linear-gradient(150deg, rgba(255,121,24,0.08), rgba(255,153,2,0.04))",
              border: "1px solid rgba(255,121,24,0.18)",
            }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{color: "#FF7918"}}>
              {t("principlesTitle")}
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2 text-sm" style={{color: "rgba(59,59,61,0.75)"}}>
              {(t.raw("principles") as string[]).map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[3px] shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                    style={{background: "linear-gradient(135deg,#FF7918,#FF9902)"}}>
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {(["speed", "transparency", "compliance"] as const).map(k => (
              <div key={k} className="yask-card-on-white rounded-2xl p-6">
                <div className="w-8 h-1 rounded-full mb-4"
                  style={{background: "linear-gradient(90deg,#FF7918,#FF9902)"}} />
                <p className="text-sm font-extrabold" style={{color: "#3B3B3D"}}>{t(`cards.${k}Title`)}</p>
                <p className="mt-2 text-sm leading-relaxed" style={{color: "rgba(59,59,61,0.65)"}}>
                  {t(`cards.${k}Text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Orange CTA */}
      <section className="section-gradient py-16 sm:py-20 cta-section">
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

