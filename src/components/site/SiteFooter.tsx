import Image from "next/image";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";

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

  const companyLinks = [
    {href: "/about",    label: nav("about")},
    {href: "/services", label: nav("services")},
    {href: "/career",   label: nav("career")},
    {href: "/fleet",    label: nav("fleet")},
    {href: "/fuel",     label: nav("fuel")},
  ] as const;

  const legalLinks = [
    {href: "/legal/privacy", label: "Privacy (GDPR)"},
    {href: "/legal/terms",   label: "Terms of use"},
    {href: "/legal/cookies", label: "Cookies"},
    {href: "/legal/imprint", label: "Imprint"},
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
              <Link href="/apply"
                className="inline-flex h-10 items-center px-5 rounded-full text-white text-sm font-bold"
                style={{background: "linear-gradient(135deg,#FF7918,#FF9902)", boxShadow: "0 0 18px -4px rgba(255,121,24,0.55)"}}>
                Отримати доступ
              </Link>
              <Link href="/calculator"
                className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold text-white/65 border border-white/14 hover:text-white transition-colors">
                Калькулятор
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4" style={{color: "#FF9902"}}>Company</p>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map(l => (
                <li key={l.href}><Link href={l.href} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4" style={{color: "#FF9902"}}>Legal</p>
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
            GDPR compliant · {city || "Praha"}, {country || "CZ"}
          </p>
        </div>
      </div>
    </footer>
  );
}
