import Image from "next/image";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {APP_STORE_URL, PLAY_STORE_URL} from "@/lib/appLinks";
import {SmartDownloadLink} from "@/components/shared/SmartDownloadLink";

type Props = {
  brandPrimary: string;
  brandSecondary: string;
  accentColor: string;
  disclaimer?: string | null;
  city?: string | null;
  country?: string | null;
};

export function SiteFooter({disclaimer, city, country}: Props) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const home = useTranslations("Home");

  const companyLinks = [
    {href: "/about",    label: nav("about")},
    {href: "/services", label: nav("services")},
    {href: "/career",   label: nav("career")},
    {href: "/fleet",    label: nav("fleet")},
    {href: "/fuel",     label: nav("fuel")},
  ] as const;

  const legalLinks = [
    {href: "/legal/privacy", label: t("legalPrivacy")},
    {href: "/legal/terms",   label: t("legalTerms")},
    {href: "/legal/cookies", label: t("legalCookies")},
    {href: "/legal/imprint", label: t("legalImprint")},
  ] as const;

  return (
    <footer style={{background: "#2C2C2E", borderTop: "2px solid #FF7918"}}>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              {/* Orange logo on dark background */}
              <Image src="/logo.svg" alt="Yaskrava" width={150} height={44}
                style={{height: 34, width: "auto"}} />
            </Link>
            <p className="mt-5 text-sm leading-relaxed max-w-xs" style={{color: "rgba(255,255,255,0.50)"}}>
              {disclaimer || t("disclaimer")}
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <SmartDownloadLink
                appStoreUrl={APP_STORE_URL}
                playStoreUrl={PLAY_STORE_URL}
                className="inline-flex h-10 items-center px-5 rounded-full text-white text-sm font-bold"
                style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 0 18px -4px rgba(255,121,24,0.55)"}}>
                {home("ctaPrimary")}
              </SmartDownloadLink>
              <Link href="/calculator"
                className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold text-white/65 border border-white/14 hover:text-white transition-colors">
                {nav("calculator")}
              </Link>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 inline-flex items-center gap-3">
              <span className="text-xs text-white/50">{t("officialHeading")}</span>
              <Link href="/legal/privacy" className="text-xs font-semibold text-[#FF9902] hover:underline transition-colors">
                {t("legalPrivacy")}
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4" style={{color: "#FF9902"}}>{t("companyHeading")}</p>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map(l => (
                <li key={l.href}><Link href={l.href} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4" style={{color: "#FF9902"}}>{t("legalHeading")}</p>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map(l => (
                <li key={l.href}><Link href={l.href} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Orange divider */}
        <div className="glow-line my-8" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11px]" style={{color: "rgba(255,255,255,0.40)"}}>
            {t("copyright", {year: new Date().getFullYear()})}
          </p>
          <p className="text-[11px]" style={{color: "rgba(255,255,255,0.40)"}}>
            {t("gdprLocation", {city: city || "Praha", country: country || "CZ"})}
          </p>
        </div>
      </div>
    </footer>
  );
}

