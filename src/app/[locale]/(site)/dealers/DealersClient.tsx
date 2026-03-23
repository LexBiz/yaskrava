"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {CzechRegionMap, CZECH_REGION_LABELS, type CzechRegion} from "@/components/site/CzechRegionMap";

type DealerCardData = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  region: CzechRegion | null;
  homeDelivery: boolean;
  vehicleCount: number;
  publicUrl: string;
};

type Props = {
  dealers: DealerCardData[];
  initialRegion: CzechRegion | null;
  dealerCounts: Partial<Record<CzechRegion, number>>;
};

export function DealersClient({dealers, initialRegion, dealerCounts}: Props) {
  const t = useTranslations("Dealers");
  const [selectedRegion, setSelectedRegion] = useState<CzechRegion | null>(initialRegion);

  const filtered = selectedRegion
    ? dealers.filter((d) => d.region === selectedRegion)
    : dealers;

  return (
    <div>
      {/* Region map */}
      <div className="mx-auto max-w-2xl mb-10">
        <CzechRegionMap
          selected={selectedRegion}
          onSelect={setSelectedRegion}
          dealerCounts={dealerCounts}
        />
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          {selectedRegion ? (
            <h2 className="text-xl font-black text-white">
              {CZECH_REGION_LABELS[selectedRegion]}
              <span className="ml-3 text-base font-semibold text-white/50">
                {t("dealerCountLabel", {count: filtered.length})}
              </span>
            </h2>
          ) : (
            <h2 className="text-xl font-black text-white">
              {t("allDealers")}
              <span className="ml-3 text-base font-semibold text-white/50">{filtered.length}</span>
            </h2>
          )}
        </div>
        {selectedRegion && (
          <button
            onClick={() => setSelectedRegion(null)}
            className="text-sm text-white/50 hover:text-white/80 underline"
          >
            {t("showAll")}
          </button>
        )}
      </div>

      {/* Dealer cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="section-accent-line mx-auto mb-4" />
          <p className="text-white/60 text-sm">{t("noDealers")}</p>
          <button
            onClick={() => setSelectedRegion(null)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:underline"
          >
            {t("showAllRegions")}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dealer) => (
            <a
              key={dealer.id}
              href={dealer.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline group"
            >
              <article className="yask-card rounded-2xl overflow-hidden h-full flex flex-col transition-transform duration-200 group-hover:-translate-y-0.5">
                <div className="h-[2px] w-full" style={{background: "linear-gradient(90deg, var(--color-accent), #FF9902, transparent)"}} />

                {dealer.homeDelivery && (
                  <div className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold"
                    style={{background: "rgba(255,121,24,0.10)", borderBottom: "1px solid rgba(255,121,24,0.12)", color: "rgba(255,153,2,0.9)"}}>
                    🏠 {t("homeDeliveryBadge")}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-white leading-tight group-hover:text-[var(--color-accent)] transition-colors">
                        {dealer.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/45">
                        {[dealer.city, dealer.region ? CZECH_REGION_LABELS[dealer.region] : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-1 text-white/25 group-hover:text-[var(--color-accent)] transition-colors">
                      <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {dealer.vehicleCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white/60"
                        style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)"}}>
                        🚗 {t("vehicles", {count: dealer.vehicleCount})}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4">
                    <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{color: "var(--color-accent)"}}>
                      {t("openSite")} →
                    </span>
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
