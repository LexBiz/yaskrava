import {useTranslations} from "next-intl";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";

export default function TermsPage() {
  const t = useTranslations("LegalDocs");

  return (
    <div>
      <PageHero title={t("termsTitle")} subtitle={t("termsSubtitle")} />
      <section className="section-white py-14">
        <Container>
          <div className="prose max-w-none prose-p:text-[rgba(59,59,61,0.72)] prose-li:text-[rgba(59,59,61,0.72)] prose-headings:text-[#3B3B3D]">
            <p>{t("templateDisclaimer")}</p>
            <h2>{t("sections.scope")}</h2>
            <p>{t("terms.scope")}</p>
            <h2>{t("sections.services")}</h2>
            <p>{t("terms.services")}</p>
            <h2>{t("sections.liability")}</h2>
            <p>{t("terms.liability")}</p>
          </div>
        </Container>
      </section>
    </div>
  );
}

