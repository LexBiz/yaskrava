import {ReactNode} from "react";

import {GlobalPartnerSection} from "@/components/shared/GlobalPartnerSection";
import {SiteFooter} from "@/components/site/SiteFooter";
import {SiteHeader} from "@/components/site/SiteHeader";

type Props = {
  children: ReactNode;
};

export default function SiteLayout({children}: Props) {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      <SiteHeader />
      <main>{children}</main>
      <GlobalPartnerSection />
      <SiteFooter />
    </div>
  );
}

