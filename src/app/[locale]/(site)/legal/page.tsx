import {useTranslations} from "next-intl";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";
import {Link} from "@/i18n/navigation";

export default function LegalIndexPage() {
  const t = useTranslations("Legal");

  return (
    <div>
      <PageHero variant="charcoal" title={t("title")} subtitle={t("subtitle")} />
      <section className="section-white py-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {href: "/legal/privacy", title: t("privacyTitle"), text: t("privacyText")},
              {href: "/legal/terms",   title: t("termsTitle"),   text: t("termsText")},
              {href: "/legal/cookies", title: t("cookiesTitle"), text: t("cookiesText")},
              {href: "/legal/imprint", title: t("imprintTitle"), text: t("imprintText")},
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="yask-card-on-white rounded-2xl p-6 no-underline group hover:border-[#FF7918]/25 transition-all">
                <div className="w-6 h-[2px] rounded-full mb-3"
                  style={{background: "linear-gradient(90deg,#FF7918,#FF9902)"}} />
                <div className="text-sm font-semibold" style={{color: "#3B3B3D"}}>{l.title}</div>
                <div className="mt-2 text-sm leading-6" style={{color: "rgba(59,59,61,0.65)"}}>{l.text}</div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
