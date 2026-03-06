import {useTranslations} from "next-intl";

import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";
import {Link} from "@/i18n/navigation";

export default function CareerPage() {
  const t = useTranslations("Career");

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")}>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
          >
            {t("cta")}
          </Link>
          <DownloadButtons />
        </div>
      </PageHero>

      <section style={{background:"linear-gradient(160deg,#2F1F0C 0%,#251809 100%)"}} className="py-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-semibold text-white">{t("roles.salesTitle")}</div>
              <div className="mt-2 text-sm leading-7 text-white/70">{t("roles.salesText")}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-semibold text-white">{t("roles.opsTitle")}</div>
              <div className="mt-2 text-sm leading-7 text-white/70">{t("roles.opsText")}</div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-[rgba(60,40,10,0.55)] p-6 sm:p-10">
            <div className="text-sm font-semibold text-white">{t("processTitle")}</div>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-white/70">
              <li>1) {t("process.0")}</li>
              <li>2) {t("process.1")}</li>
              <li>3) {t("process.2")}</li>
            </ol>
          </div>
        </Container>
      </section>
    </div>
  );
}

