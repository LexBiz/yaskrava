import Image from "next/image";

function Logo({
  name,
  src,
  fit = "contain",
  scale = 1,
}: {
  name: string;
  src: string;
  fit?: "contain" | "cover";
  scale?: number;
}) {
  return (
    <span className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/[0.06] border border-white/10 relative">
      <Image
        src={src}
        alt={name}
        fill
        sizes="48px"
        className="w-full h-full"
        style={{
          objectFit: fit,
          transform: `scale(${scale})`,
        }}
      />
    </span>
  );
}

/* ── Partner data ─────────────────────────────────── */

const FUEL: Partner[] = [
  {
    name: "Shell",
    logoSrc: "/logos/shell.png",
    detail: "Cashback via app",
    accent: "#FFD500",
    border: "rgba(255,213,0,0.30)",
    bg: "rgba(255,213,0,0.08)",
  },
  {
    name: "ORLEN",
    logoSrc: "/logos/orlen.png",
    detail: "Up to 2.40 CZK/L",
    accent: "#E4002B",
    border: "rgba(228,0,43,0.28)",
    bg: "rgba(228,0,43,0.08)",
  },
  {
    name: "OMV",
    logoSrc: "/logos/omv.png",
    detail: "Coming soon",
    accent: "rgba(255,255,255,0.3)",
    border: "rgba(255,255,255,0.10)",
    bg: "rgba(255,255,255,0.03)",
    muted: true,
  },
];

const SERVICES: Partner[] = [
  {
    name: "Auto Kelly",
    logoSrc: "/logos/autokelly.png",
    detail: "Up to −60% parts",
    accent: "#FF6600",
    border: "rgba(255,102,0,0.28)",
    bg: "rgba(255,102,0,0.08)",
  },
  {
    name: "Boss Detailing",
    logoSrc: "/bos.png",
    logoFit: "cover",
    logoScale: 1.85,
    detail: "−10% detailing",
    accent: "#08D96E",
    border: "rgba(8,217,110,0.22)",
    bg: "rgba(8,217,110,0.06)",
  },
  {
    name: "CarVertical",
    logoSrc: "/logos/carvertical.png",
    detail: "−20% car check",
    accent: "#4A90D9",
    border: "rgba(74,144,217,0.28)",
    bg: "rgba(74,144,217,0.08)",
  },
  {
    name: "Vodafone",
    logoSrc: "/logos/vodafone.svg",
    logoFit: "contain",
    logoScale: 0.9,
    detail: "Telecom offers",
    accent: "#E60000",
    border: "rgba(230,0,0,0.28)",
    bg: "rgba(230,0,0,0.08)",
  },
];

interface Partner {
  name: string;
  logoSrc: string;
  logoFit?: "contain" | "cover";
  logoScale?: number;
  detail: string;
  accent: string;
  border: string;
  bg: string;
  muted?: boolean;
}

function Card({ p }: { p: Partner }) {
  return (
    <div
      className="partner-badge rounded-2xl"
      style={{
        background: p.bg,
        border: `1.5px solid ${p.border}`,
        opacity: p.muted ? 0.5 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <Logo
          name={p.name}
          src={p.logoSrc}
          fit={p.logoFit}
          scale={p.logoScale}
        />
        <div className="min-w-0">
          <div
            className="text-sm font-black truncate"
            style={{ color: p.muted ? "var(--text-3)" : "var(--text-1)" }}
          >
            {p.name}
          </div>
          <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-3)" }}>
            {p.detail}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Public API ────────────────────────────────────── */

interface Props {
  section?: "fuel" | "services" | "all";
  className?: string;
}

export function PartnerGrid({ section = "all", className = "" }: Props) {
  const list =
    section === "fuel"     ? FUEL :
    section === "services" ? SERVICES :
    [...FUEL, ...SERVICES];

  return (
    <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {list.map(p => <Card key={p.name} p={p} />)}
    </div>
  );
}
