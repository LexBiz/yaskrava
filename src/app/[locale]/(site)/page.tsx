import {ArrowRight, Flame, Car, CreditCard, Shield, Wrench, Wallet} from "lucide-react";
import {useTranslations} from "next-intl";

import {AppIcon3D} from "@/components/home/AppIcon3D";
import {CinematicPhoto} from "@/components/home/CinematicPhoto";
import {QuickEstimate} from "@/components/home/QuickEstimate";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {PartnerGrid} from "@/components/shared/PartnerGrid";
import {Link} from "@/i18n/navigation";

const FEATURES: Array<{
  n: string;
  icon: typeof Flame;
  tk: string;
  tx: string;
  href: string;
  accent: string;
  external?: boolean;
}> = [
  {n: "01", icon: Flame,      tk: "cards.fuelTitle",      tx: "cards.fuelText",      href: "/fuel",       accent: "#FF7918"},
  {n: "02", icon: Wrench,     tk: "cards.autoTitle",      tx: "cards.autoText",      href: "/services",   accent: "#FF9902"},
  {n: "03", icon: CreditCard, tk: "cards.financeTitle",   tx: "cards.financeText",   href: "/calculator", accent: "#FF7918"},
  {n: "04", icon: Shield,     tk: "cards.insuranceTitle", tx: "cards.insuranceText", href: "/services",   accent: "#FF9902"},
  {n: "05", icon: Car,        tk: "cards.otherTitle",     tx: "cards.otherText",     href: "/services",   accent: "#FF7918"},
  {n: "06", icon: Wallet,     tk: "cards.walletTitle",    tx: "cards.walletText",    href: "/download", accent: "#FF9902"},
];

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <>
      {/* ══ HERO — Charcoal brand dark ══════════════════════ */}
      <section className="relative overflow-hidden" style={{background: "#3B3B3D"}}>
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
          <div className="grid items-center gap-6 py-10 sm:gap-10 sm:py-20 lg:grid-cols-[1fr_460px] lg:py-24 xl:py-28">

            <div className="order-2 max-w-[560px] lg:order-1 lg:row-span-2">
              <h1
                className="font-black tracking-[-0.025em] leading-[1.03] text-white"
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
                  {t("calculatorCta")} <ArrowRight size={13}/>
                </Link>
                <Link href="/partner"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-bold transition-all"
                  style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", color: "#fff", boxShadow: "0 4px 16px -6px rgba(255,121,24,0.55)"}}>
                  {t("ctaPartner")} <ArrowRight size={13}/>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 flex gap-8 flex-wrap"
                style={{borderTop: "1px solid rgba(255,255,255,0.10)"}}>
                {[
                  {num: "⛽", sub: t("statsFuel")},
                  {num: "−60%", sub: t("statsParts")},
                  {num: "CZK", sub: t("statsBalance")},
                ].map(s => (
                  <div key={s.sub}>
                    <div className="text-base font-black" style={{color: "#FF9902"}}>{s.num}</div>
                    <div className="text-[11px] font-medium mt-0.5" style={{color: "rgba(255,255,255,0.42)"}}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <AppIcon3D />
            </div>

            <div className="order-3 flex justify-center lg:justify-end">
              <QuickEstimate />
            </div>
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
              {t("partnersEyebrow")}
            </p>
          </div>
          <div className="mb-6 max-w-2xl text-sm leading-7" style={{color: "rgba(59,59,61,0.68)"}}>
            {t("partnersIntro")}
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
              {t("servicesCta")} <ArrowRight size={14}/>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              const content = (
                <div className="group yask-card rounded-2xl p-6 sm:p-7 flex flex-col gap-4 no-underline overflow-hidden">
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
                </div>
              );
              return feat.external ? (
                <a key={feat.n} href={feat.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                <Link key={feat.n} href={feat.href}>
                  {content}
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

      {/* ══ AUTO FINANCING BLOCK ═══════════════════════════ */}
      <section className="section-charcoal-deep py-14 sm:py-20" style={{background: "#2C2C2E"}}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <div className="section-accent-line mb-5" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{color: "rgba(255,153,2,0.80)"}}>
                {t("cards.financeTitle")}
              </p>
              <h2 className="mt-3 font-black leading-tight text-white"
                style={{fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)"}}>
                Авто фінансування
              </h2>
              <p className="mt-4 text-base leading-relaxed"
                style={{color: "rgba(255,255,255,0.60)"}}>
                {t("cards.financeText")}
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                <Link href="/calculator"
                  className="btn-primary h-12 px-8"
                  style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 4px 28px -6px rgba(255,121,24,0.65)"}}>
                  {t("calculatorCta")}
                </Link>
                <Link href="/fleet"
                  className="btn-outline-white h-12 px-8"
                  style={{border: "1.5px solid rgba(255,255,255,0.22)", color: "#FFFFFF"}}>
                  {t("fleetVisualPrimary")}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {icon: "🚗", title: "Нові автомобілі", text: "Фінансування нових авто від офіційних дилерів"},
                {icon: "🔍", title: "Вживані авто", text: "Перевірка та фінансування вживаних автомобілів"},
                {icon: "📋", title: "Лізинг", text: "Гнучкі умови лізингу з мінімальним першим внеском"},
                {icon: "🛡️", title: "Страхування", text: "Комплексне страхування в пакеті з фінансуванням"},
              ].map(item => (
                <div key={item.icon} className="rounded-2xl p-5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}>
                  <span className="text-2xl">{item.icon}</span>
                  <p className="mt-3 text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{color: "rgba(255,255,255,0.55)"}}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FIND DEALERS BY REGION ══════════════════════════ */}
      <section className="py-14 sm:py-20" style={{background: "#2C2C2E"}}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <div className="section-accent-line mb-5" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{color: "rgba(255,153,2,0.80)"}}>
                Дилери по всій Чехії
              </p>
              <h2 className="mt-3 font-black leading-tight text-white" style={{fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)"}}>
                Знайдіть дилера у вашому регіоні
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{color: "rgba(255,255,255,0.60)"}}>
                Оберіть зручний регіон і перегляньте дилерів, які там працюють. Деякі пропонують доставку авто прямо до вашого будинку.
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                <Link href="/dealers"
                  className="btn-primary h-12 px-8 inline-flex items-center gap-2"
                  style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 4px 28px -6px rgba(255,121,24,0.65)"}}>
                  🗺 Знайти дилера
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {icon: "📍", title: "14 регіонів Чехії", text: "Дилери присутні в основних регіонах країни"},
                {icon: "🏠", title: "Доставка додому", text: "Деякі дилери привозять авто прямо до вас"},
                {icon: "🚗", title: "Великий вибір авто", text: "В'їзд і наявні авто — зручно для фінансування"},
                {icon: "📋", title: "Заявка онлайн", text: "Подайте заявку на фінансування без відвідування"},
              ].map(item => (
                <div key={item.icon} className="rounded-2xl p-5"
                  style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)"}}>
                  <span className="text-2xl">{item.icon}</span>
                  <p className="mt-3 text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{color: "rgba(255,255,255,0.55)"}}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ VEHICLES FOR SALE BLOCK ═════════════════════════ */}
      <section className="section-charcoal py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="section-accent-line mb-5" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{color: "rgba(255,255,255,0.40)"}}>
                {t("vehiclesSaleTitle")}
              </p>
              <h2 className="mt-3 font-black leading-tight text-white" style={{fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)"}}>
                {t("vehiclesSaleTitle")}
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{color: "rgba(255,255,255,0.62)"}}>
                {t("vehiclesSaleText")}
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                <Link href="/fleet"
                  className="btn-primary h-12 px-8"
                  style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 4px 28px -6px rgba(255,121,24,0.65)"}}>
                  {t("fleetVisualPrimary")}
                </Link>
                <Link href="/calculator"
                  className="btn-outline-white h-12 px-8"
                  style={{border: "1.5px solid rgba(255,255,255,0.22)", color: "#FFFFFF"}}>
                  {t("fleetVisualSecondary")}
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  t("vehiclesSaleBullet0"),
                  t("vehiclesSaleBullet1"),
                  t("vehiclesSaleBullet2"),
                  t("vehiclesSaleBullet3"),
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold text-white/82">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ DIVIDER ══════════════════════════════════════════ */}
      <div className="glow-line" />

      {/* ══ CINEMATIC FLEET PHOTO ═══════════════════════════ */}
      <CinematicPhoto />

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
                <Link href="/partner" className="btn-primary h-12 px-8"
                  style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 4px 28px -6px rgba(255,121,24,0.65)"}}>
                  {t("ctaPartner")}
                </Link>
                <Link href="/calculator"
                  className="btn-outline-white h-12 px-8"
                  style={{border: "1.5px solid rgba(255,255,255,0.25)", color: "#FFFFFF"}}>
                  {t("calculatorCta")}
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
