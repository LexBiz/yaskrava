import {ArrowRight, Flame, Car, CreditCard, Shield, Wrench, Wallet} from "lucide-react";
import {useTranslations} from "next-intl";

import {QuickEstimate} from "@/components/home/QuickEstimate";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PartnerGrid} from "@/components/shared/PartnerGrid";
import {Link} from "@/i18n/navigation";

const FEATURES = [
  {n: "01", icon: Flame,      tk: "cards.fuelTitle",      tx: "cards.fuelText",      href: "/fuel",       accent: "#FF7918"},
  {n: "02", icon: Wrench,     tk: "cards.autoTitle",      tx: "cards.autoText",      href: "/services",   accent: "#FF9902"},
  {n: "03", icon: CreditCard, tk: "cards.financeTitle",   tx: "cards.financeText",   href: "/calculator", accent: "#FF7918"},
  {n: "04", icon: Shield,     tk: "cards.insuranceTitle", tx: "cards.insuranceText", href: "/services",   accent: "#FF9902"},
  {n: "05", icon: Car,        tk: "cards.otherTitle",     tx: "cards.otherText",     href: "/services",   accent: "#FF7918"},
  {n: "06", icon: Wallet,     tk: "cards.walletTitle",    tx: "cards.walletText",    href: "/apply",      accent: "#FF9902"},
] as const;

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <>
      {/* ══ HERO — Charcoal brand dark ══════════════════════ */}
      <section className="relative overflow-hidden" style={{background: "#3B3B3D"}}>
        {/* Subtle diagonal overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at -5% -10%, rgba(255,121,24,0.16) 0%, transparent 55%)," +
              "radial-gradient(ellipse 40% 50% at 105% 100%, rgba(255,153,2,0.10) 0%, transparent 50%)",
          }}
        />
        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            opacity: 0.030,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_460px] lg:py-24 xl:py-28">

            <div className="max-w-[560px]">
              {/* Badge */}
              <div className="yask-badge">Praha · Czech Republic</div>

              {/* Headline */}
              <h1
                className="mt-5 font-black tracking-[-0.025em] leading-[1.03] text-white"
                style={{fontSize: "clamp(2.6rem, 5.2vw, 5.4rem)"}}
              >
                {t("heroTitle")}
              </h1>

              {/* Orange underline */}
              <div className="mt-4 h-1 w-20 rounded-full"
                style={{background: "linear-gradient(90deg, #FF7918, #FF9902)", boxShadow: "0 0 20px rgba(255,121,24,0.65)"}}
              />

              <p className="mt-5 text-base sm:text-[17px] leading-relaxed max-w-lg font-medium"
                style={{color: "rgba(255,255,255,0.65)"}}>
                {t("heroSubtitle")}
              </p>

              <div className="mt-8"><DownloadButtons /></div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/fuel"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-all hover:bg-white/[0.07]"
                  style={{border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.70)"}}>
                  ⛽ {t("ctaSecondary")}
                </Link>
                <Link href="/calculator"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-all hover:bg-white/[0.07]"
                  style={{border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.70)"}}>
                  Калькулятор <ArrowRight size={13}/>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 flex gap-8 flex-wrap"
                style={{borderTop: "1px solid rgba(255,255,255,0.10)"}}>
                {[
                  {num: "⛽", sub: "Shell, ORLEN, OMV"},
                  {num: "−60%", sub: "Знижка на запчастини"},
                  {num: "CZK", sub: "Баланс у застосунку"},
                ].map(s => (
                  <div key={s.sub}>
                    <div className="text-base font-black" style={{color: "#FF9902"}}>{s.num}</div>
                    <div className="text-[11px] font-medium mt-0.5" style={{color: "rgba(255,255,255,0.42)"}}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <QuickEstimate />
          </div>
        </div>
      </section>

      {/* ══ DIVIDER ══════════════════════════════════════════ */}
      <div className="glow-line" />

      {/* ══ PARTNERS — White section ═════════════════════════ */}
      <section className="section-white py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="section-accent-line-orange" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{color: "rgba(59,59,61,0.50)"}}>
              Partners
            </p>
          </div>
          <PartnerGrid section="all" />
        </div>
      </section>

      {/* ══ DIVIDER ══════════════════════════════════════════ */}
      <div className="glow-line" />

      {/* ══ FEATURES — Charcoal ════════════════════════════ */}
      <section className="section-charcoal py-16 sm:py-22">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="section-accent-line" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{color: "rgba(255,255,255,0.40)"}}>
                {t("sectionsTitle")}
              </p>
            </div>
            <Link href="/services"
              className="inline-flex items-center gap-2 text-sm font-bold transition-all"
              style={{color: "#FF9902"}}>
              Усі послуги <ArrowRight size={14}/>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link key={feat.n} href={feat.href}
                  className="group yask-card rounded-2xl p-6 sm:p-7 flex flex-col gap-4 no-underline overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{background: `${feat.accent}22`, border: `1px solid ${feat.accent}35`}}>
                      <Icon size={20} style={{color: feat.accent}}/>
                    </div>
                    <span className="text-[10px] font-black tabular-nums tracking-widest"
                      style={{color: "rgba(255,255,255,0.28)"}}>
                      {feat.n}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-black text-white leading-tight">{t(feat.tk as never)}</h3>
                  <p className="text-sm leading-relaxed flex-1 font-medium"
                    style={{color: "rgba(255,255,255,0.60)"}}>{t(feat.tx as never)}</p>
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

      {/* ══ DIVIDER ══════════════════════════════════════════ */}
      <div className="glow-line" />

      {/* ══ HOW IT WORKS — Orange gradient ═════════════════ */}
      <section className="section-gradient py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="section-accent-line-white" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{color: "rgba(255,255,255,0.65)"}}>
              {t("howTitle")}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {(["step1", "step2", "step3"] as const).map((k, i) => (
              <div key={k} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-[13px] font-black text-white transition-transform hover:scale-105"
                  style={{background: "rgba(0,0,0,0.22)", border: "1.5px solid rgba(255,255,255,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)"}}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{t(`${k}Title`)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed font-medium"
                    style={{color: "rgba(255,255,255,0.78)"}}>
                    {t(`${k}Text`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DIVIDER ══════════════════════════════════════════ */}
      <div className="glow-line" />

      {/* ══ CTA — Charcoal ══════════════════════════════════ */}
      <section className="section-charcoal-deep relative overflow-hidden py-16 sm:py-20"
        style={{background: "#2C2C2E"}}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(255,121,24,0.12) 0%, transparent 60%)," +
              "radial-gradient(ellipse 40% 60% at 100% 50%, rgba(255,153,2,0.08) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 justify-between">
            <div>
              <p className="font-black leading-tight tracking-[-0.02em] text-white"
                style={{fontSize: "clamp(2rem, 4vw, 3.4rem)"}}>
                {t("ctaStripTitle")}
              </p>
              <p className="mt-2 text-base font-medium" style={{color: "rgba(255,255,255,0.60)"}}>
                {t("ctaStripSub")}
              </p>
              <div className="mt-6 flex gap-3 flex-wrap">
                <Link href="/apply" className="btn-primary h-12 px-8"
                  style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 4px 28px -6px rgba(255,121,24,0.65)"}}>
                  Отримати доступ
                </Link>
                <Link href="/calculator"
                  className="btn-outline-white h-12 px-8"
                  style={{border: "1.5px solid rgba(255,255,255,0.25)", color: "#FFFFFF"}}>
                  Калькулятор
                </Link>
              </div>
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
