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

export function SiteFooter({
  accentColor,
  disclaimer,
  city,
  country,
}: Props) {
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
    <footer
      className="bg-[#0a0907]"
      style={{borderTop: "1px solid rgba(255,255,255,0.07)"}}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.svg"
                alt="Yaskrava"
                width={140}
                height={41}
                style={{height: 32, width: "auto"}}
              />
            </Link>
            <p className="mt-5 text-sm leading-relaxed max-w-xs" style={{color: "var(--text-3)"}}>
              {disclaimer || t("disclaimer")}
            </p>

            <div className="mt-5 flex gap-3">
              <Link
                href="/apply"
                className="inline-flex h-9 items-center px-4 rounded-full text-white text-xs font-bold"
                style={{
                  background: `linear-gradient(135deg, #FE9302 0%, ${accentColor} 50%, #FF5A2A 100%)`,
                }}
              >
                Отримати доступ
              </Link>
              <Link
                href="/calculator"
                className="inline-flex h-9 items-center px-4 rounded-full text-xs font-semibold text-white/65 border border-white/12 hover:border-white/25 transition-colors"
              >
                Калькулятор
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-4" style={{color: "var(--text-3)"}}>
              Company
            </p>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-4" style={{color: "var(--text-3)"}}>
              Legal
            </p>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glow-line my-8" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11px]" style={{color: "var(--text-3)"}}>
            {t("copyright", {year: new Date().getFullYear()})}
          </p>
          <p className="text-[11px]" style={{color: "var(--text-3)"}}>
            GDPR compliant · {city || "Praha"}, {country || "CZ"}
          </p>
        </div>
      </div>
    </footer>
  );
}
