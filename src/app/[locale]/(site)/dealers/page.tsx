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
  const initialRegion = (sp.region as CzechRegion) || null;

  // Fetch all active dealers (exclude the platform default dealer)
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

  // Count dealers per region for the map
  const dealerCounts: Partial<Record<CzechRegion, number>> = {};
  for (const d of dealerCards) {
    if (d.region) {
      dealerCounts[d.region] = (dealerCounts[d.region] ?? 0) + 1;
    }
  }

  // Dynamic import to keep Server Component
  const {DealersClient} = await import("./DealersClient");

  return (
    <div>
      <PageHero
        variant="gradient"
        title="Знайдіть дилера у вашому регіоні"
        subtitle="Оберіть регіон на карті — і ми покажемо дилерів, які є поруч. Також можлива доставка авто прямо до вас."
      />

      <section className="section-charcoal py-14 sm:py-20">
        <Container>
          {/* Home delivery info strip */}
          <div className="mb-10 flex items-center gap-4 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/8 px-5 py-4">
            <span className="text-2xl flex-shrink-0">🏠</span>
            <div>
              <p className="text-sm font-bold text-white">Доставка автомобіля додому</p>
              <p className="text-xs text-white/60 mt-0.5">
                Деякі дилери пропонують доставку авто прямо до вашого будинку — без поїздки в салон. Такі дилери позначені бейджем.
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
