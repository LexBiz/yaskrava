import {getTranslations} from "next-intl/server";

import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PageHero} from "@/components/site/PageHero";
import {prisma} from "@/lib/prisma";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

export default async function CareerPage() {
  const t = await getTranslations("Career");
  const dealer = await getCurrentDealerOrThrow();
  const vacancies = await prisma.vacancy.findMany({
    where: {
      dealerId: dealer.id,
      deletedAt: null,
      published: true,
    },
    orderBy: {createdAt: "desc"},
    take: 30,
  });

  return (
    <div>
      {/* Orange gradient hero */}
      <PageHero variant="gradient" title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons />
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

          {vacancies.length ? (
            <div className="mt-8">
              <h2 className="text-xl font-extrabold" style={{color: "#3B3B3D"}}>{t("vacanciesTitle")}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {vacancies.map((vacancy) => (
                  <article key={vacancy.id} className="yask-card-on-white rounded-2xl p-6">
                    <div className="text-base font-black" style={{color: "#3B3B3D"}}>{vacancy.title}</div>
                    <div className="mt-2 text-xs font-semibold" style={{color: "rgba(59,59,61,0.52)"}}>
                      {[vacancy.city, vacancy.employmentType].filter(Boolean).join(" • ") || t("vacancyDefaultMeta")}
                    </div>
                    {vacancy.description ? (
                      <p className="mt-3 text-sm leading-7" style={{color: "rgba(59,59,61,0.70)"}}>
                        {vacancy.description}
                      </p>
                    ) : null}
                    {vacancy.contactEmail ? (
                      <a
                        href={`mailto:${vacancy.contactEmail}`}
                        className="mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold no-underline"
                        style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", color: "#fff"}}
                      >
                        {t("vacancyApply")} • {vacancy.contactEmail}
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
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
