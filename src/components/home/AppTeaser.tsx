import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { DownloadButtons } from "@/components/shared/DownloadButtons";
import { Link } from "@/i18n/navigation";

export function AppTeaser() {
  const t = useTranslations("AppTeaser");

  return (
    <div
      className="rounded-2xl p-7 sm:p-8"
      style={{
        background: `linear-gradient(150deg,
          rgba(8,217,110,0.10) 0%,
          rgba(8,217,110,0.02) 40%,
          rgba(255,255,255,0.02) 100%)`,
        border: "1.5px solid rgba(8,217,110,0.25)",
        boxShadow: `
          inset 0 1px 0 rgba(8,217,110,0.16),
          0 0 70px -22px rgba(8,217,110,0.28)
        `,
      }}
    >
      <span className="yask-badge">{t("eyebrow")}</span>

      <h2 className="text-gradient-white mt-5 text-2xl sm:text-3xl font-black tracking-tight leading-tight">
        {t("title")}
      </h2>

      <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
        {t("subtitle")}
      </p>

      {/* Feature list */}
      <ul className="mt-5 space-y-2.5">
        {(t.raw("bullets") as string[]).map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-sm font-medium" style={{ color: "var(--text-2)" }}>
            <span
              className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black"
              style={{ background: "rgba(8,217,110,0.18)", color: "var(--color-accent)" }}
            >
              ✓
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* Partner chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { name: "Shell",   color: "#FFD500" },
          { name: "ORLEN",   color: "#E4002B" },
          { name: "Auto Kelly", color: "#FF6600" },
          { name: "CarVertical", color: "#08D96E" },
          { name: `OMV — ${t("soon")}`, color: "rgba(255,255,255,0.25)" },
        ].map(p => (
          <span
            key={p.name}
            className="h-7 px-3 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5"
            style={{
              background: "var(--surface-2)",
              border: `1.5px solid ${p.color}33`,
              color: p.color,
            }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            {p.name}
          </span>
        ))}
      </div>

      {/* Store buttons */}
      <div className="mt-6">
        <DownloadButtons />
      </div>

      {/* Secondary link */}
      <Link
        href="/services"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: "var(--text-3)" }}
      >
        {t("ctaSecondary")} <ArrowRight size={13} />
      </Link>

      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
        {t("note")}
      </p>
    </div>
  );
}
