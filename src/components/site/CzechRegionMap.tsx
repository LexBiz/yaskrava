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
  Accurate Czech Republic regions — viewBox 0 0 600 315
  Coordinates derived from WGS84:
    x = (lon − 12.09) × 88.5
    y = (51.06 − lat) × 123.5
  Polygons share boundary vertices for watertight tiling.
*/
const REGIONS: Array<{id: CzechRegion; d: string; cx: number; cy: number; fs?: number}> = [
  {
    id: "KARLOVARSKY",
    d: "M0,88 L65,82 L124,93 L118,130 L111,155 L67,155 L32,136 L0,118 Z",
    cx: 60, cy: 120,
  },
  {
    id: "USTECKY",
    d: "M0,0 L217,0 L258,62 L220,80 L170,82 L124,93 L65,82 L0,88 Z",
    cx: 114, cy: 44,
  },
  {
    id: "LIBERECKY",
    d: "M217,0 L314,26 L330,55 L340,82 L295,78 L258,62 Z",
    cx: 284, cy: 40, fs: 8.5,
  },
  {
    id: "KRALOVEHRADECKY",
    d: "M314,26 L376,51 L382,94 L370,140 L325,145 L308,128 L340,82 Z",
    cx: 348, cy: 96,
  },
  {
    id: "PARDUBICKY",
    d: "M376,51 L412,88 L416,167 L376,155 L370,140 L382,94 Z",
    cx: 400, cy: 116,
  },
  {
    id: "PLZENSKY",
    d: "M0,118 L32,136 L67,155 L111,155 L130,165 L156,173 L161,200 L161,235 L94,272 L49,231 L0,198 Z",
    cx: 68, cy: 196,
  },
  {
    id: "STREDOCESKY",
    d: "M124,93 L170,82 L220,80 L258,62 L295,78 L308,128 L325,145 L370,140 L376,155 L360,185 L340,190 L308,203 L260,200 L248,198 L210,190 L178,180 L156,173 L130,165 L111,155 Z",
    cx: 252, cy: 152,
  },
  {
    id: "Praha",
    d: "M199,115 L212,110 L220,118 L216,131 L203,132 Z",
    cx: 210, cy: 124, fs: 8,
  },
  {
    id: "VYSOCINA",
    d: "M376,155 L416,167 L416,207 L400,240 L398,258 L365,262 L350,262 L310,248 L286,240 L308,203 L340,190 L360,185 Z",
    cx: 358, cy: 222,
  },
  {
    id: "JIHOCESKY",
    d: "M156,173 L178,180 L210,190 L248,198 L260,200 L308,203 L286,240 L310,248 L350,262 L316,268 L280,272 L210,285 L141,310 L94,272 L161,235 L161,200 Z",
    cx: 198, cy: 262,
  },
  {
    id: "JIHOMORAVSKY",
    d: "M350,262 L365,262 L398,258 L416,207 L491,226 L460,262 L496,286 L448,305 L430,310 L385,298 L347,285 L316,268 Z",
    cx: 422, cy: 276,
  },
  {
    id: "OLOMOUCKY",
    d: "M412,88 L509,88 L535,220 L510,225 L491,226 L416,207 L416,167 Z",
    cx: 468, cy: 164,
  },
  {
    id: "ZLINSKY",
    d: "M491,226 L510,225 L535,220 L549,249 L530,267 L496,286 L460,262 Z",
    cx: 506, cy: 255,
  },
  {
    id: "MORAVSKOSLEZSKY",
    d: "M509,88 L549,88 L599,137 L599,206 L575,240 L549,249 L535,220 Z",
    cx: 552, cy: 164,
  },
];

type Props = {
  selected: CzechRegion | null;
  onSelect: (r: CzechRegion | null) => void;
  dealerCounts?: Partial<Record<CzechRegion, number>>;
};

