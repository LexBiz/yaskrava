"use client";

import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "cs", label: "CS" },
  { code: "uk", label: "UK" },
] as const;

export function SiteHeader() {
  const t      = useTranslations("Nav");
  const locale = useLocale();
  const path   = usePathname();
  const [open, setOpen] = useState(false);

  const nav = useMemo(() => [
    { href: "/about",    label: t("about")    },
    { href: "/services", label: t("services") },
    { href: "/fleet",    label: t("fleet")    },
    { href: "/fuel",     label: t("fuel")     },
    { href: "/career",   label: t("career")   },
    { href: "/legal",    label: t("legal")    },
  ], [t]);

  return (
    <header
      className="sticky top-0 z-50 h-16 flex items-center"
      style={{
        background: "rgba(0,0,0,0.85)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 flex items-center gap-6">

        {/* Brand — YASK green•RAVA */}
        <Link href="/" className="shrink-0 flex items-center gap-1 no-underline">
          <span
            className="text-xs font-black tracking-[0.18em] uppercase"
            style={{ color: "var(--color-accent)", letterSpacing: "0.18em" }}
          >
            YASK
          </span>
          <span
            className="text-xs font-black tracking-[0.18em] uppercase text-white"
          >
            RAVA
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 ml-4">
          {nav.map(item => {
            const active = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "h-8 px-3 flex items-center text-[13px] transition-colors rounded-full font-medium",
                  active ? "text-white bg-white/[0.06]" : "text-white/40 hover:text-white/80",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">

          {/* Language switcher */}
          <div className="hidden sm:flex items-center gap-0.5">
            {LOCALES.map(l => (
              <Link
                key={l.code}
                href={path || "/"}
                locale={l.code}
                className={cn(
                  "h-7 w-8 flex items-center justify-center text-[11px] font-bold rounded-full transition-all",
                  locale === l.code
                    ? "bg-white text-black"
                    : "text-white/35 hover:text-white/65",
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/calculator"
            className="hidden sm:flex h-8 items-center px-4 rounded-full text-black text-[11px] font-extrabold tracking-wide hover:brightness-95 transition-all"
            style={{
              background: "var(--color-accent)",
              boxShadow: "0 0 20px -6px rgba(6,193,103,0.6)",
            }}
          >
            {t("calculator")}
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style={{ border: "1px solid var(--border-md)", color: "var(--text-2)" }}
          >
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden absolute top-full left-0 right-0"
          style={{
            background: "rgba(0,0,0,0.95)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="mx-auto max-w-7xl px-6 py-6 space-y-1">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex h-11 items-center px-4 rounded-xl text-sm font-semibold transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-4 flex items-center gap-2">
              {LOCALES.map(l => (
                <Link
                  key={l.code}
                  href={path || "/"}
                  locale={l.code}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "h-9 w-9 flex items-center justify-center rounded-full text-[11px] font-bold transition-all",
                    locale === l.code
                      ? "bg-white text-black"
                      : "text-white/40",
                  )}
                  style={locale !== l.code ? { border: "1px solid var(--border-md)" } : undefined}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                href="/calculator"
                onClick={() => setOpen(false)}
                className="h-11 flex items-center justify-center rounded-xl text-black text-sm font-extrabold"
                style={{ background: "var(--color-accent)", boxShadow: "0 0 20px -6px rgba(6,193,103,0.5)" }}
              >
                {t("calculator")}
              </Link>
              <Link
                href="/apply"
                onClick={() => setOpen(false)}
                className="h-11 flex items-center justify-center rounded-xl text-sm font-medium text-white"
                style={{ border: "1px solid var(--border-md)" }}
              >
                {t("apply")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
