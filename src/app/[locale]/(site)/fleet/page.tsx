import {Calendar, Fuel, Gauge, Settings2} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {DownloadButtons} from "@/components/shared/DownloadButtons";
import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";
import {prisma} from "@/lib/prisma";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

export const dynamic = "force-dynamic";

type VehicleCardData = {
  id: string;
  title: string;
  year?: number | null;
  mileageKm?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  priceCzk?: number | null;
  imageUrl?: string | null;
};

const DEMO_TRANSIT: VehicleCardData[] = [
  {
    id: "demo-it-1",
    title: "BMW 320d Touring",
    year: 2021,
    mileageKm: 74000,
    fuel: "Diesel",
    transmission: "Automatic",
    priceCzk: 649000,
    imageUrl:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "demo-it-2",
    title: "Audi A4 Avant",
    year: 2020,
    mileageKm: 82000,
    fuel: "Diesel",
    transmission: "Automatic",
    priceCzk: 589000,
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "demo-it-3",
    title: "Škoda Kodiaq 2.0 TDI",
    year: 2021,
    mileageKm: 69000,
    fuel: "Diesel",
    transmission: "Automatic",
    priceCzk: 739000,
    imageUrl:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
  },
];

const DEMO_ONSITE: VehicleCardData[] = [
  {
    id: "demo-os-1",
    title: "Toyota Corolla Hybrid",
    year: 2022,
    mileageKm: 51000,
    fuel: "Hybrid",
    transmission: "Automatic",
    priceCzk: 469000,
    imageUrl:
      "https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "demo-os-2",
    title: "Volkswagen Passat Variant",
    year: 2020,
    mileageKm: 94000,
    fuel: "Diesel",
    transmission: "Automatic",
    priceCzk: 519000,
    imageUrl:
      "https://images.unsplash.com/photo-1605515298946-d062f2e9da53?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "demo-os-3",
    title: "Hyundai Tucson 1.6 T-GDI",
    year: 2021,
    mileageKm: 63000,
    fuel: "Petrol",
    transmission: "Automatic",
    priceCzk: 599000,
    imageUrl:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
  },
];

function formatCzk(value?: number | null) {
  if (!value) return null;
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(value);
}

function VehicleCard({
  v,
  status,
  statusClass,
}: {
  v: VehicleCardData;
  status: string;
  statusClass: string;
}) {
  return (
    <article className="yask-card rounded-2xl overflow-hidden">
      <div className="relative h-44 w-full bg-[rgba(40,25,8,0.70)]">
        {v.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.imageUrl}
            alt={v.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/40 text-sm">
            No image
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusClass}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-base font-black text-white leading-tight">{v.title}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Calendar size={13} />
              Year
            </div>
            <div className="mt-1 text-white font-semibold">{v.year ?? "—"}</div>
          </div>
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Gauge size={13} />
              Mileage
            </div>
            <div className="mt-1 text-white font-semibold">
              {v.mileageKm ? `${v.mileageKm.toLocaleString()} km` : "—"}
            </div>
          </div>
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Fuel size={13} />
              Fuel
            </div>
            <div className="mt-1 text-white font-semibold">{v.fuel || "—"}</div>
          </div>
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-1.5 text-white/60">
              <Settings2 size={13} />
              Gearbox
            </div>
            <div className="mt-1 text-white font-semibold">{v.transmission || "—"}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-white/55">Price from</span>
          <span className="text-sm font-black text-[var(--color-accent)]">
            {formatCzk(v.priceCzk) || "on request"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function FleetPage() {
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
        orderBy: {createdAt: "desc"},
        take: 6,
      }),
      prisma.vehicle.findMany({
        where: {
          dealerId: dealer.id,
          deletedAt: null,
          published: true,
          availability: "ON_SITE",
        },
        orderBy: {createdAt: "desc"},
        take: 6,
      }),
    ]);
  } catch {
    dbInTransit = [];
    dbOnSite = [];
  }

  const inTransit = dbInTransit.length
    ? dbInTransit
    : DEMO_TRANSIT;
  const onSite = dbOnSite.length
    ? dbOnSite
    : DEMO_ONSITE;

  return (
    <div>
      <PageHero title={t("title")} subtitle={t("subtitle")}>
        <DownloadButtons
          appStoreUrl={dealer.appStoreUrl}
          playStoreUrl={dealer.playStoreUrl}
        />
      </PageHero>

      <section style={{background:"linear-gradient(160deg,#2F1F0C 0%,#251809 100%)"}} className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-12">
            <div>
              <h2 className="text-2xl font-black text-white">{t("inTransitTitle")}</h2>
              <p className="mt-2 text-sm text-white/70">{t("inTransitText")}</p>
              <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {inTransit.map((v) => (
                  <VehicleCard
                    key={v.id}
                    v={v}
                    status={t("statusInTransit")}
                    statusClass="bg-amber-400/20 text-amber-300 border border-amber-300/30"
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">{t("onSiteTitle")}</h2>
              <p className="mt-2 text-sm text-white/70">{t("onSiteText")}</p>
              <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {onSite.map((v) => (
                  <VehicleCard
                    key={v.id}
                    v={v}
                    status={t("statusOnSite")}
                    statusClass="bg-emerald-400/20 text-emerald-300 border border-emerald-300/30"
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

