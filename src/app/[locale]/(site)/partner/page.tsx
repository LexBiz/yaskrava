import {useTranslations} from "next-intl";

import {PartnerLeadForm} from "@/components/forms/PartnerLeadForm";
import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";

export default function PartnerPage() {
  const t = useTranslations("Partner");

  return (
    <div>
      <PageHero variant="gradient" title={t("title")} subtitle={t("subtitle")} />
      <section className="section-white py-14 sm:py-20">
        <Container>
          <div className="mb-10">
            <div className="yask-badge-on-white">{t("eyebrow")}</div>
            <p className="mt-4 max-w-2xl text-sm leading-7" style={{color: "rgba(59,59,61,0.70)"}}>
              {t("intro")}
            </p>
          </div>
          <PartnerLeadForm />
        </Container>
      </section>
    </div>
  );
}
