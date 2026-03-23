import {Calendar, Fuel, Gauge, Settings2} from "lucide-react";
import {getLocale, getTranslations} from "next-intl/server";

import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";
import {Link} from "@/i18n/navigation";
import {prisma} from "@/lib/prisma";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

export const dynamic = "force-dynamic";

type VehicleCardData = {
  id: string;
  slug?: string;
  title: string;
  year?: number | null;
  mileageKm?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  priceCzk?: number | null;
  imageUrl?: string | null;
  description?: string | null;
  featured?: boolean;
  images?: Array<{url: string}>;
  videoGallery?: unknown;
};

function formatCzk(value: number | null | undefined, locale: string) {
  if (!value) return null;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

function mapFuel(value: string | null | undefined, t: Awaited<ReturnType<typeof getTranslations>>) {
  if (!value) return "—";
  if (value === "Diesel") return t("demoFuelDiesel");
  if (value === "Petrol") return t("demoFuelPetrol");
  if (value === "Hybrid") return t("demoFuelHybrid");
  if (value === "Electric") return t("demoFuelElectric");
  if (value === "LPG") return t("demoFuelLpg");
  return value;
}

function mapTransmission(value: string | null | undefined, t: Awaited<ReturnType<typeof getTranslations>>) {
  if (!value) return "—";
  if (value === "Automatic") return t("demoTransmissionAutomatic");
  if (value === "Manual") return t("demoTransmissionManual");
  return value;
}

function mapVehicleCopy(vehicle: VehicleCardData, t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    ...vehicle,
    fuel: mapFuel(vehicle.fuel, t),
    transmission: mapTransmission(vehicle.transmission, t),
  };
}

function isValidMediaUrl(url: string | null | undefined): url is string {
  if (!url || url.trim().length === 0) return false;
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/uploads/") ||
    url.startsWith("/")
  );
}

