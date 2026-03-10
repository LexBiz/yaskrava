import {Calendar, Fuel, Gauge, Settings2} from "lucide-react";
import type {ReactNode} from "react";
import {getLocale, getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";

import {LeasingCalculator} from "@/components/calculator/LeasingCalculator";
import {ApplicationForm} from "@/components/forms/ApplicationForm";
import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";
import {Link} from "@/i18n/navigation";
import {prisma} from "@/lib/prisma";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

export const dynamic = "force-dynamic";

function formatCzk(value: number | null | undefined, locale: string) {
  if (!value) return null;
  return new Intl.NumberFormat(locale === "uk" ? "uk-UA" : locale === "cs" ? "cs-CZ" : "en-US", {
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
    where: {
      dealerId: dealer.id,
      slug,
      deletedAt: null,
      published: true,
    },
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <div>
      <PageHero
        variant="gradient"
        eyebrow={vehicle.availability === "IN_TRANSIT" ? t("statusInTransit") : t("statusOnSite")}
        title={vehicle.title}
        subtitle={vehicle.availability === "IN_TRANSIT" ? t("statusInTransitText") : t("statusOnSiteText")}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/fleet" className="btn-white">
            {t("backToFleet")}
          </Link>
          <DownloadButtons />
        </div>
      </PageHero>

      <section className="section-white py-14 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                {vehicle.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.title}
                    className="h-[380px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[380px] items-center justify-center bg-gray-100 text-gray-400">
                    {t("noImage")}
                  </div>
                )}
              </div>

              {vehicle.videoUrl ? (
                <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white p-3">
                  {vehicle.videoUrl.endsWith(".mp4") || vehicle.videoUrl.endsWith(".webm") || vehicle.videoUrl.endsWith(".mov") ? (
                    <video
                      src={vehicle.videoUrl}
                      controls
                      className="h-auto w-full rounded-2xl bg-black"
                    />
                  ) : (
                    <div className="aspect-video overflow-hidden rounded-2xl">
                      <iframe
                        src={vehicle.videoUrl}
                        title={`${vehicle.title} video`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SpecCard icon={<Calendar size={14} />} label={t("year")} value={vehicle.year?.toString() || "—"} />
                <SpecCard icon={<Gauge size={14} />} label={t("mileage")} value={vehicle.mileageKm ? `${vehicle.mileageKm.toLocaleString()} km` : "—"} />
                <SpecCard icon={<Fuel size={14} />} label={t("fuel")} value={mapFuel(vehicle.fuel, tFleet)} />
                <SpecCard icon={<Settings2 size={14} />} label={t("gearbox")} value={mapTransmission(vehicle.transmission, tFleet)} />
              </div>

              <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{color: "rgba(59,59,61,0.45)"}}>
                  {t("financingTitle")}
                </div>
                <div className="mt-3 text-3xl font-black" style={{color: "#FF7918"}}>
                  {formatCzk(vehicle.priceCzk, locale) || t("priceOnRequest")}
                </div>
                <div className="mt-2 text-sm leading-7" style={{color: "rgba(59,59,61,0.68)"}}>
                  {t("financingText")}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div
                className="section-charcoal overflow-hidden rounded-[28px] shadow-[0_28px_80px_-40px_rgba(0,0,0,0.55)]"
                style={{border: "1px solid rgba(255,121,24,0.18)"}}
              >
                <LeasingCalculator
                  initialPrice={vehicle.priceCzk || 600_000}
                  lockPrice={Boolean(vehicle.priceCzk)}
                  vehicleTitle={vehicle.title}
                  compact
                />
              </div>
              <ApplicationForm vehicleId={vehicle.id} defaultTopic="VEHICLE" lockTopic />
            </div>
          </div>
        </Container>
      </section>
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
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs" style={{color: "rgba(59,59,61,0.48)"}}>
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold" style={{color: "#3B3B3D"}}>{value}</div>
    </div>
  );
}
