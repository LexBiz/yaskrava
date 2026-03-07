import type {Metadata} from "next";
import type {CSSProperties} from "react";
import {notFound} from "next/navigation";
import {Questrial} from "next/font/google";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";

import {routing} from "@/i18n/routing";
import {getCurrentDealer} from "@/lib/tenant";

import "../globals.css";

const questrial = Questrial({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-questrial",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const dealer = await getCurrentDealer();
  const name = dealer?.websiteTitle || dealer?.name || "Yaskrava";
  return {
    title: {default: name, template: `%s — ${name}`},
    description: `${name} — вигідні рішення для водіїв: паливо, авто-послуги, фінансування та лізинг.`,
    icons: {icon: "/symbol.svg"},
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const dealer = await getCurrentDealer();

  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={questrial.variable}>
      <body
        className="antialiased"
        style={
          dealer
            ? ({["--color-accent" as string]: dealer.accentColor} as CSSProperties)
            : undefined
        }
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
