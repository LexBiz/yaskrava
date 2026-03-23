import {Container} from "@/components/site/Container";
import {type CzechRegion} from "@/components/site/CzechRegionMap";
import {prisma} from "@/lib/prisma";
import {getDealerPublicUrl} from "@/lib/tenant";
import {Link} from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function DealersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
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
      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{background: "linear-gradient(160deg, #1a1a1c 0%, #2a1800 50%, #1a0d00 100%)"}}
      >
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(255,121,24,0.12) 0%, transparent 60%)",
        }} />
        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <Container>
          <div className="relative text-center max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest mb-6"
              style={{background: "rgba(255,121,24,0.12)", border: "1px solid rgba(255,121,24,0.2)", color: "rgba(255,153,2,0.9)"}}
            >
              🗺 Дилерська мережа
            </div>

            <h1 className="font-black text-white leading-tight" style={{fontSize: "clamp(2rem, 5vw, 3.5rem)"}}>
              Знайдіть дилера<br />
              <span style={{
                background: "linear-gradient(135deg, #FF7918, #FF9902)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                у вашому регіоні
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed max-w-lg mx-auto" style={{color: "rgba(255,255,255,0.60)"}}>
              Натисніть на регіон на карті — побачите дилерів поруч із вами.
              Деякі пропонують доставку авто прямо до будинку.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-all hover:bg-white/[0.07]"
                style={{border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.70)"}}
              >
                🚗 Переглянути авто
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-all hover:bg-white/[0.07]"
                style={{border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.70)"}}
              >
                📋 Лізинговий калькулятор
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Map + dealers */}
      <section className="py-14 sm:py-20" style={{background: "#1a1a1c"}}>
        <Container>
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
