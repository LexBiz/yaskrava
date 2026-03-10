"use client";

import {Menu, X} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import Image from "next/image";
import {useEffect, useMemo, useRef, useState} from "react";

import {Link, usePathname} from "@/i18n/navigation";
import {cn} from "@/lib/cn";

const LOCALES = [
  {code: "en", label: "EN"},
  {code: "cs", label: "CS"},
  {code: "uk", label: "UK"},
] as const;

type Props = {
  brandPrimary: string;
  brandSecondary: string;
  accentColor: string;
};

export function SiteHeader({}: Props) {
  const tNav = useTranslations("Nav");
  const tHome = useTranslations("Home");
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const nav = useMemo(() => [
    {href: "/about",    label: tNav("about")},
    {href: "/services", label: tNav("services")},
    {href: "/fleet",    label: tNav("fleet")},
    {href: "/fuel",     label: tNav("fuel")},
    {href: "/career",   label: tNav("career")},
  ], [tNav]);

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-50 h-16 flex items-center"
      style={{
        background: "rgba(44, 44, 46, 0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 flex items-center gap-4">

        {/* Logo — white version (on dark header) */}
        <Link href="/" className="shrink-0 flex items-center no-underline">
          <Image
            src="/logo.svg"
            alt="Yaskrava"
            width={130}
            height={38}
            priority
            style={{height: 26, width: "auto"}}
            className="sm:h-[30px]"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 ml-6">
          {nav.map(item => {
            const active = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "h-8 px-3 flex items-center text-[13px] font-semibold transition-all rounded-full",
                  active
                    ? "text-white bg-[#FF7918]"
                    : "text-white/55 hover:text-white hover:bg-white/[0.07]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-0.5">
            {LOCALES.map(l => (
              <Link
                key={l.code}
                href={path || "/"} locale={l.code}
                className={cn(
                  "h-7 w-8 flex items-center justify-center text-[11px] font-bold rounded-full transition-all",
                  locale === l.code
                    ? "text-white bg-[#FF7918]"
                    : "text-white/40 hover:text-white/70",
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Link
            href="/partner"
            className="hidden lg:flex h-9 items-center px-4 rounded-full text-white/70 text-[12px] font-semibold hover:text-white hover:bg-white/[0.07] transition-all"
          >
            {tHome("ctaPartner")}
          </Link>
          <Link
            href="/calculator"
            className="hidden sm:flex h-9 items-center px-4 rounded-full text-white text-[12px] font-bold hover:brightness-105 transition-all"
            style={{
              background: "linear-gradient(135deg, #FF7918, #FF9902)",
              boxShadow: "0 0 20px -6px rgba(255,121,24,0.65)",
            }}
          >
            {tNav("calculator")}
          </Link>

          <button
            type="button" aria-label="Toggle menu" aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-full text-white/60"
            style={{border: "1px solid rgba(255,255,255,0.14)"}}
          >
            {open ? <X size={15}/> : <Menu size={15}/>}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden absolute top-full left-0 right-0"
          style={{
            background: "#2C2C2E",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="mx-auto max-w-7xl px-5 py-4 space-y-1">
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="flex h-11 items-center px-4 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/[0.07] transition-colors">
                {item.label}
              </Link>
            ))}
            <div className="pt-4 flex items-center gap-2">
              {LOCALES.map(l => (
                <Link key={l.code} href={path || "/"} locale={l.code} onClick={() => setOpen(false)}
                  className={cn(
                    "h-9 w-9 flex items-center justify-center rounded-full text-[11px] font-bold transition-all",
                    locale === l.code
                      ? "text-white bg-[#FF7918]"
                      : "text-white/45 border border-white/12",
                  )}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link href="/calculator" onClick={() => setOpen(false)}
                className="h-11 flex items-center justify-center rounded-xl text-white text-sm font-bold"
                style={{background: "linear-gradient(135deg, #FF7918, #FF9902)", boxShadow: "0 4px 20px -6px rgba(255,121,24,0.60)"}}>
                {tNav("calculator")}
              </Link>
              <Link href="/partner" onClick={() => setOpen(false)}
                className="h-11 flex items-center justify-center rounded-xl text-sm font-semibold text-white/70 border border-white/12 hover:text-white hover:border-white/25 transition-colors">
                {tHome("ctaPartner")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
