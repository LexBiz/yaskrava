import {useTranslations} from "next-intl";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";

export default function CookiesPage() {
  const t = useTranslations("LegalDocs");

  return (
    <div>
      <PageHero title={t("cookiesTitle")} subtitle={t("cookiesSubtitle")} />
      <section className="py-14">
        <Container>
          <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-li:text-white/70">
            <p>{t("templateDisclaimer")}</p>
            <h2>{t("sections.cookies")}</h2>
            <p>{t("cookies.what")}</p>
            <h2>{t("sections.preferences")}</h2>
            <p>{t("cookies.preferences")}</p>
          </div>
        </Container>
      </section>
    </div>
  );
}

