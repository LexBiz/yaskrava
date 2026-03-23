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
  const [selected, setSelected] = useState<CzechRegion | null>(initialRegion);

  const filtered = selected ? dealers.filter((d) => d.region === selected) : dealers;
  const deliveryDealers = filtered.filter((d) => d.homeDelivery);

  return (
    <div>
      {/* Map + sidebar layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">

        {/* Map */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1" style={{background: "linear-gradient(90deg, rgba(255,121,24,0.4), transparent)"}} />
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">Карта регіонів</span>
            <div className="h-px flex-1" style={{background: "linear-gradient(270deg, rgba(255,121,24,0.4), transparent)"}} />
          </div>
          <CzechRegionMap
            selected={selected}
            onSelect={setSelected}
            dealerCounts={dealerCounts}
          />
        </div>

        {/* Stats sidebar */}
        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Статистика</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                <div className="text-2xl font-black text-white">{dealers.length}</div>
                <div className="text-xs text-white/50 mt-1">всього дилерів</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                <div className="text-2xl font-black" style={{color: "var(--color-accent)"}}>
                  {dealers.filter((d) => d.homeDelivery).length}
                </div>
                <div className="text-xs text-white/50 mt-1">з доставкою</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                <div className="text-2xl font-black text-white">
                  {dealers.reduce((s, d) => s + d.vehicleCount, 0)}
                </div>
                <div className="text-xs text-white/50 mt-1">авто загалом</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                <div className="text-2xl font-black text-white">
                  {Object.keys(dealerCounts).length}
                </div>
                <div className="text-xs text-white/50 mt-1">регіонів</div>
              </div>
            </div>
          </div>

          {/* Home delivery highlight */}
          {deliveryDealers.length > 0 && (
            <div className="rounded-2xl border border-[rgba(255,121,24,0.2)] bg-[rgba(255,121,24,0.06)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏠</span>
                <span className="text-sm font-bold text-white">Доставка додому</span>
              </div>
              <div className="grid gap-2">
                {deliveryDealers.slice(0, 4).map((d) => (
                  <a
                    key={d.id}
                    href={d.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs rounded-lg bg-white/[0.04] px-3 py-2 hover:bg-white/[0.08] transition-colors"
                  >
                    <span className="font-semibold text-white truncate">{d.name}</span>
                    <span className="text-white/40 ml-2 flex-shrink-0">→</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results section */}
      <div className="mt-12">
        {/* Results header */}
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            {selected ? (
              <>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color: "rgba(255,121,24,0.7)"}}>
                  Регіон
                </p>
                <h2 className="text-2xl font-black text-white">
                  {CZECH_REGION_LABELS[selected]}
                </h2>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color: "rgba(255,255,255,0.35)"}}>
                  Показуємо
                </p>
                <h2 className="text-2xl font-black text-white">Усі дилери</h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-bold text-white/70">
              {filtered.length} {filtered.length === 1 ? "дилер" : filtered.length < 5 ? "дилери" : "дилерів"}
            </span>
            {selected && (
              <button
                onClick={() => setSelected(null)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all"
              >
                ✕ Усі регіони
              </button>
            )}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/8 bg-white/[0.02] p-14 text-center">
            <div className="text-4xl mb-4">🗺</div>
            <h3 className="text-lg font-black text-white mb-2">У цьому регіоні дилерів поки немає</h3>
            <p className="text-sm text-white/50 mb-6">Спробуйте інший регіон або перегляньте всіх дилерів</p>
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#1a0d00] transition-all hover:opacity-90"
              style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 4px 20px -4px rgba(255,121,24,0.5)"}}
            >
              Показати всіх дилерів
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DealerCard({dealer}: {dealer: {id: string; name: string; city: string | null; region: CzechRegion | null; homeDelivery: boolean; vehicleCount: number; publicUrl: string}}) {
  return (
    <a
      href={dealer.publicUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block no-underline h-full"
    >
      <article
        className="relative h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-200 group-hover:translate-y-[-2px]"
        style={{
          background: "linear-gradient(135deg, rgba(40,22,6,0.9) 0%, rgba(26,13,0,0.95) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Accent top line */}
        <div
          className="h-[2px] w-full opacity-60 group-hover:opacity-100 transition-opacity"
          style={{background: "linear-gradient(90deg, #FF7918, #FF9902, transparent)"}}
        />

        {/* Home delivery banner */}
        {dealer.homeDelivery && (
          <div
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold"
            style={{background: "rgba(255,121,24,0.12)", borderBottom: "1px solid rgba(255,121,24,0.15)", color: "rgba(255,153,2,0.9)"}}
          >
            <span>🏠</span>
            <span>Доставка авто додому</span>
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Name + arrow */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-white leading-tight group-hover:text-[var(--color-accent)] transition-colors duration-200">
                {dealer.name}
              </h3>
              {(dealer.city || dealer.region) && (
                <p className="mt-1.5 text-xs text-white/45">
                  {[dealer.city, dealer.region ? CZECH_REGION_LABELS[dealer.region] : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
            <div
              className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-[rgba(255,121,24,0.15)]"
              style={{border: "1px solid rgba(255,255,255,0.1)"}}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-[var(--color-accent)] transition-colors"/>
              </svg>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 flex flex-wrap gap-2">
            {dealer.vehicleCount > 0 ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white/65"
                style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)"}}
              >
                <span style={{color: "rgba(255,121,24,0.7)"}}>🚗</span>
                {dealer.vehicleCount} авто в наявності
              </span>
            ) : (
              <span
                className="inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white/30"
                style={{background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)"}}
              >
                Немає авто
              </span>
            )}
          </div>

          {/* CTA link */}
          <div className="mt-auto pt-4">
            <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{color: "var(--color-accent)"}}>
              Відкрити сайт дилера →
            </span>
          </div>
        </div>
      </article>
    </a>
  );
}