function VehicleCard({
  v,
  status,
  statusClass,
  openLabel,
  locale,
  labels,
  onRequestLabel,
  noImageLabel,
  featuredLabel,
  photoWord,
  videoWord,
}: {
  v: VehicleCardData;
  status: string;
  statusClass: string;
  openLabel: string;
  locale: string;
  labels: {
    year: string;
    mileage: string;
    fuel: string;
    gearbox: string;
    priceFrom: string;
  };
  onRequestLabel: string;
  noImageLabel: string;
  featuredLabel: string;
  photoWord: string;
  videoWord: string;
}) {
  const galleryImage = v.images?.find((i) => isValidMediaUrl(i.url))?.url;
  const rawHeroImage = v.imageUrl || galleryImage;
  const heroImage = isValidMediaUrl(rawHeroImage) ? rawHeroImage : undefined;
  const videoCount = Array.isArray(v.videoGallery) ? v.videoGallery.length : 0;
  const photoCount = v.images?.length || (heroImage ? 1 : 0);

  const price = formatCzk(v.priceCzk, locale);

  return (
    <Link href={v.slug ? `/fleet/${v.slug}` : "/fleet"} className="block no-underline">
      <article
        className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(255,121,24,0.25)]"
        style={{background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)"}}
      >
        {/* ── Photo block ── */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0d0d0f]">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={v.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              style={{objectPosition: "center center"}}
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white/25 text-sm">
              {noImageLabel}
            </div>
          )}

          {/* Status badge — top left */}
          <div className="absolute left-3 top-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11px] font-bold"
              style={
                statusClass.includes("emerald")
                  ? {background: "rgba(16,185,129,0.85)", color: "#fff"}
                  : {background: "rgba(251,191,36,0.85)", color: "#1a0d00"}
              }
            >
              {status}
            </span>
          </div>

          {/* Featured + photo count — top right */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {v.featured && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-[5px] text-[11px] font-bold"
                style={{background: "rgba(255,121,24,0.90)", color: "#fff"}}
              >
                ★ {featuredLabel}
              </span>
            )}
            {(photoCount > 1 || videoCount > 0) && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-[5px] text-[11px] font-semibold"
                style={{background: "rgba(0,0,0,0.72)", color: "#fff"}}
              >
                📷 {photoCount}{videoCount > 0 ? ` · 🎥 ${videoCount}` : ""}
              </span>
            )}
          </div>

          {/* Bottom gradient overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* ── Info block ── */}
        <div className="flex flex-1 flex-col p-4">

          {/* Title */}
          <h3 className="line-clamp-2 text-[15px] font-black leading-snug text-white">
            {v.title}
          </h3>

          {/* 4 specs in a 2×2 grid */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5" style={{color: "rgba(255,255,255,0.55)"}}>
              <Calendar size={11} className="shrink-0" />
              <span>{v.year ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{color: "rgba(255,255,255,0.55)"}}>
              <Gauge size={11} className="shrink-0" />
              <span>{v.mileageKm ? `${v.mileageKm.toLocaleString()} km` : "—"}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{color: "rgba(255,255,255,0.55)"}}>
              <Fuel size={11} className="shrink-0" />
              <span>{v.fuel || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{color: "rgba(255,255,255,0.55)"}}>
              <Settings2 size={11} className="shrink-0" />
              <span>{v.transmission || "—"}</span>
            </div>
          </div>

          {/* Description */}
          {v.description && (
            <p className="mt-3 line-clamp-2 text-[12px] leading-5" style={{color: "rgba(255,255,255,0.45)"}}>
              {v.description}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price + CTA */}
          <div
            className="mt-4 flex items-center justify-between border-t pt-4"
            style={{borderColor: "rgba(255,255,255,0.07)"}}
          >
            <div>
              {price ? (
                <div className="text-lg font-black leading-none" style={{color: "#FF7918"}}>
                  {price}
                </div>
              ) : (
                <div className="text-sm font-semibold" style={{color: "rgba(255,255,255,0.45)"}}>
                  {onRequestLabel}
                </div>
              )}
            </div>
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-200 group-hover:gap-2"
              style={{background: "rgba(255,121,24,0.15)", border: "1px solid rgba(255,121,24,0.3)", color: "#FF7918"}}
            >
              {openLabel} →
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function FleetPage() {
  const locale = await getLocale();
  const t = await getTranslations("Fleet");
  const dealer = await getCurrentDealerOrThrow();

  let dbInTransit: VehicleCardData[] = [];
  let dbOnSite: VehicleCardData[] = [];

  try {
    [dbInTransit, dbOnSite] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          dealerId: dealer.id,
          deletedAt: null,
          published: true,
          availability: "IN_TRANSIT",
        },
        orderBy: [{featured: "desc"}, {createdAt: "desc"}],
        include: {
          images: {
            orderBy: {sortOrder: "asc"},
          },
        },
        take: 12,
      }),
      prisma.vehicle.findMany({
        where: {
          dealerId: dealer.id,
          deletedAt: null,
          published: true,
          availability: "ON_SITE",
        },
        orderBy: [{featured: "desc"}, {createdAt: "desc"}],
        include: {
          images: {
            orderBy: {sortOrder: "asc"},
          },
        },
        take: 12,
      }),
    ]);
  } catch {
    dbInTransit = [];
    dbOnSite = [];
  }

  const inTransit = dbInTransit.map((vehicle) => mapVehicleCopy(vehicle, t));
  const onSite = dbOnSite.map((vehicle) => mapVehicleCopy(vehicle, t));
  const hasVehicles = inTransit.length > 0 || onSite.length > 0;
  const labels = {
    year: t("year"),
    mileage: t("mileage"),
    fuel: t("fuel"),
    gearbox: t("gearbox"),
    priceFrom: t("priceFrom"),
  };

  return (
    <div>
      <PageHero variant="gradient" title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons
          appStoreUrl={dealer.appStoreUrl}
          playStoreUrl={dealer.playStoreUrl}
        />
      </PageHero>

      {"homeDelivery" in dealer && dealer.homeDelivery && (
        <div className="bg-[var(--color-accent)] py-2.5">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-center gap-2 text-sm font-bold text-[#1a0d00]">
            <span>🏠</span>
            <span>{t("homeDeliveryBanner")}</span>
          </div>
        </div>
      )}

      <section className="section-charcoal py-14 sm:py-20">
        <Container>
          {!hasVehicles ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_24px_60px_-36px_rgba(0,0,0,0.55)]">
              <div className="section-accent-line mx-auto mb-5" />
              <h2 className="text-2xl font-black text-white">{t("emptyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/70">
                {t("emptyText")}
              </p>
            </div>
          ) : (
          <div className="grid gap-12">
            <div>
              <h2 className="text-2xl font-black text-white">{t("inTransitTitle")}</h2>
              <p className="mt-2 text-sm text-white/70">{t("inTransitText")}</p>
              {inTransit.length ? (
                <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {inTransit.map((v) => (
                    <VehicleCard
                      key={v.id}
                      v={v}
                      status={t("statusInTransit")}
                      statusClass="bg-amber-400/20 text-amber-300 border border-amber-300/30"
                      openLabel={t("openVehicle")}
                      locale={locale}
                      labels={labels}
                      onRequestLabel={t("priceOnRequest")}
                      noImageLabel={t("noImage")}
                      featuredLabel={t("featuredBadge")}
                      photoWord={t("photoWord")}
                      videoWord={t("videoWord")}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
                  {t("emptyTransit")}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">{t("onSiteTitle")}</h2>
              <p className="mt-2 text-sm text-white/70">{t("onSiteText")}</p>
              {onSite.length ? (
                <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {onSite.map((v) => (
                    <VehicleCard
                      key={v.id}
                      v={v}
                      status={t("statusOnSite")}
                      statusClass="bg-emerald-400/20 text-emerald-300 border border-emerald-300/30"
                      openLabel={t("openVehicle")}
                      locale={locale}
                      labels={labels}
                      onRequestLabel={t("priceOnRequest")}
                      noImageLabel={t("noImage")}
                      featuredLabel={t("featuredBadge")}
                      photoWord={t("photoWord")}
                      videoWord={t("videoWord")}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
                  {t("emptyOnSite")}
                </div>
              )}
            </div>
          </div>
          )}
        </Container>
      </section>
    </div>
  );
}

