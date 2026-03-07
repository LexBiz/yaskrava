"use client";

import {useTranslations} from "next-intl";
import {usePathname} from "next/navigation";

import {PartnerGrid} from "@/components/shared/PartnerGrid";

export function GlobalPartnerSection() {
  const t = useTranslations("Common");
  const pathname = usePathname();

  if (pathname.includes("/career") || pathname.includes("/legal")) {
    return null;
  }

  return (
    <section className="py-12 sm:py-14 section-white" style={{borderTop: "3px solid #FF7918"}}>
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="section-accent-line-orange" />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{color: "#3B3B3D", opacity: 0.55}}>
            {t("partnersTitle")}
          </p>
        </div>
        <PartnerGrid section="all" />
      </div>
    </section>
  );
}

