"use client";

import {useState} from "react";

export type CzechRegion =
  | "Praha"
  | "STREDOCESKY"
  | "JIHOCESKY"
  | "PLZENSKY"
  | "KARLOVARSKY"
  | "USTECKY"
  | "LIBERECKY"
  | "KRALOVEHRADECKY"
  | "PARDUBICKY"
  | "VYSOCINA"
  | "JIHOMORAVSKY"
  | "OLOMOUCKY"
  | "ZLINSKY"
  | "MORAVSKOSLEZSKY";

export const CZECH_REGION_LABELS: Record<CzechRegion, string> = {
  Praha: "Praha",
  STREDOCESKY: "Středočeský kraj",
  JIHOCESKY: "Jihočeský kraj",
  PLZENSKY: "Plzeňský kraj",
  KARLOVARSKY: "Karlovarský kraj",
  USTECKY: "Ústecký kraj",
  LIBERECKY: "Liberecký kraj",
  KRALOVEHRADECKY: "Královéhradecký kraj",
  PARDUBICKY: "Pardubický kraj",
  VYSOCINA: "Kraj Vysočina",
  JIHOMORAVSKY: "Jihomoravský kraj",
  OLOMOUCKY: "Olomoucký kraj",
  ZLINSKY: "Zlínský kraj",
  MORAVSKOSLEZSKY: "Moravskoslezský kraj",
};

// Short labels displayed on map
const SHORT: Record<CzechRegion, string> = {
  Praha: "Praha",
  STREDOCESKY: "Středočeský",
  JIHOCESKY: "Jihočeský",
  PLZENSKY: "Plzeňský",
  KARLOVARSKY: "Karlovarský",
  USTECKY: "Ústecký",
  LIBERECKY: "Liberecký",
  KRALOVEHRADECKY: "Královéhradecký",
  PARDUBICKY: "Pardubický",
  VYSOCINA: "Vysočina",
  JIHOMORAVSKY: "Jihomoravský",
  OLOMOUCKY: "Olomoucký",
  ZLINSKY: "Zlínský",
  MORAVSKOSLEZSKY: "Moravskoslezský",
};

// SVG paths (600×320 viewBox, approximate Czech region boundaries)
const REGIONS: Array<{
  id: CzechRegion;
  d: string;
  cx: number;
  cy: number;
  fs?: number;
}> = [
  {id: "KARLOVARSKY",     d: "M5,108 L118,102 L122,162 L40,172 L5,155 Z",                                                                                           cx: 58,  cy: 134},
  {id: "USTECKY",         d: "M5,0 L258,0 L262,78 L212,107 L118,102 L5,108 Z",                                                                                     cx: 122, cy: 50},
  {id: "LIBERECKY",       d: "M258,0 L328,5 L320,78 L262,78 Z",                                                                                                     cx: 292, cy: 40,  fs: 8.5},
  {id: "KRALOVEHRADECKY", d: "M328,5 L400,20 L392,145 L310,145 L320,78 Z",                                                                                          cx: 358, cy: 84},
  {id: "PARDUBICKY",      d: "M400,20 L456,28 L440,145 L392,145 Z",                                                                                                 cx: 424, cy: 86},
  {id: "PLZENSKY",        d: "M5,155 L40,172 L122,162 L145,210 L125,262 L5,252 Z",                                                                                  cx: 62,  cy: 207},
  {id: "STREDOCESKY",     d: "M118,102 L212,107 L262,78 L320,78 L310,145 L392,145 L440,145 L435,162 L355,182 L286,196 L214,194 L145,210 L122,162 Z",               cx: 260, cy: 155},
  {id: "Praha",           d: "M214,148 L232,142 L244,156 L236,170 L214,168 Z",                                                                                      cx: 229, cy: 157, fs: 8},
  {id: "VYSOCINA",        d: "M286,196 L355,182 L435,162 L440,145 L436,215 L392,252 L326,258 L268,238 Z",                                                           cx: 365, cy: 218},
  {id: "JIHOCESKY",       d: "M5,252 L125,262 L145,210 L214,194 L268,238 L258,308 L158,318 L48,300 L5,278 Z",                                                      cx: 118, cy: 278},
  {id: "JIHOMORAVSKY",    d: "M435,162 L440,145 L456,28 L488,20 L484,210 L458,258 L416,276 L392,252 L436,215 Z",                                                   cx: 454, cy: 185},
  {id: "OLOMOUCKY",       d: "M456,28 L508,28 L506,148 L484,210 L440,145 Z",                                                                                        cx: 481, cy: 105},
  {id: "ZLINSKY",         d: "M506,148 L484,210 L458,258 L416,276 L486,290 L540,238 L532,148 Z",                                                                    cx: 498, cy: 242},
  {id: "MORAVSKOSLEZSKY", d: "M508,28 L592,60 L588,215 L540,238 L532,148 L506,148 Z",                                                                               cx: 552, cy: 135},
];

