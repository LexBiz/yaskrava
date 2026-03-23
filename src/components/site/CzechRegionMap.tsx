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

/*
  Czech Republic SVG map — 600×310 viewBox
  Paths use smooth cubic bezier curves (C command) to create
  natural-looking region boundaries instead of hard polygon corners.
  Geographic accuracy is approximate but visually proportional.
*/
const REGIONS: Array<{id: CzechRegion; d: string; cx: number; cy: number; fs?: number}> = [
  {
    id: "KARLOVARSKY",
    // Small NW region — wine-glass shape
    d: "M5,118 C20,112 55,104 90,100 C105,98 118,100 122,108 C124,115 122,135 120,155 C118,162 110,168 90,172 C65,176 30,174 12,162 C4,156 2,138 5,118 Z",
    cx: 62, cy: 136,
  },
  {
    id: "USTECKY",
    // Wide N band
    d: "M5,118 C5,88 5,45 5,8 C60,4 130,0 200,0 C230,0 252,0 260,0 C265,25 265,52 264,78 C240,86 215,100 190,108 C165,114 140,110 122,108 C115,104 65,115 5,118 Z",
    cx: 128, cy: 52,
  },
  {
    id: "LIBERECKY",
    // Small NE triangle
    d: "M260,0 C278,0 300,2 320,5 C322,22 322,48 320,78 C304,80 285,80 264,78 C265,52 265,25 260,0 Z",
    cx: 291, cy: 40, fs: 8.5,
  },
  {
    id: "KRALOVEHRADECKY",
    // NE region, taller
    d: "M320,5 C345,8 375,15 400,22 C398,45 395,85 392,118 C385,128 370,138 352,142 C335,146 318,146 310,144 C308,120 308,95 320,78 C322,48 322,22 320,5 Z",
    cx: 356, cy: 82,
  },
  {
    id: "PARDUBICKY",
    // Narrower E region
    d: "M400,22 C420,26 440,28 455,30 C452,55 448,95 442,142 C432,144 415,144 392,118 C395,85 398,45 400,22 Z",
    cx: 426, cy: 84,
  },
  {
    id: "PLZENSKY",
    // Large W region
    d: "M5,118 C12,162 4,156 12,162 C30,174 65,176 90,172 C105,168 118,162 122,162 C128,172 136,190 142,210 C138,225 132,248 126,264 C100,268 60,265 28,258 C12,250 4,235 4,218 C4,188 5,148 5,118 Z",
    cx: 65, cy: 212,
  },
  {
    id: "STREDOCESKY",
    // Large central region (surrounds Praha)
    d: "M122,108 C140,110 165,114 190,108 C215,100 240,86 264,78 C282,78 305,78 320,78 C308,95 308,120 310,144 C318,146 335,146 352,142 C362,145 380,150 392,118 C395,145 442,142 440,144 C438,155 430,165 422,172 C410,180 392,185 372,188 C352,192 330,196 308,198 C290,200 268,200 248,198 C228,196 210,192 195,188 C180,182 165,175 155,168 C148,163 142,210 142,210 C136,190 128,172 122,162 C118,152 118,135 120,155 C122,135 124,115 122,108 Z",
    cx: 262, cy: 155,
  },
  {
    id: "Praha",
    // Tiny enclave — dot-like shape
    d: "M238,148 C245,146 252,148 254,155 C256,162 252,170 244,172 C236,172 230,165 230,158 C230,152 234,150 238,148 Z",
    cx: 242, cy: 160, fs: 8,
  },
  {
    id: "VYSOCINA",
    // Central-E region
    d: "M308,198 C330,196 352,192 372,188 C392,185 410,180 422,172 C432,165 438,155 440,144 C442,142 448,95 452,118 C450,135 448,152 444,168 C440,185 438,205 436,218 C430,238 418,254 404,260 C390,265 370,264 350,262 C330,260 310,254 292,244 C280,238 270,228 272,218 C278,208 296,202 308,198 Z",
    cx: 365, cy: 222,
  },
  {
    id: "JIHOCESKY",
    // Large SW region
    d: "M4,218 C4,235 12,250 28,258 C60,265 100,268 126,264 C132,248 138,225 142,210 C148,163 155,168 195,188 C210,192 228,196 248,198 C268,200 290,200 272,218 C270,228 280,238 292,244 C285,262 275,285 268,308 C240,316 200,320 165,318 C130,316 90,308 62,298 C35,288 12,272 5,255 C2,242 3,230 4,218 Z",
    cx: 122, cy: 278,
  },
  {
    id: "JIHOMORAVSKY",
    // SE large region — tall
    d: "M422,172 C432,165 438,155 440,144 C442,142 455,30 456,30 C468,28 480,22 488,22 C488,48 488,88 486,120 C484,152 484,182 484,210 C480,228 470,255 462,264 C452,272 435,280 418,280 C402,280 390,268 404,260 C418,254 430,238 436,218 C438,205 440,185 444,168 C448,152 450,135 452,118 C448,95 440,144 422,172 Z",
    cx: 455, cy: 188,
  },
  {
    id: "OLOMOUCKY",
    // E-central tall strip
    d: "M456,30 C468,28 480,22 488,22 C505,25 510,28 510,30 C510,65 510,108 508,148 C505,162 498,178 488,192 C486,198 486,210 484,210 C484,182 484,152 486,120 C488,88 488,48 456,30 Z",
    cx: 483, cy: 105,
  },
  {
    id: "ZLINSKY",
    // SE strip
    d: "M508,148 C510,108 510,65 510,30 C524,32 532,35 534,40 C536,68 534,110 532,150 C530,168 524,198 518,218 C512,232 504,245 496,256 C486,268 470,278 458,282 C448,286 435,280 462,264 C470,255 480,228 484,210 C486,198 488,192 508,148 Z",
    cx: 498, cy: 240,
  },
  {
    id: "MORAVSKOSLEZSKY",
    // Far NE — irregular shape
    d: "M510,30 C524,32 532,35 534,40 C548,38 568,45 584,55 C595,62 598,78 596,96 C594,118 590,152 586,178 C582,198 576,215 566,228 C554,240 540,240 532,150 C534,110 536,68 534,40 C532,35 524,32 510,30 Z",
    cx: 556, cy: 135,
  },
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
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #1e1208 0%, #150d00 100%)",
            border: "1px solid rgba(255,121,24,0.14)",
            boxShadow: "0 12px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />

          <svg
            viewBox="0 0 606 330"
            className="relative w-full block py-4 px-2"
            aria-label="Interaktivní mapa krajů České republiky"
          >
            <defs>
              <filter id="glow-selected" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feFlood floodColor="rgba(255,121,24,0.45)" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-hover" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feFlood floodColor="rgba(255,121,24,0.25)" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="fill-selected" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9902"/>
                <stop offset="100%" stopColor="#FF6010"/>
              </linearGradient>
              <linearGradient id="fill-hover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,153,2,0.5)"/>
                <stop offset="100%" stopColor="rgba(255,96,16,0.35)"/>
              </linearGradient>
              <linearGradient id="fill-active" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,121,24,0.22)"/>
                <stop offset="100%" stopColor="rgba(255,153,2,0.14)"/>
              </linearGradient>
              <linearGradient id="fill-empty" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.07)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.03)"/>
              </linearGradient>
            </defs>

            {REGIONS.map(({id, d, cx, cy, fs = 9.5}) => {
              const isSel = selected === id;
              const isHov = hovered === id;
              const count = dealerCounts[id] ?? 0;
              const hasDealer = count > 0;

              const fill = isSel ? "url(#fill-selected)"
                : isHov ? "url(#fill-hover)"
                : hasDealer ? "url(#fill-active)"
                : "url(#fill-empty)";

              const stroke = isSel ? "rgba(255,153,2,0.9)"
                : isHov ? "rgba(255,121,24,0.65)"
                : hasDealer ? "rgba(255,121,24,0.22)"
                : "rgba(255,255,255,0.10)";

              const textFill = isSel ? "#1a0d00"
                : isHov ? "rgba(255,255,255,1)"
                : hasDealer ? "rgba(255,153,2,0.9)"
                : "rgba(255,255,255,0.40)";

              // Badge position — offset to top-right of label
              const bx = cx + Math.min(SHORT[id].length * (fs * 0.38), 42) + 6;
              const by = cy - (fs * 1.2);

              return (
                <g
                  key={id}
                  onClick={() => onSelect(selected === id ? null : id)}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{cursor: "pointer"}}
                >
                  <path
                    d={d}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSel ? 1.8 : isHov ? 1.3 : 0.9}
                    strokeLinejoin="round"
                    filter={isSel ? "url(#glow-selected)" : isHov ? "url(#glow-hover)" : undefined}
                    style={{transition: "fill 0.2s ease, stroke 0.2s ease"}}
                  />

                  {/* Region name */}
                  <text
                    x={cx} y={cy + fs * 0.3}
                    textAnchor="middle"
                    fontSize={fs}
                    fontWeight={isSel ? "800" : isHov ? "700" : "500"}
                    fill={textFill}
                    fontFamily="inherit"
                    style={{pointerEvents: "none", transition: "fill 0.2s ease"}}
                  >
                    {SHORT[id]}
                  </text>

                  {/* Dealer count badge */}
                  {hasDealer && (
                    <>
                      <circle cx={bx} cy={by} r={8}
                        fill={isSel ? "rgba(0,0,0,0.45)" : "rgba(255,121,24,0.92)"}
                        stroke={isSel ? "rgba(255,255,255,0.25)" : "none"}
                        strokeWidth={1}
                      />
                      <text x={bx} y={by + 3.5} textAnchor="middle"
                        fontSize={8.5} fontWeight="800"
                        fill={isSel ? "#fff" : "#1a0d00"}
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

          {/* Info bar */}
          <div
            className="flex items-center justify-between gap-3 px-5 py-3 min-h-[44px]"
            style={{borderTop: "1px solid rgba(255,255,255,0.06)"}}
          >
            {tooltip ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{background: selected === tooltip ? "#FF9902" : "rgba(255,121,24,0.45)"}}
                />
                <span className="text-sm font-bold text-white truncate">
                  {CZECH_REGION_LABELS[tooltip]}
                </span>
                <span className="text-xs text-white/40 flex-shrink-0">
                  {(dealerCounts[tooltip] ?? 0) > 0
                    ? `${dealerCounts[tooltip]} дил.`
                    : "немає дилерів"}
                </span>
              </div>
            ) : (
              <span className="text-xs text-white/35">
                Натисніть на регіон для фільтрації
              </span>
            )}
            {selected && (
              <button
                onClick={() => onSelect(null)}
                className="text-xs text-white/35 hover:text-white/65 flex-shrink-0 transition-colors"
              >
                ✕ скинути
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile select */}
      <div className="sm:hidden">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <label className="block text-xs font-bold text-white/45 mb-3 uppercase tracking-widest">
            Ваш регіон
          </label>
          <div className="relative">
            <select
              value={selected ?? ""}
              onChange={(e) => onSelect((e.target.value as CzechRegion) || null)}
              className="w-full h-12 rounded-xl border border-[rgba(255,121,24,0.2)] bg-[rgba(30,18,8,0.9)] pl-4 pr-10 text-sm font-semibold text-white outline-none focus:border-[var(--color-accent)] appearance-none"
            >
              <option value="">Всі регіони</option>
              {REGIONS.map(({id}) => (
                <option key={id} value={id}>
                  {CZECH_REGION_LABELS[id]}
                  {(dealerCounts[id] ?? 0) > 0 ? ` · ${dealerCounts[id]}` : ""}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          {selected && (
            <button onClick={() => onSelect(null)}
              className="mt-2.5 text-xs text-white/40 hover:text-white/65 transition-colors">
              ✕ скинути фільтр
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
