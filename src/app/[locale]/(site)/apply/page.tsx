import {useTranslations} from "next-intl";

import {ApplicationForm} from "@/components/forms/ApplicationForm";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";

export default function ApplyPage() {
  const t = useTranslations("Apply");

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons />
      </PageHero>
      <section className="py-14" style={{background: "linear-gradient(180deg, #2F1F0C 0%, #1C1208 100%)"}}>
        <Container>
          <ApplicationForm />
        </Container>
      </section>
    </div>
  );
}

