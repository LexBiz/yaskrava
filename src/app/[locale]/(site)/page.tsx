import {ArrowRight, Flame, Car, CreditCard, Shield, Wrench, Wallet} from "lucide-react";
import {useTranslations} from "next-intl";

import {QuickEstimate} from "@/components/home/QuickEstimate";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PartnerGrid} from "@/components/shared/PartnerGrid";
import {Link} from "@/i18n/navigation";

function SectionLabel({children}: {children: React.ReactNode}) {
  return (
    <div className="flex items-center gap-3 mb-8 sm:mb-10">
      <div className="section-accent-line" />
      <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{color: "var(--text-3)"}}>
        {children}
      </p>
    </div>
  );
}

function Divider() {
  return <div className="glow-line" />;
}

const FEATURES = [
  {
    n: "01",
    icon: Flame,
    tk: "cards.fuelTitle",
    tx: "cards.fuelText",
    href: "/fuel",
    accent: "#FE9302",
    bg: "rgba(254,147,2,0.10)",
    border: "rgba(254,147,2,0.22)",
  },
  {
    n: "02",
    icon: Wrench,
    tk: "cards.autoTitle",
    tx: "cards.autoText",
    href: "/services",
    accent: "#FF7918",
    bg: "rgba(255,121,24,0.10)",
    border: "rgba(255,121,24,0.22)",
  },
  {
    n: "03",
    icon: CreditCard,
    tk: "cards.financeTitle",
    tx: "cards.financeText",
    href: "/calculator",
    accent: "#FF5A2A",
    bg: "rgba(255,90,42,0.10)",
    border: "rgba(255,90,42,0.22)",
  },
  {
    n: "04",
    icon: Shield,
    tk: "cards.insuranceTitle",
    tx: "cards.insuranceText",
    href: "/services",
    accent: "#FE9302",
    bg: "rgba(254,147,2,0.08)",
    border: "rgba(254,147,2,0.18)",
  },
  {
    n: "05",
    icon: Car,
    tk: "cards.otherTitle",
    tx: "cards.otherText",
    href: "/services",
    accent: "#FF7918",
    bg: "rgba(255,121,24,0.08)",
    border: "rgba(255,121,24,0.18)",
  },
  {
    n: "06",
    icon: Wallet,
    tk: "cards.walletTitle",
    tx: "cards.walletText",
    href: "/apply",
    accent: "#FF5A2A",
    bg: "rgba(255,90,42,0.08)",
    border: "rgba(255,90,42,0.18)",
  },
] as const;

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <>
      {/* ══ HERO ════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "var(--color-bg)",
          backgroundImage:
            "radial-gradient(ellipse 65% 60% at 5% -5%, rgba(255,121,24,0.09) 0%, transparent 62%)," +
            "radial-gradient(ellipse 50% 40% at 95% 95%, rgba(255,90,42,0.06) 0%, transparent 55%)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            opacity: 0.018,
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 30%, black 20%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_440px] lg:py-24 xl:py-28">

            {/* Left */}
            <div className="max-w-xl">
              {/* Eyebrow badge */}
              <div className="yask-badge">
                Praha · Czech Republic
              </div>

              {/* Headline */}
              <h1
                className="mt-5 font-black tracking-tight leading-[1.04]"
                style={{
                  fontSize: "clamp(2.6rem, 5.5vw, 5.6rem)",
                  background: "linear-gradient(175deg, #ffffff 15%, rgba(255,255,255,0.55) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("heroTitle")}
              </h1>

              {/* Subheadline */}
              <p
                className="mt-5 text-base sm:text-[17px] leading-relaxed max-w-lg font-medium"
                style={{color: "var(--text-2)"}}
              >
                {t("heroSubtitle")}
              </p>

              {/* Download CTA */}
              <div className="mt-7">
                <DownloadButtons />
              </div>

              {/* Secondary links */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/fuel"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-colors hover:bg-white/[0.05]"
                  style={{border: "1px solid rgba(255,255,255,0.14)", color: "var(--text-2)"}}
                >
                  ⛽ {t("ctaSecondary")}
                </Link>
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-colors hover:bg-white/[0.05]"
                  style={{border: "1px solid rgba(255,255,255,0.14)", color: "var(--text-2)"}}
                >
                  Калькулятор <ArrowRight size={13}/>
                </Link>
              </div>
            </div>

            {/* Right — quick leasing calculator */}
            <QuickEstimate />
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ PARTNERS ════════════════════════════════════════ */}
      <section className="py-16 sm:py-20" style={{background: "var(--color-bg)"}}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionLabel>Partners</SectionLabel>
          <PartnerGrid section="all" />
        </div>
      </section>

      <Divider />

      {/* ══ WHAT'S INSIDE ═══════════════════════════════════ */}
      <section className="py-16 sm:py-20" style={{background: "var(--color-bg)"}}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <SectionLabel>{t("sectionsTitle")}</SectionLabel>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors mb-10 sm:mb-0"
              style={{
                background: "linear-gradient(135deg, #FE9302, #FF5A2A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Усі послуги <ArrowRight size={14}/>
            </Link>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.n}
                  href={feat.href}
                  className="group rounded-2xl p-6 sm:p-7 flex flex-col gap-4 no-underline transition-all duration-280 hover:-translate-y-[2px]"
                  style={{
                    background: feat.bg,
                    border: `1.5px solid ${feat.border}`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 48px -24px rgba(0,0,0,0.70)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{background: `${feat.accent}22`, border: `1px solid ${feat.accent}33`}}
                    >
                      <Icon size={20} style={{color: feat.accent}} />
                    </div>
                    <span
                      className="text-[10px] font-black tabular-nums tracking-widest"
                      style={{color: "var(--text-3)"}}
                    >
                      {feat.n}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-black text-white leading-tight">
                    {t(feat.tk as never)}
                  </h3>
                  <p
                    className="text-sm leading-relaxed flex-1 font-medium"
                    style={{color: "var(--text-2)"}}
                  >
                    {t(feat.tx as never)}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{color: feat.accent}}
                  >
                    {t("cards.learnMore")} <ArrowRight size={12}/>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <section className="py-16 sm:py-20" style={{background: "var(--color-bg)"}}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionLabel>{t("howTitle")}</SectionLabel>

          <div className="grid gap-8 sm:grid-cols-3">
            {(["step1", "step2", "step3"] as const).map((k, i) => (
              <div key={k} className="flex gap-5">
                <div
                  className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-black"
                  style={{
                    background: "linear-gradient(135deg, #FE9302 0%, #FF5A2A 100%)",
                    boxShadow: "0 4px 20px -6px rgba(255,121,24,0.60)",
                    color: "#fff",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{t(`${k}Title`)}</h3>
                  <p
                    className="mt-1.5 text-sm leading-relaxed font-medium"
                    style={{color: "var(--text-2)"}}
                  >
                    {t(`${k}Text`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ DOWNLOAD CTA ════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-16 sm:py-20"
        style={{background: "linear-gradient(135deg, #FE9302 0%, #FF7918 50%, #FF5A2A 100%)"}}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 justify-between">
            <div>
              <p
                className="font-black text-white leading-tight tracking-tight"
                style={{fontSize: "clamp(1.8rem, 3.5vw, 3rem)"}}
              >
                {t("ctaStripTitle")}
              </p>
              <p className="mt-2 text-base font-semibold" style={{color: "rgba(255,255,255,0.72)"}}>
                {t("ctaStripSub")}
              </p>
            </div>
            <div className="shrink-0">
              <DownloadButtons />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
