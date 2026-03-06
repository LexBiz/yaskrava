import {ReactNode} from "react";

import {GlobalPartnerSection} from "@/components/shared/GlobalPartnerSection";
import {SiteFooter} from "@/components/site/SiteFooter";
import {SiteHeader} from "@/components/site/SiteHeader";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

type Props = {
  children: ReactNode;
};

export default async function SiteLayout({children}: Props) {
  const dealer = await getCurrentDealerOrThrow();

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      <SiteHeader
        brandPrimary={dealer.brandPrimary}
        brandSecondary={dealer.brandSecondary}
        accentColor={dealer.accentColor}
      />
      <main>{children}</main>
      <GlobalPartnerSection />
      <SiteFooter
        brandPrimary={dealer.brandPrimary}
        brandSecondary={dealer.brandSecondary}
        accentColor={dealer.accentColor}
        disclaimer={dealer.footerDisclaimer}
        city={dealer.city}
        country={dealer.country}
      />
    </div>
  );
}

