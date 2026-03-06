import "server-only";

import {cache} from "react";

import {headers} from "next/headers";
import {notFound} from "next/navigation";

import {prisma} from "@/lib/prisma";

function normalizeHostname(input: string | null | undefined) {
  if (!input) return "";
  return input.replace(/:\d+$/, "").trim().toLowerCase();
}

function getFallbackDealerSlug() {
  return process.env.DEFAULT_DEALER_SLUG || "yaskrava";
}

function getPlatformRootDomain() {
  return (process.env.PLATFORM_ROOT_DOMAIN || "yaskrava.temoweb.eu").toLowerCase();
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function getSlugFromPlatformHost(hostname: string) {
  const rootDomain = getPlatformRootDomain();

  if (!hostname || isLocalHostname(hostname)) {
    return getFallbackDealerSlug();
  }

  if (hostname === rootDomain) {
    return getFallbackDealerSlug();
  }

  if (hostname.endsWith(`.${rootDomain}`)) {
    return hostname.slice(0, -(rootDomain.length + 1));
  }

  return null;
}

function getFallbackDealer() {
  return {
    id: "fallback-dealer",
    slug: getFallbackDealerSlug(),
    name: "Yaskrava",
    legalName: "Yaskrava s.r.o.",
    status: "ACTIVE" as const,
    defaultLocale: "en",
    accentColor: "#08D96E",
    brandPrimary: "YASK",
    brandSecondary: "RAVA",
    supportEmail: "info@yaskrava.cz",
    supportPhone: "+420 000 000 000",
    city: "Prague",
    country: "CZ",
    websiteTitle: "Yaskrava",
    footerDisclaimer:
      "Leasing and financing offers are subject to partner approval and legal review.",
    appStoreUrl: process.env.NEXT_PUBLIC_APP_STORE_URL || "/apply",
    playStoreUrl: process.env.NEXT_PUBLIC_PLAY_STORE_URL || "/apply",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    domains: [
      {
        id: "fallback-domain",
        createdAt: new Date(0),
        updatedAt: new Date(0),
        hostname: "localhost",
        isPrimary: true,
        status: "ACTIVE" as const,
        dealerId: "fallback-dealer",
      },
    ],
  };
}

export async function getRequestHostname() {
  const headerStore = await headers();
  return normalizeHostname(
    headerStore.get("x-yaskrava-host") ??
      headerStore.get("x-forwarded-host") ??
      headerStore.get("host")
  );
}

export const resolveDealerByHostname = cache(async (hostname: string) => {
  const normalized = normalizeHostname(hostname);

  try {
    const slugFromSubdomain = getSlugFromPlatformHost(normalized);

    if (!normalized || isLocalHostname(normalized)) {
      return (
        (await prisma.dealer.findUnique({
          where: {slug: getFallbackDealerSlug()},
          include: {
            domains: {
              where: {status: "ACTIVE"},
              orderBy: [{isPrimary: "desc"}, {hostname: "asc"}],
            },
          },
        })) || getFallbackDealer()
      );
    }

    if (slugFromSubdomain) {
      const subdomainDealer = await prisma.dealer.findFirst({
        where: {
          slug: slugFromSubdomain,
          status: "ACTIVE",
        },
        include: {
          domains: {
            where: {status: "ACTIVE"},
            orderBy: [{isPrimary: "desc"}, {hostname: "asc"}],
          },
        },
      });

      if (subdomainDealer) {
        return subdomainDealer;
      }
    }

    const domain = await prisma.dealerDomain.findFirst({
      where: {
        hostname: normalized,
        status: "ACTIVE",
        dealer: {
          status: "ACTIVE",
        },
      },
      include: {
        dealer: {
          include: {
            domains: {
              where: {status: "ACTIVE"},
              orderBy: [{isPrimary: "desc"}, {hostname: "asc"}],
            },
          },
        },
      },
    });

    return domain?.dealer ?? null;
  } catch {
    return getFallbackDealer();
  }
});

export const getCurrentDealer = cache(async () => {
  const hostname = await getRequestHostname();
  return resolveDealerByHostname(hostname);
});

export async function getCurrentDealerOrThrow() {
  const dealer = await getCurrentDealer();
  if (!dealer) {
    notFound();
  }

  return dealer;
}

export function getDealerBrandName(dealer: {
  brandPrimary: string;
  brandSecondary: string;
  name: string;
}) {
  return `${dealer.brandPrimary}${dealer.brandSecondary}` || dealer.name;
}

export function buildDealerHostname(slug: string) {
  const rootDomain = getPlatformRootDomain();
  return slug === getFallbackDealerSlug() ? rootDomain : `${slug}.${rootDomain}`;
}

export function getDealerPublicUrl(slug: string) {
  const hostname = buildDealerHostname(slug);
  if (hostname === "localhost") {
    return "http://localhost:3000";
  }

  return `https://${hostname}`;
}

export function getDealerCrmUrl(slug: string) {
  return `${getDealerPublicUrl(slug)}/dealer/login`;
}
