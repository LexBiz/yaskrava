import {useTranslations} from "next-intl";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";

export default function ImprintPage() {
  const t = useTranslations("LegalDocs");

  return (
    <div>
      <PageHero title={t("imprintTitle")} subtitle={t("imprintSubtitle")} />
      <section className="section-white py-14">
        <Container>
          <div className="prose max-w-none prose-p:text-[rgba(59,59,61,0.72)] prose-li:text-[rgba(59,59,61,0.72)] prose-headings:text-[#3B3B3D]">
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

