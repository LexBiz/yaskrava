import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { QuickEstimate } from "@/components/home/QuickEstimate";
import { DownloadButtons } from "@/components/shared/DownloadButtons";
import { PartnerGrid } from "@/components/shared/PartnerGrid";
import { Link } from "@/i18n/navigation";

/* ─── helpers ─────────────────────────────────────── */

function Divider() {
  return <div className="glow-line" />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8 sm:mb-10">
      <div className="section-accent-line" />
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "var(--text-3)" }}>
        {children}
      </p>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────── */

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <>
      {/* ══ HERO ═══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-black"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 0% 0%, rgba(8,217,110,0.07) 0%, transparent 65%)," +
            "radial-gradient(ellipse 50% 60% at 100% 90%, rgba(255,255,255,0.02) 0%, transparent 55%)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_420px] lg:py-24 xl:py-28">

            {/* Left */}
            <div>
              <span className="yask-badge">Praha · Czech Republic</span>

              <h1
                className="text-gradient-hero mt-5 font-black tracking-tight leading-[1.03]"
                style={{ fontSize: "clamp(2.4rem, 5.5vw, 5.5rem)" }}
              >
                {t("heroTitle")}
              </h1>

              <p
                className="mt-5 text-base sm:text-lg leading-relaxed max-w-lg font-medium"
                style={{ color: "var(--text-2)" }}
              >
                {t("heroSubtitle")}
              </p>

              {/* Primary: app download */}
              <div className="mt-7">
                <DownloadButtons />
              </div>

              {/* Secondary links */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/fuel"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-bold transition-colors"
                  style={{ border: "1.5px solid var(--border-md)", color: "var(--text-2)" }}
                >
                  ⛽ {t("ctaSecondary")}
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-bold transition-colors"
                  style={{ border: "1.5px solid var(--border-md)", color: "var(--text-2)" }}
                >
                  {t("sectionsTitle")} <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Right — leasing quick calculator */}
            <QuickEstimate />
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ PARTNERS (real logos) ═══════════════════════════ */}
      <section className="bg-black py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Label>Partners</Label>
          <PartnerGrid section="all" />
        </div>
      </section>

      <Divider />

      {/* ══ WHAT'S INSIDE THE APP ══════════════════════════ */}
      <section className="bg-black py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Label>{t("sectionsTitle")}</Label>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                { n: "01", tk: "cards.fuelTitle",      tx: "cards.fuelText",      href: "/fuel"       },
                { n: "02", tk: "cards.autoTitle",      tx: "cards.autoText",      href: "/services"   },
                { n: "03", tk: "cards.financeTitle",   tx: "cards.financeText",   href: "/calculator" },
                { n: "04", tk: "cards.insuranceTitle", tx: "cards.insuranceText", href: "/services"   },
                { n: "05", tk: "cards.otherTitle",     tx: "cards.otherText",     href: "/services"   },
                { n: "06", tk: "cards.walletTitle",    tx: "cards.walletText",    href: "/apply"      },
              ] as const
            ).map(c => (
              <Link
                key={c.n}
                href={c.href}
                className="yask-card group rounded-2xl p-6 sm:p-7 flex flex-col gap-3 no-underline"
              >
                <span className="text-[10px] font-black tabular-nums tracking-widest" style={{ color: "var(--text-3)" }}>
                  {c.n}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">{t(c.tk as never)}</h3>
                <p className="text-sm sm:text-base leading-relaxed flex-1 font-medium" style={{ color: "var(--text-2)" }}>
                  {t(c.tx as never)}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  {t("cards.learnMore")} <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ HOW IT WORKS ═══════════════════════════════════ */}
      <section className="bg-black py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Label>{t("howTitle")}</Label>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3">
            {(["step1", "step2", "step3"] as const).map((k, i) => (
              <div key={k} className="flex gap-4 sm:gap-5">
                <span
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border"
                  style={{
                    background:  "var(--surface-2)",
                    color:       "var(--color-accent)",
                    borderColor: "rgba(8,217,110,0.25)",
                    boxShadow:   "0 0 24px -8px rgba(8,217,110,0.35)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-base font-black text-white">{t(`${k}Title`)}</h3>
                  <p className="mt-1.5 text-sm sm:text-base leading-relaxed font-medium" style={{ color: "var(--text-2)" }}>
                    {t(`${k}Text`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ DOWNLOAD CTA ═══════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-14 sm:py-20"
        style={{ background: "var(--color-accent)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center gap-8 justify-between">
          <div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-black leading-tight tracking-tight">
              {t("ctaStripTitle")}
            </p>
            <p className="mt-2 text-base text-black/65 font-semibold">{t("ctaStripSub")}</p>
          </div>
          <div className="shrink-0">
            <DownloadButtons />
          </div>
        </div>
      </section>
    </>
  );
}
