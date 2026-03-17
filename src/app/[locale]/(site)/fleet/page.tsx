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
}) {
  const galleryImage = v.images?.find((i) => isValidMediaUrl(i.url))?.url;
  const rawHeroImage = v.imageUrl || galleryImage;
  const heroImage = isValidMediaUrl(rawHeroImage) ? rawHeroImage : undefined;
  const videoCount = Array.isArray(v.videoGallery) ? v.videoGallery.length : 0;
  const photoCount = v.images?.length || (heroImage ? 1 : 0);

  return (
    <Link href={v.slug ? `/fleet/${v.slug}` : "/fleet"} className="block no-underline">
    <article className="yask-card rounded-2xl overflow-hidden group">
      <div className="relative aspect-video w-full overflow-hidden bg-[rgba(40,25,8,0.70)]">
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={v.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/40 text-sm">
            {noImageLabel}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusClass}`}>
            {status}
          </span>
        </div>
        <div className="absolute right-3 top-3 flex flex-wrap gap-2">
          {v.featured ? (
            <span className="rounded-full border border-[var(--color-accent)]/40 bg-black/35 px-3 py-1 text-[11px] font-bold text-[var(--color-accent)]">
              Featured
            </span>
          ) : null}
          {(photoCount > 1 || videoCount > 0) ? (
            <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-bold text-white/85">
              {photoCount} фото • {videoCount} відео
            </span>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent opacity-70" />
      </div>

      <div className="p-5">
        <h3 className="text-base font-black text-white leading-tight">{v.title}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Calendar size={13} />
              {labels.year}
            </div>
            <div className="mt-1 text-white font-semibold">{v.year ?? "—"}</div>
          </div>
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Gauge size={13} />
              {labels.mileage}
            </div>
            <div className="mt-1 text-white font-semibold">
              {v.mileageKm ? `${v.mileageKm.toLocaleString()} km` : "—"}
            </div>
          </div>
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Fuel size={13} />
              {labels.fuel}
            </div>
            <div className="mt-1 text-white font-semibold">{v.fuel || "—"}</div>
          </div>
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Settings2 size={13} />
              {labels.gearbox}
            </div>
            <div className="mt-1 text-white font-semibold">{v.transmission || "—"}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-white/55">{labels.priceFrom}</span>
          <span className="text-sm font-black text-[var(--color-accent)]">
            {formatCzk(v.priceCzk, locale) || onRequestLabel}
          </span>
        </div>
        {v.description ? (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/65">{v.description}</p>
        ) : null}
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
          {openLabel}
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

