import {useTranslations} from "next-intl";

import {ApplicationForm} from "@/components/forms/ApplicationForm";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";

export default function ApplyPage() {
  const t = useTranslations("Apply");

  return (
    <div>
      <PageHero variant="charcoal" title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons />
      </PageHero>
      <section className="section-white py-14">
        <Container>
          <ApplicationForm />
        </Container>
      </section>
    </div>
  );
}
