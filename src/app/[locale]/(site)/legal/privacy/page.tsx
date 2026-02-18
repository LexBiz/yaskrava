import {useTranslations} from "next-intl";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";

export default function PrivacyPolicyPage() {
  const t = useTranslations("LegalDocs");

  return (
    <div>
      <PageHero title={t("privacyTitle")} subtitle={t("privacySubtitle")} />
      <section className="py-14">
        <Container>
          <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-li:text-white/70">
            <p>{t("templateDisclaimer")}</p>
            <h2>{t("sections.controller")}</h2>
            <p>{t("privacy.controller")}</p>
            <h2>{t("sections.purposes")}</h2>
            <ul>
              <li>{t("privacy.purpose0")}</li>
              <li>{t("privacy.purpose1")}</li>
              <li>{t("privacy.purpose2")}</li>
            </ul>
            <h2>{t("sections.rights")}</h2>
            <p>{t("privacy.rights")}</p>
          </div>
        </Container>
      </section>
    </div>
  );
}

