import {getTranslations} from "next-intl/server";

import {Container} from "@/components/site/Container";
import {PageHero} from "@/components/site/PageHero";
import {type CzechRegion} from "@/components/site/CzechRegionMap";
import {prisma} from "@/lib/prisma";
import {getDealerPublicUrl} from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function DealersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("Dealers");
  const initialRegion = (sp.region as CzechRegion) || null;

  const platformSlug = process.env.DEFAULT_DEALER_SLUG || "yaskrava";

  const dealers = await prisma.dealer.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      slug: {not: platformSlug},
    },
    include: {
      _count: {
        select: {
          vehicles: {
            where: {deletedAt: null, published: true, availability: {not: "SOLD"}},
          },
        },
      },
    },
    orderBy: [{name: "asc"}],
  });

  const dealerCards = dealers.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    city: d.city,
    region: d.region as CzechRegion | null,
    homeDelivery: d.homeDelivery,
    vehicleCount: d._count.vehicles,
    publicUrl: getDealerPublicUrl(d.slug),
  }));

  const dealerCounts: Partial<Record<CzechRegion, number>> = {};
  for (const d of dealerCards) {
    if (d.region) {
      dealerCounts[d.region] = (dealerCounts[d.region] ?? 0) + 1;
    }
  }

  const {DealersClient} = await import("./DealersClient");

  return (
    <div>
      <PageHero
        variant="gradient"
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="section-charcoal py-14 sm:py-20">
        <Container>
          <div className="mb-10 flex items-center gap-4 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/8 px-5 py-4">
            <span className="text-2xl flex-shrink-0">🏠</span>
            <div>
              <p className="text-sm font-bold text-white">{t("homeDeliveryTitle")}</p>
              <p className="text-xs text-white/60 mt-0.5">
                {t("homeDeliveryText")}
              </p>
            </div>
          </div>

          <DealersClient
            dealers={dealerCards}
            initialRegion={initialRegion}
            dealerCounts={dealerCounts}
          />
        </Container>
      </section>
    </div>
  );
}
