"use client";

import {useState} from "react";
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
                {filtered.length} {filtered.length === 1 ? "дилер" : filtered.length < 5 ? "дилери" : "дилерів"}
              </span>
            </h2>
          ) : (
            <h2 className="text-xl font-black text-white">
              Усі дилери
              <span className="ml-3 text-base font-semibold text-white/50">{filtered.length}</span>
            </h2>
          )}
        </div>
        {selectedRegion && (
          <button
            onClick={() => setSelectedRegion(null)}
            className="text-sm text-white/50 hover:text-white/80 underline"
          >
            Показати всіх
          </button>
        )}
      </div>

      {/* Dealer cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="section-accent-line mx-auto mb-4" />
          <p className="text-white/60 text-sm">У цьому регіоні дилерів поки немає</p>
          <button
            onClick={() => setSelectedRegion(null)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:underline"
          >
            Показати всі регіони
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
              <article className="yask-card rounded-2xl overflow-hidden h-full flex flex-col">
                {/* Header strip */}
                <div
                  className="h-2 w-full"
                  style={{background: "linear-gradient(90deg, var(--color-accent), #FF9902)"}}
                />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-white leading-tight group-hover:text-[var(--color-accent)] transition-colors">
                        {dealer.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/55">
                        {dealer.city && <span>{dealer.city}</span>}
                        {dealer.city && dealer.region && <span className="mx-1">·</span>}
                        {dealer.region && (
                          <span>{CZECH_REGION_LABELS[dealer.region]}</span>
                        )}
                      </p>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="flex-shrink-0 mt-0.5 text-white/30 group-hover:text-[var(--color-accent)] transition-colors"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {dealer.vehicleCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                        🚗 {dealer.vehicleCount} авто
                      </span>
                    )}
                    {dealer.homeDelivery && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1 text-[11px] font-semibold text-[var(--color-accent)]">
                        🏠 Доставка додому
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 text-xs font-semibold text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Відкрити сайт →
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
