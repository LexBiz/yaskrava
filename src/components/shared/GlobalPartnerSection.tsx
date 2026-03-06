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
    <section className="py-12 sm:py-14" style={{background: "var(--color-bg)", borderTop: "1px solid var(--border)"}}>
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="section-accent-line" />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{color: "var(--text-3)"}}>
            {t("partnersTitle")}
          </p>
        </div>
        <PartnerGrid section="all" />
      </div>
    </section>
  );
}

