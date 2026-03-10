import {ReactNode} from "react";

import {SiteFooter} from "@/components/site/SiteFooter";
import {SiteHeader} from "@/components/site/SiteHeader";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

export default async function SiteLayout({children}: {children: ReactNode}) {
  const dealer = await getCurrentDealerOrThrow();
  return (
    <div style={{background: "#3B3B3D", color: "#FFFFFF"}}>
      <SiteHeader
        brandPrimary={dealer.brandPrimary}
        brandSecondary={dealer.brandSecondary}
        accentColor={dealer.accentColor}
      />
      <main>{children}</main>
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
