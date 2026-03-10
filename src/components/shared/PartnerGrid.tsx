import Image from "next/image";
import {useTranslations} from "next-intl";

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
    <span
      className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative"
      style={{
        background: "rgba(59,59,61,0.06)",
        border: "1px solid rgba(59,59,61,0.10)",
      }}
    >
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
  const t = useTranslations("PartnerGrid");
  const fuel: Partner[] = [
    {
      name: "Shell",
      logoSrc: "/logos/shell.png",
      detail: t("shell"),
      accent: "#FFD500",
      border: "rgba(255,213,0,0.30)",
      bg: "rgba(255,213,0,0.08)",
    },
    {
      name: "ORLEN",
      logoSrc: "/logos/orlen.png",
      detail: t("orlen"),
      accent: "#E4002B",
      border: "rgba(228,0,43,0.28)",
      bg: "rgba(228,0,43,0.08)",
    },
    {
      name: "OMV",
      logoSrc: "/logos/omv.png",
      detail: t("omv"),
      accent: "rgba(255,255,255,0.3)",
      border: "rgba(255,255,255,0.10)",
      bg: "rgba(255,255,255,0.03)",
      muted: true,
    },
  ];
  const services: Partner[] = [
    {
      name: "Boss Detailing",
      logoSrc: "/bos.png",
      logoFit: "cover",
      logoScale: 1.18,
      detail: t("bossDetailing"),
      accent: "#08D96E",
      border: "rgba(8,217,110,0.22)",
      bg: "rgba(8,217,110,0.06)",
    },
    {
      name: "CarVertical",
      logoSrc: "/logos/carvertical.png",
      detail: t("carVertical"),
      accent: "#4A90D9",
      border: "rgba(74,144,217,0.28)",
      bg: "rgba(74,144,217,0.08)",
    },
    {
      name: "Vodafone",
      logoSrc: "/logos/vodafone.svg",
      logoFit: "contain",
      logoScale: 0.9,
      detail: t("vodafone"),
      accent: "#E60000",
      border: "rgba(230,0,0,0.28)",
      bg: "rgba(230,0,0,0.08)",
    },
  ];
  const list =
    section === "fuel"     ? fuel :
    section === "services" ? services :
    [...fuel, ...services];

  const shops: Partner[] = [
    {
      name: "Auto Kelly",
      logoSrc: "/logos/autokelly.png",
      detail: t("autoKelly"),
      accent: "#FF6600",
      border: "rgba(255,102,0,0.28)",
      bg: "rgba(255,102,0,0.08)",
    },
    {
      name: "CarVertical",
      logoSrc: "/logos/carvertical.png",
      detail: t("carVertical"),
      accent: "#4A90D9",
      border: "rgba(74,144,217,0.28)",
      bg: "rgba(74,144,217,0.08)",
    },
    {
      name: "Vodafone",
      logoSrc: "/logos/vodafone.svg",
      logoFit: "contain",
      logoScale: 0.9,
      detail: t("vodafone"),
      accent: "#E60000",
      border: "rgba(230,0,0,0.28)",
      bg: "rgba(230,0,0,0.08)",
    },
  ];

  if (section === "all") {
    const groups = [
      {title: t("fuelCategory"), icon: "⛽", items: fuel},
      {title: t("servicesCategory"), icon: "🛠️", items: services},
      {title: t("shopsCategory"), icon: "🛍️", items: shops},
    ];

    return (
      <div className={`grid gap-4 lg:grid-cols-3 ${className}`}>
        {groups.map((group) => (
          <section
            key={group.title}
            className="rounded-[24px] border border-[rgba(59,59,61,0.10)] bg-white p-5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,121,24,0.10)] text-lg">
                {group.icon}
              </span>
              <div>
                <h3 className="text-sm font-black" style={{color: "#3B3B3D"}}>{group.title}</h3>
                <p className="text-xs" style={{color: "rgba(59,59,61,0.50)"}}>
                  {group.items.length} {t("partnersCount")}
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {group.items.map((p) => <Card key={p.name} p={p} />)}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {list.map(p => <Card key={p.name} p={p} />)}
    </div>
  );
}
