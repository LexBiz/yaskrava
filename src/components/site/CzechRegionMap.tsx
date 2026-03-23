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

// Approximate SVG paths for Czech Republic regions (600×320 viewBox)
const REGION_PATHS: Array<{id: CzechRegion; d: string; labelX: number; labelY: number; labelSize?: number}> = [
  {id: "KARLOVARSKY",     d: "M5,108 L118,102 L122,162 L40,172 L5,155 Z",                                                                         labelX: 55,  labelY: 133},
  {id: "USTECKY",         d: "M5,0 L258,0 L262,78 L212,107 L118,102 L5,108 Z",                                                                   labelX: 125, labelY: 48},
  {id: "LIBERECKY",       d: "M258,0 L328,5 L320,78 L262,78 Z",                                                                                   labelX: 292, labelY: 38},
  {id: "KRALOVEHRADECKY", d: "M328,5 L400,20 L392,145 L310,145 L320,78 Z",                                                                        labelX: 358, labelY: 82},
  {id: "PARDUBICKY",      d: "M400,20 L456,28 L440,145 L392,145 Z",                                                                               labelX: 422, labelY: 85},
  {id: "PLZENSKY",        d: "M5,155 L40,172 L122,162 L145,210 L125,262 L5,252 Z",                                                                labelX: 62,  labelY: 208},
  {id: "STREDOCESKY",     d: "M118,102 L212,107 L262,78 L320,78 L310,145 L392,145 L440,145 L435,162 L355,182 L286,196 L214,194 L145,210 L122,162 Z", labelX: 252, labelY: 158},
  {id: "Praha",           d: "M214,148 L232,142 L244,156 L236,170 L214,168 Z",                                                                    labelX: 228, labelY: 158, labelSize: 9},
  {id: "VYSOCINA",        d: "M286,196 L355,182 L435,162 L440,145 L436,215 L392,252 L326,258 L268,238 Z",                                         labelX: 362, labelY: 218},
  {id: "JIHOCESKY",       d: "M5,252 L125,262 L145,210 L214,194 L268,238 L258,308 L158,318 L48,300 L5,278 Z",                                     labelX: 122, labelY: 278},
  {id: "JIHOMORAVSKY",    d: "M435,162 L440,145 L456,28 L488,20 L484,210 L458,258 L416,276 L392,252 L436,215 Z",                                  labelX: 455, labelY: 180},
  {id: "OLOMOUCKY",       d: "M456,28 L508,28 L506,148 L484,210 L440,145 Z",                                                                      labelX: 480, labelY: 105},
  {id: "ZLINSKY",         d: "M506,148 L484,210 L458,258 L416,276 L486,290 L540,238 L532,148 Z",                                                  labelX: 497, labelY: 240},
  {id: "MORAVSKOSLEZSKY", d: "M508,28 L592,60 L588,215 L540,238 L532,148 L506,148 Z",                                                             labelX: 555, labelY: 130},
];

type Props = {
  selected: CzechRegion | null;
  onSelect: (region: CzechRegion | null) => void;
  dealerCounts?: Partial<Record<CzechRegion, number>>;
};

export function CzechRegionMap({selected, onSelect, dealerCounts = {}}: Props) {
  const [hovered, setHovered] = useState<CzechRegion | null>(null);

  function handleClick(id: CzechRegion) {
    onSelect(selected === id ? null : id);
  }

  return (
    <div className="w-full">
      {/* Desktop: SVG map */}
      <div className="hidden sm:block">
        <svg
          viewBox="0 0 600 325"
          className="w-full max-w-2xl mx-auto block"
          style={{filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.35))"}}
          aria-label="Mapa krajů České republiky"
        >
          {REGION_PATHS.map(({id, d, labelX, labelY, labelSize = 10}) => {
            const isSelected = selected === id;
            const isHovered = hovered === id;
            const count = dealerCounts[id] ?? 0;
            const active = isSelected || isHovered;

            return (
              <g
                key={id}
                onClick={() => handleClick(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                style={{cursor: "pointer"}}
                aria-label={CZECH_REGION_LABELS[id]}
              >
                <path
                  d={d}
                  fill={
                    isSelected
                      ? "var(--color-accent)"
                      : isHovered
                        ? "rgba(255,121,24,0.45)"
                        : count > 0
                          ? "rgba(255,121,24,0.18)"
                          : "rgba(255,255,255,0.07)"
                  }
                  stroke={
                    isSelected
                      ? "var(--color-accent)"
                      : active
                        ? "rgba(255,121,24,0.7)"
                        : "rgba(255,255,255,0.2)"
                  }
                  strokeWidth={isSelected ? 1.5 : 1}
                  style={{transition: "fill 0.15s, stroke 0.15s"}}
                />
                {/* Region label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={labelSize}
                  fontWeight={isSelected ? "800" : "600"}
                  fill={isSelected ? "#1a0d00" : active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)"}
                  style={{pointerEvents: "none", userSelect: "none"}}
                >
                  {id === "Praha" ? "PR" : id === "STREDOCESKY" ? "SČ" : id === "JIHOCESKY" ? "JČ" : id === "PLZENSKY" ? "PL" : id === "KARLOVARSKY" ? "KV" : id === "USTECKY" ? "ÚL" : id === "LIBERECKY" ? "LI" : id === "KRALOVEHRADECKY" ? "KH" : id === "PARDUBICKY" ? "PA" : id === "VYSOCINA" ? "VY" : id === "JIHOMORAVSKY" ? "JM" : id === "OLOMOUCKY" ? "OL" : id === "ZLINSKY" ? "ZL" : "MS"}
                </text>
                {/* Dealer count badge */}
                {count > 0 && (
                  <circle
                    cx={labelX + 8}
                    cy={labelY - 8}
                    r={7}
                    fill={isSelected ? "rgba(0,0,0,0.5)" : "var(--color-accent)"}
                  />
                )}
                {count > 0 && (
                  <text
                    x={labelX + 8}
                    y={labelY - 4}
                    textAnchor="middle"
                    fontSize={8}
                    fontWeight="800"
                    fill={isSelected ? "#fff" : "#1a0d00"}
                    style={{pointerEvents: "none", userSelect: "none"}}
                  >
                    {count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        {selected && (
          <div className="mt-3 flex items-center justify-center gap-3 text-sm">
            <span className="text-white font-semibold">{CZECH_REGION_LABELS[selected]}</span>
            <button
              onClick={() => onSelect(null)}
              className="text-white/50 hover:text-white/80 text-xs underline"
            >
              скинути
            </button>
          </div>
        )}
        {!selected && (
          <p className="mt-3 text-center text-xs text-white/40">Натисніть на регіон для фільтрації дилерів</p>
        )}
      </div>

      {/* Mobile: dropdown */}
      <div className="sm:hidden">
        <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
          Ваш регіон
        </label>
        <select
          value={selected ?? ""}
          onChange={(e) => onSelect((e.target.value as CzechRegion) || null)}
          className="w-full h-12 rounded-2xl border border-white/15 bg-[rgba(40,25,8,0.70)] px-4 text-sm font-semibold text-white outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">Усі регіони</option>
          {REGION_PATHS.map(({id}) => (
            <option key={id} value={id}>
              {CZECH_REGION_LABELS[id]}
              {(dealerCounts[id] ?? 0) > 0 ? ` (${dealerCounts[id]})` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