type Props = {
  selected: CzechRegion | null;
  onSelect: (region: CzechRegion | null) => void;
  dealerCounts?: Partial<Record<CzechRegion, number>>;
};

export function CzechRegionMap({selected, onSelect, dealerCounts = {}}: Props) {
  const [hovered, setHovered] = useState<CzechRegion | null>(null);
  const tooltip = hovered ?? selected;

  return (
    <div className="w-full select-none">
      {/* Desktop SVG map */}
      <div className="hidden sm:block">
        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(26,13,0,0.95) 0%, rgba(40,20,5,0.95) 100%)",
            border: "1px solid rgba(255,121,24,0.12)",
            boxShadow: "0 0 60px rgba(255,121,24,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>

          {/* Subtle grid texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          <svg
            viewBox="0 0 600 325"
            className="relative w-full block"
            aria-label="Interaktivní mapa krajů České republiky"
          >
            <defs>
              {/* Glow filter for selected/hover */}
              <filter id="region-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="region-glow-strong" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feFlood floodColor="rgba(255,121,24,0.5)" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Pattern for regions with dealers */}
              <linearGradient id="grad-active" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,121,24,0.35)" />
                <stop offset="100%" stopColor="rgba(255,153,2,0.20)" />
              </linearGradient>

              <linearGradient id="grad-selected" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9902" />
                <stop offset="100%" stopColor="#FF7918" />
              </linearGradient>

              <linearGradient id="grad-hover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,121,24,0.55)" />
                <stop offset="100%" stopColor="rgba(255,153,2,0.35)" />
              </linearGradient>

              <linearGradient id="grad-empty" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
              </linearGradient>
            </defs>

            {/* Render regions */}
            {REGIONS.map(({id, d, cx, cy, fs = 9.5}) => {
              const isSelected = selected === id;
              const isHovered = hovered === id;
              const count = dealerCounts[id] ?? 0;
              const hasDealer = count > 0;

              let fill = "url(#grad-empty)";
              if (isSelected) fill = "url(#grad-selected)";
              else if (isHovered) fill = "url(#grad-hover)";
              else if (hasDealer) fill = "url(#grad-active)";

              const strokeColor = isSelected
                ? "rgba(255,153,2,0.9)"
                : isHovered
                  ? "rgba(255,121,24,0.7)"
                  : hasDealer
                    ? "rgba(255,121,24,0.25)"
                    : "rgba(255,255,255,0.12)";

              const textColor = isSelected
                ? "#1a0d00"
                : isHovered
                  ? "rgba(255,255,255,1)"
                  : hasDealer
                    ? "rgba(255,153,2,0.95)"
                    : "rgba(255,255,255,0.45)";

              return (
                <g
                  key={id}
                  onClick={() => onSelect(selected === id ? null : id)}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{cursor: "pointer"}}
                >
                  {/* Glow shadow for selected */}
                  {isSelected && (
                    <path
                      d={d}
                      fill="rgba(255,121,24,0.3)"
                      stroke="none"
                      filter="url(#region-glow-strong)"
                    />
                  )}

                  {/* Main region shape */}
                  <path
                    d={d}
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 1.5 : isHovered ? 1.2 : 0.8}
                    style={{
                      transition: "fill 0.18s ease, stroke 0.18s ease, stroke-width 0.18s ease",
                    }}
                  />

                  {/* Region label */}
                  <text
                    x={cx}
                    y={cy + (fs ?? 9.5) / 3}
                    textAnchor="middle"
                    fontSize={fs}
                    fontWeight={isSelected ? "800" : isHovered ? "700" : hasDealer ? "600" : "500"}
                    fill={textColor}
                    fontFamily="inherit"
                    style={{
                      transition: "fill 0.18s ease",
                      pointerEvents: "none",
                    }}
                  >
                    {SHORT[id]}
                  </text>

                  {/* Dealer count badge */}
                  {hasDealer && (
                    <>
                      <circle
                        cx={cx + (SHORT[id].length * (fs ?? 9.5)) / 2.2 + 8}
                        cy={cy - 8}
                        r={8}
                        fill={isSelected ? "rgba(0,0,0,0.4)" : "rgba(255,121,24,0.9)"}
                        stroke={isSelected ? "rgba(255,255,255,0.3)" : "none"}
                        strokeWidth={1}
                      />
                      <text
                        x={cx + (SHORT[id].length * (fs ?? 9.5)) / 2.2 + 8}
                        y={cy - 4}
                        textAnchor="middle"
                        fontSize={8.5}
                        fontWeight="800"
                        fill={isSelected ? "#fff" : "#1a0d00"}
                        style={{pointerEvents: "none"}}
                      >
                        {count}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip bar */}
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between min-h-[44px]">
            {tooltip ? (
              <div className="flex items-center gap-3">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{background: selected === tooltip ? "var(--color-accent)" : "rgba(255,121,24,0.5)"}}
                />
                <span className="text-sm font-bold text-white">
                  {CZECH_REGION_LABELS[tooltip]}
                </span>
                {(dealerCounts[tooltip] ?? 0) > 0 && (
                  <span className="text-xs text-white/50">
                    {dealerCounts[tooltip]} {(dealerCounts[tooltip] ?? 0) === 1 ? "дилер" : "дилери"}
                  </span>
                )}
                {(dealerCounts[tooltip] ?? 0) === 0 && (
                  <span className="text-xs text-white/35">немає дилерів</span>
                )}
              </div>
            ) : (
              <span className="text-xs text-white/35">Натисніть на регіон, щоб відфільтрувати дилерів</span>
            )}
            {selected && (
              <button
                onClick={() => onSelect(null)}
                className="text-xs font-semibold text-white/40 hover:text-white/70 transition-colors ml-4 flex-shrink-0"
              >
                ✕ скинути
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: styled select */}
      <div className="sm:hidden">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <label className="block text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">
            Оберіть свій регіон
          </label>
          <select
            value={selected ?? ""}
            onChange={(e) => onSelect((e.target.value as CzechRegion) || null)}
            className="w-full h-12 rounded-xl border border-[rgba(255,121,24,0.2)] bg-[rgba(40,20,5,0.9)] px-4 text-sm font-semibold text-white outline-none focus:border-[var(--color-accent)] appearance-none"
            style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center"}}
          >
            <option value="">Всі регіони</option>
            {REGIONS.map(({id}) => (
              <option key={id} value={id}>
                {CZECH_REGION_LABELS[id]}
                {(dealerCounts[id] ?? 0) > 0 ? ` · ${dealerCounts[id]} дил.` : ""}
              </option>
            ))}
          </select>
          {selected && (
            <button
              onClick={() => onSelect(null)}
              className="mt-3 text-xs text-white/40 hover:text-white/70 flex items-center gap-1"
            >
              ✕ скинути фільтр
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
