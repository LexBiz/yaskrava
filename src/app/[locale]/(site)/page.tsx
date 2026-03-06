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
      <p className="text-[11px] font-bold uppercase tracking-[0.17em]" style={{color: "var(--text-3)"}}>
        {children}
      </p>
    </div>
  );
}

function Divider() { return <div className="glow-line" />; }

const FEATURES = [
  {n: "01", icon: Flame,      tk: "cards.fuelTitle",      tx: "cards.fuelText",      href: "/fuel",       accent: "#FE9302", border: "rgba(254,147,2,0.24)",  bg: "rgba(254,147,2,0.10)"},
  {n: "02", icon: Wrench,     tk: "cards.autoTitle",      tx: "cards.autoText",      href: "/services",   accent: "#FF7918", border: "rgba(255,121,24,0.22)", bg: "rgba(255,121,24,0.09)"},
  {n: "03", icon: CreditCard, tk: "cards.financeTitle",   tx: "cards.financeText",   href: "/calculator", accent: "#FF5A2A", border: "rgba(255,90,42,0.22)",  bg: "rgba(255,90,42,0.09)"},
  {n: "04", icon: Shield,     tk: "cards.insuranceTitle", tx: "cards.insuranceText", href: "/services",   accent: "#FFB040", border: "rgba(255,176,64,0.20)", bg: "rgba(255,176,64,0.08)"},
  {n: "05", icon: Car,        tk: "cards.otherTitle",     tx: "cards.otherText",     href: "/services",   accent: "#FF7918", border: "rgba(255,121,24,0.20)", bg: "rgba(255,121,24,0.08)"},
  {n: "06", icon: Wallet,     tk: "cards.walletTitle",    tx: "cards.walletText",    href: "/apply",      accent: "#FE9302", border: "rgba(254,147,2,0.20)",  bg: "rgba(254,147,2,0.08)"},
] as const;

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <>
      {/* ══ HERO ════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #3D2A12 0%, #2F1F0C 35%, #251809 70%, #1C1208 100%)",
          backgroundImage:
            "linear-gradient(160deg, #3D2A12 0%, #2F1F0C 35%, #251809 70%, #1C1208 100%)," +
            "radial-gradient(ellipse 65% 65% at -5% -10%, rgba(254,147,2,0.18) 0%, transparent 55%)," +
            "radial-gradient(ellipse 45% 50% at 100% 100%, rgba(255,90,42,0.10) 0%, transparent 50%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,200,100,1) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,200,100,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            opacity: 0.018,
            maskImage: "radial-gradient(ellipse 75% 80% at 30% 30%, black 10%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_460px] lg:py-24 xl:py-28">

            <div className="max-w-[560px]">
              <div className="yask-badge">Praha · Czech Republic</div>

              <h1
                className="mt-5 font-black tracking-[-0.02em] leading-[1.04]"
                style={{
                  fontSize: "clamp(2.4rem, 5.2vw, 5.2rem)",
                  background: "linear-gradient(175deg, #FFFFFF 0%, rgba(255,235,190,0.58) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("heroTitle")}
              </h1>

              <div className="mt-4 h-[3px] w-16 rounded-full"
                style={{background: "linear-gradient(90deg, #FE9302, #FF5A2A)", boxShadow: "0 0 18px rgba(255,121,24,0.65)"}}
              />

              <p className="mt-5 text-base sm:text-[17px] leading-relaxed max-w-lg font-medium" style={{color: "var(--text-2)"}}>
                {t("heroSubtitle")}
              </p>

              <div className="mt-7"><DownloadButtons /></div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/fuel"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-all hover:bg-white/[0.06]"
                  style={{border: "1px solid rgba(255,180,80,0.18)", color: "var(--text-2)"}}>
                  ⛽ {t("ctaSecondary")}
                </Link>
                <Link href="/calculator"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-all hover:bg-white/[0.06]"
                  style={{border: "1px solid rgba(255,180,80,0.18)", color: "var(--text-2)"}}>
                  Калькулятор <ArrowRight size={13}/>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t flex gap-8 flex-wrap"
                style={{borderColor: "rgba(255,180,80,0.14)"}}>
                {[
                  {num: "⛽", label: "Shell, ORLEN, OMV"},
                  {num: "−60%", label: "Знижка на запчастини"},
                  {num: "CZK", label: "Баланс у застосунку"},
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-base font-black" style={{
                      background: "linear-gradient(135deg, #FE9302, #FF5A2A)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {s.num}
                    </div>
                    <div className="text-[11px] font-medium mt-0.5" style={{color: "var(--text-3)"}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <QuickEstimate />
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ PARTNERS ════════════════════════════════ */}
      <section className="py-14 sm:py-18"
        style={{background: "linear-gradient(160deg, #2F1F0C 0%, #251809 100%)"}}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionLabel>Partners</SectionLabel>
          <PartnerGrid section="all" />
        </div>
      </section>

      <Divider />

      {/* ══ FEATURES ════════════════════════════════ */}
      <section className="py-16 sm:py-22"
        style={{background: "linear-gradient(180deg, #251809 0%, #1C1208 100%)"}}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <SectionLabel>{t("sectionsTitle")}</SectionLabel>
            <Link href="/services"
              className="inline-flex items-center gap-2 text-sm font-bold transition-all mb-10 sm:mb-0 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #FE9302, #FF5A2A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              Усі послуги <ArrowRight size={14}/>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.n}
                  href={feat.href}
                  className="group relative rounded-2xl p-6 sm:p-7 flex flex-col gap-4 no-underline overflow-hidden hover-glow"
                  style={{
                    background: `linear-gradient(150deg, ${feat.bg} 0%, rgba(255,255,255,0.02) 100%)`,
                    border: `1px solid ${feat.border}`,
                    boxShadow: "inset 0 1px 0 rgba(255,220,140,0.07), 0 24px 48px -24px rgba(0,0,0,0.50)",
                  }}
                >
                  <div
                    className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{background: `radial-gradient(circle, ${feat.accent}28 0%, transparent 70%)`}}
                  />
                  <div className="flex items-center justify-between relative">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${feat.accent}20`,
                        border: `1px solid ${feat.accent}2E`,
                        boxShadow: `0 0 20px -8px ${feat.accent}55`,
                      }}>
                      <Icon size={20} style={{color: feat.accent}}/>
                    </div>
                    <span className="text-[10px] font-black tabular-nums tracking-widest" style={{color: "var(--text-3)"}}>
                      {feat.n}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-black leading-tight text-white">{t(feat.tk as never)}</h3>
                  <p className="text-sm leading-relaxed flex-1 font-medium" style={{color: "var(--text-2)"}}>{t(feat.tx as never)}</p>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{color: feat.accent}}>
                    {t("cards.learnMore")} <ArrowRight size={12}/>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ HOW IT WORKS ════════════════════════════ */}
      <section className="py-16 sm:py-20"
        style={{background: "linear-gradient(160deg, #3D2A12 0%, #2F1F0C 50%, #251809 100%)"}}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionLabel>{t("howTitle")}</SectionLabel>
          <div className="grid gap-8 sm:grid-cols-3">
            {(["step1", "step2", "step3"] as const).map((k, i) => {
              const accents = ["#FE9302", "#FF7918", "#FF5A2A"] as const;
              return (
                <div key={k} className="flex gap-5 group">
                  <div
                    className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-[13px] font-black transition-all group-hover:scale-105 group-hover:shadow-[0_8px_24px_-8px_rgba(255,121,24,0.55)]"
                    style={{
                      background: `linear-gradient(135deg, ${accents[i]}30, ${accents[i]}18)`,
                      border: `1.5px solid ${accents[i]}38`,
                      color: accents[i],
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{t(`${k}Title`)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed font-medium" style={{color: "var(--text-2)"}}>{t(`${k}Text`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ CTA ═════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-16 sm:py-20 shine-once"
        style={{background: "linear-gradient(140deg, #FE9302 0%, #FF7918 45%, #FF5A2A 100%)"}}
      >
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.06]"
          style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.14) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(0,0,0,0.14) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 justify-between">
            <div>
              <p
                className="font-black leading-tight tracking-[-0.02em]"
                style={{fontSize: "clamp(1.9rem, 3.8vw, 3.2rem)", color: "#fff", textShadow: "0 2px 12px rgba(150,40,0,0.40)"}}
              >
                {t("ctaStripTitle")}
              </p>
              <p className="mt-2 text-base font-semibold" style={{color: "rgba(255,255,255,0.72)"}}>
                {t("ctaStripSub")}
              </p>
            </div>
            <div className="shrink-0"><DownloadButtons /></div>
          </div>
        </div>
      </section>
    </>
  );
}
