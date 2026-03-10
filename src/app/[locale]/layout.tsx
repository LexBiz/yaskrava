import type {Metadata} from "next";
import type {CSSProperties} from "react";
import {notFound} from "next/navigation";
import {Inter} from "next/font/google";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations, setRequestLocale} from "next-intl/server";

import {routing} from "@/i18n/routing";
import {getCurrentDealer} from "@/lib/tenant";

import "../globals.css";

const inter = Inter({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Metadata"});
  const dealer = await getCurrentDealer();
  const name = dealer?.websiteTitle || dealer?.name || "Yaskrava";
  const baseUrl = "https://yaskrava.eu";
  const description = t("description", {name});
  return {
    title: {default: name, template: `%s — ${name}`},
    description,
    metadataBase: new URL(baseUrl),
    applicationName: name,
    icons: {
      icon: [
        {url: "/icon.png?v=3", type: "image/png", sizes: "512x512"},
      ],
      shortcut: ["/icon.png?v=3"],
      apple: ["/apple-icon.png?v=3"],
    },
    openGraph: {
      type: "website",
      url: baseUrl,
      title: name,
      description,
      siteName: name,
      images: [
        {
          url: "/Logo.png",
          width: 512,
          height: 512,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: ["/Logo.png"],
    },
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
    <html lang={locale} className={inter.variable}>
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
