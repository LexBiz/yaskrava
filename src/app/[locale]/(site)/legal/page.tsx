import {useTranslations} from "next-intl";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";
import {Link} from "@/i18n/navigation";

export default function LegalIndexPage() {
  const t = useTranslations("Legal");

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")} />

      <section className="py-14" style={{background: "linear-gradient(180deg, #2F1F0C 0%, #1C1208 100%)"}}>
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/legal/privacy"
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05]"
            >
              <div className="text-sm font-semibold text-white">{t("privacyTitle")}</div>
              <div className="mt-2 text-sm leading-7 text-white/70">{t("privacyText")}</div>
            </Link>
            <Link
              href="/legal/terms"
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05]"
            >
              <div className="text-sm font-semibold text-white">{t("termsTitle")}</div>
              <div className="mt-2 text-sm leading-7 text-white/70">{t("termsText")}</div>
            </Link>
            <Link
              href="/legal/cookies"
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05]"
            >
              <div className="text-sm font-semibold text-white">{t("cookiesTitle")}</div>
              <div className="mt-2 text-sm leading-7 text-white/70">{t("cookiesText")}</div>
            </Link>
            <Link
              href="/legal/imprint"
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05]"
            >
              <div className="text-sm font-semibold text-white">{t("imprintTitle")}</div>
              <div className="mt-2 text-sm leading-7 text-white/70">{t("imprintText")}</div>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}

