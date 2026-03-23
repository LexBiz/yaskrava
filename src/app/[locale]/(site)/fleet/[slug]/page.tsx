import {Calendar, Fuel, Gauge, Settings2, MapPin} from "lucide-react";
import type {Metadata} from "next";
import type {ReactNode} from "react";
import {getLocale, getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {LeasingCalculator} from "@/components/calculator/LeasingCalculator";
import {ApplicationForm} from "@/components/forms/ApplicationForm";
import {PhotoGallery} from "@/components/site/PhotoGallery";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {Container} from "@/components/site/Container";
import {Link} from "@/i18n/navigation";
import {prisma} from "@/lib/prisma";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

export const dynamic = "force-dynamic";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatCzk(value: number | null | undefined, locale: string) {
  if (!value) return null;
  return new Intl.NumberFormat(
    locale === "uk" ? "uk-UA" : locale === "cs" ? "cs-CZ" : "en-US",
    {style: "currency", currency: "CZK", maximumFractionDigits: 0}
  ).format(value);
}

function mapFuel(
  value: string | null | undefined,
  t: Awaited<ReturnType<typeof getTranslations>>
) {
  if (!value) return "—";
  if (value === "Diesel") return t("demoFuelDiesel");
  if (value === "Petrol") return t("demoFuelPetrol");
  if (value === "Hybrid") return t("demoFuelHybrid");
  if (value === "Electric") return t("demoFuelElectric");
  if (value === "LPG") return t("demoFuelLpg");
  return value;
}

function mapTransmission(
  value: string | null | undefined,
  t: Awaited<ReturnType<typeof getTranslations>>
) {
  if (!value) return "—";
  if (value === "Automatic") return t("demoTransmissionAutomatic");
  if (value === "Manual") return t("demoTransmissionManual");
  return value;
}

// ─── SEO metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string; locale: string}>;
}): Promise<Metadata> {
  const {slug} = await params;

  try {
    const dealer = await getCurrentDealerOrThrow();
    const vehicle = await prisma.vehicle.findFirst({
      where: {dealerId: dealer.id, slug, deletedAt: null, published: true},
    });

    if (!vehicle) return {};

    const title = `${vehicle.title} | ${dealer.name}`;
    const description = vehicle.description
      ? vehicle.description.slice(0, 160)
      : `${vehicle.title}${vehicle.year ? ` · ${vehicle.year}` : ""}${vehicle.mileageKm ? ` · ${vehicle.mileageKm.toLocaleString()} km` : ""}${vehicle.priceCzk ? ` · ${vehicle.priceCzk.toLocaleString()} CZK` : ""}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: vehicle.imageUrl ? [{url: vehicle.imageUrl, width: 1200, height: 630, alt: vehicle.title}] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: vehicle.imageUrl ? [vehicle.imageUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  const locale = await getLocale();
  const dealer = await getCurrentDealerOrThrow();
  const t = await getTranslations("VehicleDetail");
  const tFleet = await getTranslations("Fleet");

  const vehicle = await prisma.vehicle.findFirst({
    where: {dealerId: dealer.id, slug, deletedAt: null, published: true},
    include: {images: {orderBy: {sortOrder: "asc"}}},
  });

  if (!vehicle) notFound();

  const galleryImages = Array.from(
    new Set(
      [vehicle.imageUrl, ...vehicle.images.map((i) => i.url)].filter(Boolean)
    )
  ) as string[];

  const galleryVideos = Array.isArray(vehicle.videoGallery)
    ? vehicle.videoGallery.filter(
        (item): item is string => typeof item === "string" && item.length > 0
      )
    : vehicle.videoUrl
      ? [vehicle.videoUrl]
      : [];

  const isInTransit = vehicle.availability === "IN_TRANSIT";
  const statusLabel = isInTransit ? t("statusInTransit") : t("statusOnSite");
  const priceFormatted = formatCzk(vehicle.priceCzk, locale);

  const specs = [
    {icon: <Calendar size={15} />, label: t("year"), value: vehicle.year?.toString() || "—"},
    {icon: <Gauge size={15} />, label: t("mileage"), value: vehicle.mileageKm ? `${vehicle.mileageKm.toLocaleString()} km` : "—"},
    {icon: <Fuel size={15} />, label: t("fuel"), value: mapFuel(vehicle.fuel, tFleet)},
    {icon: <Settings2 size={15} />, label: t("gearbox"), value: mapTransmission(vehicle.transmission, tFleet)},
  ];

  return (
    <div className="min-h-screen" style={{background: "#111214"}}>

      {/* ── Slim top bar ── */}
      <div
        className="border-b"
        style={{borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.35)"}}
      >
        <Container>
          <div className="flex items-center gap-3 py-3">
            <Link
              href="/fleet"
              className="flex items-center gap-1.5 text-xs font-semibold text-white/40 transition hover:text-white/80"
            >
              ← {t("backToFleet")}
            </Link>
            <span className="text-white/15">/</span>
            <span className="truncate text-xs text-white/50">{vehicle.title}</span>
          </div>
        </Container>
      </div>

      {/* ── Main content ── */}
      <Container>
        <div className="py-8 lg:py-12">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]">

            {/* ── Left column: media + specs + description ── */}
            <div className="min-w-0 space-y-5">

              {/* Title block (mobile) */}
              <div className="lg:hidden">
                <VehicleTitleBlock
                  title={vehicle.title}
                  statusLabel={statusLabel}
                  isInTransit={isInTransit}
                  price={priceFormatted}
                  priceOnRequest={t("priceOnRequest")}
                  dealerName={dealer.name}
                />
              </div>

              {/* Photo gallery */}
              {galleryImages.length > 0 ? (
                <PhotoGallery images={galleryImages} vehicleTitle={vehicle.title} />
              ) : (
                <div
                  className="flex h-[340px] items-center justify-center rounded-2xl text-sm"
                  style={{background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)"}}
                >
                  {t("noImage")}
                </div>
              )}

              {/* Spec cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {specs.map(({icon, label, value}) => (
                  <SpecCard key={label} icon={icon} label={label} value={value} />
                ))}
              </div>

              {/* Description */}
              {vehicle.description && (
                <div
                  className="rounded-2xl p-5"
                  style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)"}}
                >
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-widest" style={{color: "rgba(255,255,255,0.35)"}}>
                    {t("description")}
                  </div>
                  <p className="text-sm leading-7" style={{color: "rgba(255,255,255,0.72)"}}>
                    {vehicle.description}
                  </p>
                </div>
              )}

              {/* Videos */}
              {galleryVideos.length > 0 && (
                <div
                  className="overflow-hidden rounded-2xl p-4"
                  style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)"}}
                >
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{color: "rgba(255,255,255,0.35)"}}>
                    {t("videoSection")}
                  </div>
                  <div className="grid gap-3">
                    {galleryVideos.map((videoUrl) => (
                      <div key={videoUrl} className="overflow-hidden rounded-xl">
                        {videoUrl.endsWith(".mp4") ||
                        videoUrl.endsWith(".webm") ||
                        videoUrl.endsWith(".mov") ? (
                          <video
                            src={videoUrl}
                            controls
                            className="h-auto w-full rounded-xl bg-black"
                          />
                        ) : (
                          <div className="aspect-video overflow-hidden rounded-xl">
                            <iframe
                              src={videoUrl}
                              title={`${vehicle.title} video`}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* App download */}
              <div
                className="rounded-2xl p-4"
                style={{background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)"}}
              >
                <DownloadButtons />
              </div>
            </div>

            {/* ── Right column: title + form + calculator ── */}
            <div className="min-w-0 space-y-5">

              {/* Title block (desktop) */}
              <div className="hidden lg:block">
                <VehicleTitleBlock
                  title={vehicle.title}
                  statusLabel={statusLabel}
                  isInTransit={isInTransit}
                  price={priceFormatted}
                  priceOnRequest={t("priceOnRequest")}
                  dealerName={dealer.name}
                />
              </div>

              {/* Inquiry form */}
              <ApplicationForm vehicleId={vehicle.id} defaultTopic="VEHICLE" lockTopic />

              {/* Leasing calculator */}
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1" style={{background: "rgba(255,255,255,0.07)"}} />
                  <span className="text-xs font-semibold" style={{color: "rgba(255,255,255,0.35)"}}>
                    {t("orCalculateLeasing")}
                  </span>
                  <div className="h-px flex-1" style={{background: "rgba(255,255,255,0.07)"}} />
                </div>
                <div
                  className="overflow-hidden rounded-[24px] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]"
                  style={{border: "1px solid rgba(255,121,24,0.18)"}}
                >
                  <LeasingCalculator
                    initialPrice={vehicle.priceCzk || 600_000}
                    lockPrice={Boolean(vehicle.priceCzk)}
                    vehicleTitle={vehicle.title}
                    compact
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function VehicleTitleBlock({
  title,
  statusLabel,
  isInTransit,
  price,
  priceOnRequest,
  dealerName,
}: {
  title: string;
  statusLabel: string;
  isInTransit: boolean;
  price: string | null;
  priceOnRequest: string;
  dealerName: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)"}}
    >
      {/* Status badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
          style={
            isInTransit
              ? {background: "rgba(251,191,36,0.15)", color: "#FBB824", border: "1px solid rgba(251,191,36,0.25)"}
              : {background: "rgba(52,211,153,0.12)", color: "#34D399", border: "1px solid rgba(52,211,153,0.22)"}
          }
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{background: isInTransit ? "#FBB824" : "#34D399"}}
          />
          {statusLabel}
        </span>
        <span className="flex items-center gap-1 text-[11px]" style={{color: "rgba(255,255,255,0.3)"}}>
          <MapPin size={10} />
          {dealerName}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-xl font-black leading-tight text-white sm:text-2xl break-words">
        {title}
      </h1>

      {/* Price */}
      <div className="mt-4">
        {price ? (
          <div className="text-3xl font-black" style={{color: "#FF7918"}}>
            {price}
          </div>
        ) : (
          <div className="text-lg font-semibold" style={{color: "rgba(255,255,255,0.4)"}}>
            {priceOnRequest}
          </div>
        )}
      </div>
    </div>
  );
}

function SpecCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-xl p-3.5"
      style={{background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)"}}
    >
      <div
        className="mb-1.5 flex items-center gap-1.5 text-[11px]"
        style={{color: "rgba(255,255,255,0.38)"}}
      >
        {icon}
        {label}
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
