import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t   = useTranslations("Footer");
  const nav = useTranslations("Nav");

  const companyLinks = [
    { href: "/about",    label: nav("about")    },
    { href: "/services", label: nav("services") },
    { href: "/career",   label: nav("career")   },
    { href: "/fleet",    label: nav("fleet")    },
    { href: "/fuel",     label: nav("fuel")     },
  ] as const;

  const legalLinks = [
    { href: "/legal/privacy", label: "Privacy (GDPR)" },
    { href: "/legal/terms",   label: "Terms of use"   },
    { href: "/legal/cookies", label: "Cookies"        },
    { href: "/legal/imprint", label: "Imprint"        },
  ] as const;

  return (
    <footer
      className="bg-black"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1">
              <span
                className="text-xs font-black tracking-[0.18em] uppercase"
                style={{ color: "var(--color-accent)" }}
              >
                YASK
              </span>
              <span className="text-xs font-black tracking-[0.18em] uppercase text-white">
                RAVA
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-3)" }}>
              {t("disclaimer")}
            </p>
          </div>

          {/* Company */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.14em] mb-4"
              style={{ color: "var(--text-3)" }}
            >
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
            <p
              className="text-[10px] font-bold uppercase tracking-[0.14em] mb-4"
              style={{ color: "var(--text-3)" }}
            >
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
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
            GDPR compliant · Praha, CZ
          </p>
        </div>
      </div>
    </footer>
  );
}
