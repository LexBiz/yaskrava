import {useTranslations} from "next-intl";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";

export default function ImprintPage() {
  const t = useTranslations("LegalDocs");

  return (
    <div>
      <PageHero title={t("imprintTitle")} subtitle={t("imprintSubtitle")} />
      <section className="py-14">
        <Container>
          <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-li:text-white/70">
            <p>{t("templateDisclaimer")}</p>
            <h2>{t("sections.company")}</h2>
            <ul>
              <li>{t("imprint.companyName")}</li>
              <li>{t("imprint.address")}</li>
              <li>{t("imprint.icoDic")}</li>
              <li>{t("imprint.contact")}</li>
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}