export function CzechRegionMap({selected, onSelect, dealerCounts = {}}: Props) {
  const [hovered, setHovered] = useState<CzechRegion | null>(null);
  const tooltip = hovered ?? selected;

  return (
    <div className="w-full select-none">

      {/* ── Desktop SVG map ─────────────────────────────────── */}
      <div className="hidden sm:block">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 40% 30%, rgba(35,16,2,0.98) 0%, rgba(8,4,0,1) 100%)",
            border: "1px solid rgba(255,121,24,0.18)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 20px 80px rgba(0,0,0,0.7), 0 0 120px rgba(255,90,0,0.04) inset",
          }}
        >
          {/* dot-grid texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}/>

          {/* Ambient bottom glow */}
          <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" style={{
            background: "radial-gradient(ellipse 70% 100% at 50% 100%, rgba(255,90,0,0.06) 0%, transparent 70%)",
          }}/>

          <svg viewBox="0 0 600 315" className="relative w-full block pt-5 pb-2 px-1">
            <defs>
              {/* Extrusion / depth filter */}
              <filter id="depth" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="rgba(0,0,0,0.9)"/>
              </filter>

              {/* Outer glow — selected */}
              <filter id="glow-sel" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="7" result="blur"/>
                <feFlood floodColor="rgba(255,121,24,0.65)" result="c"/>
                <feComposite in="c" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Soft glow — hover */}
              <filter id="glow-hov" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feFlood floodColor="rgba(255,153,2,0.45)" result="c"/>
                <feComposite in="c" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Fills */}
              <linearGradient id="f-sel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFBA40"/>
                <stop offset="50%" stopColor="#FF7918"/>
                <stop offset="100%" stopColor="#E85800"/>
              </linearGradient>
              <linearGradient id="f-hov" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,180,60,0.52)"/>
                <stop offset="100%" stopColor="rgba(220,90,0,0.38)"/>
              </linearGradient>
              <linearGradient id="f-active" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,140,30,0.28)"/>
                <stop offset="100%" stopColor="rgba(200,80,0,0.18)"/>
              </linearGradient>
              <linearGradient id="f-idle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.085)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.028)"/>
              </linearGradient>

              {/* Rim-light gradient for selected (top-left bright edge) */}
              <linearGradient id="rim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,220,100,0.6)"/>
                <stop offset="40%" stopColor="rgba(255,180,60,0.0)"/>
              </linearGradient>
            </defs>

            {REGIONS.map(({id, d, cx, cy, fs = 9.5}) => {
              const isSel   = selected === id;
              const isHov   = hovered === id;
              const count   = dealerCounts[id] ?? 0;
              const hasDeal = count > 0;

              const fill   = isSel ? "url(#f-sel)" : isHov ? "url(#f-hov)" : hasDeal ? "url(#f-active)" : "url(#f-idle)";
              const stroke = isSel ? "rgba(255,200,80,0.9)" : isHov ? "rgba(255,140,40,0.7)" : hasDeal ? "rgba(255,110,20,0.3)" : "rgba(255,255,255,0.12)";
              const sw     = isSel ? 1.5 : isHov ? 1.2 : 0.8;
              const flt    = isSel ? "url(#glow-sel)" : isHov ? "url(#glow-hov)" : "url(#depth)";

              const textFill = isSel
                ? "#1a0800"
                : isHov
                  ? "#fff"
                  : hasDeal
                    ? "rgba(255,180,80,0.95)"
                    : "rgba(255,255,255,0.38)";

              // Badge placement (top-right of label text)
              const textHalf = SHORT[id].length * (fs ?? 9.5) * 0.32;
              const bx = cx + textHalf + 9;
              const by = cy - (fs ?? 9.5) * 1.15;

              return (
                <g
                  key={id}
                  onClick={() => onSelect(selected === id ? null : id)}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{cursor: "pointer"}}
                >
                  {/* 3D extrusion shadow */}
                  <path
                    d={d}
                    fill="rgba(0,0,0,0.55)"
                    stroke="none"
                    transform="translate(3,4)"
                    style={{pointerEvents: "none"}}
                  />

                  {/* Main face */}
                  <path
                    d={d}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={sw}
                    strokeLinejoin="round"
                    filter={flt}
                    style={{transition: "fill 0.18s ease, stroke 0.18s ease, filter 0.18s ease"}}
                  />

                  {/* Rim-light overlay for selected */}
                  {isSel && (
                    <path
                      d={d}
                      fill="url(#rim)"
                      stroke="none"
                      opacity={0.55}
                      style={{pointerEvents: "none"}}
                    />
                  )}

                  {/* Label */}
                  <text
                    x={cx}
                    y={cy + (fs ?? 9.5) * 0.35}
                    textAnchor="middle"
                    fontSize={fs}
                    fontWeight={isSel ? "800" : isHov ? "700" : hasDeal ? "600" : "500"}
                    fill={textFill}
                    style={{
                      pointerEvents: "none",
                      transition: "fill 0.18s ease",
                      letterSpacing: isSel ? "0.02em" : "0",
                    }}
                  >
                    {SHORT[id]}
                  </text>

                  {/* Dealer count badge */}
                  {hasDeal && (
                    <>
                      <circle
                        cx={bx} cy={by} r={8.5}
                        fill={isSel ? "rgba(0,0,0,0.5)" : "#FF7918"}
                        stroke={isSel ? "rgba(255,200,100,0.5)" : "rgba(255,180,80,0.4)"}
                        strokeWidth={0.8}
                      />
                      <text
                        x={bx} y={by + 3.5}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight="800"
                        fill={isSel ? "#FFDD99" : "#1a0800"}
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
            className="flex items-center justify-between gap-3 px-5 py-3 min-h-[46px]"
            style={{borderTop: "1px solid rgba(255,255,255,0.06)"}}
          >
            {tooltip ? (
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: selected === tooltip
                      ? "linear-gradient(135deg,#FFBA40,#FF6010)"
                      : "rgba(255,121,24,0.4)",
                    boxShadow: selected === tooltip ? "0 0 8px rgba(255,121,24,0.7)" : "none",
                  }}
                />
                <span className="text-sm font-bold text-white truncate">
                  {CZECH_REGION_LABELS[tooltip]}
                </span>
                <span className="text-xs text-white/40 flex-shrink-0">
                  {(dealerCounts[tooltip] ?? 0) > 0
                    ? `${dealerCounts[tooltip]} ${(dealerCounts[tooltip] ?? 0) === 1 ? "дилер" : "дилери"}`
                    : "дилерів немає"}
                </span>
              </div>
            ) : (
              <span className="text-xs text-white/30">
                Натисніть на регіон для фільтрації
              </span>
            )}
            {selected && (
              <button
                onClick={() => onSelect(null)}
                className="text-xs text-white/35 hover:text-white/65 transition-colors flex-shrink-0 ml-2"
              >
                ✕ скинути
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile: styled select ────────────────────────────── */}
      <div className="sm:hidden">
        <div className="rounded-2xl overflow-hidden" style={{
          background: "rgba(25,12,2,0.95)",
          border: "1px solid rgba(255,121,24,0.18)",
        }}>
          <div className="px-4 pt-4 pb-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Оберіть регіон
            </label>
          </div>
          <div className="relative px-4 pb-4">
            <select
              value={selected ?? ""}
              onChange={(e) => onSelect((e.target.value as CzechRegion) || null)}
              className="w-full h-12 rounded-xl border border-[rgba(255,121,24,0.2)] bg-[rgba(15,7,0,0.8)] pl-4 pr-10 text-sm font-semibold text-white outline-none focus:border-[rgba(255,121,24,0.6)] appearance-none"
            >
              <option value="">Всі регіони</option>
              {REGIONS.map(({id}) => (
                <option key={id} value={id}>
                  {CZECH_REGION_LABELS[id]}
                  {(dealerCounts[id] ?? 0) > 0 ? ` · ${dealerCounts[id]}` : ""}
                </option>
              ))}
            </select>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {selected && (
            <div className="px-4 pb-3">
              <button
                onClick={() => onSelect(null)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                ✕ скинути фільтр
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
