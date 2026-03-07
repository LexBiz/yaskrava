import {useTranslations} from "next-intl";
import {LeasingCalculator} from "@/components/calculator/LeasingCalculator";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PageHero} from "@/components/site/PageHero";

export default function CalculatorPage() {
  const t = useTranslations("Calculator");

  return (
    <div>
      <PageHero variant="gradient" title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons />
      </PageHero>

      <section className="section-charcoal py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <LeasingCalculator />
        </div>
      </section>
    </div>
  );
}
