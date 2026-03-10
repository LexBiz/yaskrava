import {useTranslations} from "next-intl";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";
import {companyInfo} from "@/lib/companyInfo";

export default function PrivacyPolicyPage() {
  const t = useTranslations("LegalDocs");
  const tAbout = useTranslations("About");
  const tFooter = useTranslations("Footer");

  return (
    <div>
      <PageHero title={t("privacyTitle")} subtitle={t("privacySubtitle")} />
      <section className="section-white py-14">
        <Container>
          {/* Official company data block */}
          <div className="mb-12 rounded-2xl border border-[rgba(255,121,24,0.18)] bg-[rgba(255,121,24,0.04)] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-5" style={{color: "#FF7918"}}>
              {tFooter("officialHeading")}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CompanyRow label={tFooter("legalNameLabel")} value={companyInfo.legalName} />
              <CompanyRow label={tFooter("registrationNumberLabel")} value={companyInfo.registrationNumber} />
              <CompanyRow label={tFooter("vatNumberLabel")} value={companyInfo.vatNumber} />
              <CompanyRow label={tFooter("addressLabel")} value={companyInfo.address} />
              <CompanyRow label={tFooter("courtLabel")} value={companyInfo.courtRegister} />
              <CompanyRow label={tAbout("incorporatedLabel")} value={companyInfo.incorporatedAt} />
            </div>
          </div>

          <div className="prose max-w-none prose-p:text-[rgba(59,59,61,0.72)] prose-li:text-[rgba(59,59,61,0.72)] prose-headings:text-[#3B3B3D]">
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

function CompanyRow({label, value}: {label: string; value: string}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{color: "rgba(59,59,61,0.46)"}}>
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold" style={{color: "#3B3B3D"}}>
        {value}
      </div>
    </div>
  );
}

