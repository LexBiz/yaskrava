import {
  createDealerVehicleAction,
  deleteDealerVehicleAction,
  dealerLogoutAction,
  markDealerVehicleSoldAction,
  setDealerApplicationNoteAction,
  setDealerApplicationStatusAction,
  updateDealerVehicleAction,
} from "@/app/dealer/actions";
import {
  applicationStatusLabels,
  availabilityLabels,
  dealerCrmCopy,
  financingStatusLabels,
  membershipRoleLabels,
  resolveDealerCrmLocale,
  topicLabels,
} from "@/lib/crmCopy";
import {getDealerMetricSummary} from "@/lib/dealerMetrics";
import {requireDealerUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {getCurrentDealerOrThrow} from "@/lib/tenant";
import Link from "next/link";

const STATUS_OPTIONS = [
  "NEW",
  "IN_REVIEW",
  "NEED_INFO",
  "CONTACTED",
  "APPROVED",
  "REJECTED",
] as const;

const AVAILABILITY_OPTIONS = ["IN_TRANSIT", "ON_SITE", "SOLD"] as const;
const DEALER_VEHICLE_FILTERS = ["all", "on_site", "in_transit", "sold"] as const;
type DealerVehicleFilter = (typeof DEALER_VEHICLE_FILTERS)[number];

function normalizeDealerVehicleFilter(value: string | undefined): DealerVehicleFilter {
  return (DEALER_VEHICLE_FILTERS as readonly string[]).includes(value || "")
    ? (value as DealerVehicleFilter)
    : "all";
}

export const dynamic = "force-dynamic";

export default async function DealerDashboard({
  searchParams,
}: {
  searchParams: Promise<{lang?: string | string[]; inventory?: string | string[]}>;
}) {
  const params = await searchParams;
  const locale = resolveDealerCrmLocale(Array.isArray(params.lang) ? params.lang[0] : params.lang);
  const inventoryFilter = normalizeDealerVehicleFilter(Array.isArray(params.inventory) ? params.inventory[0] : params.inventory);
  const t = dealerCrmCopy[locale];
  const dealer = await getCurrentDealerOrThrow();
  const {user, membership} = await requireDealerUser(dealer.id);

  const [applications, vehicles, metrics] = await Promise.all([
    prisma.application.findMany({
      where: {
        dealerId: dealer.id,
        deletedAt: null,
      },
      orderBy: {createdAt: "desc"},
      take: 100,
      include: {
        vehicle: true,
      },
    }),
    prisma.vehicle.findMany({
      where: {
        dealerId: dealer.id,
        deletedAt: null,
      },
      orderBy: {createdAt: "desc"},
      take: 100,
    }),
    getDealerMetricSummary(dealer.id),
  ]);
  const visibleVehicles = vehicles.filter((vehicle) => {
    if (inventoryFilter === "on_site") return vehicle.availability === "ON_SITE";
    if (inventoryFilter === "in_transit") return vehicle.availability === "IN_TRANSIT";
    if (inventoryFilter === "sold") return vehicle.availability === "SOLD";
    return true;
  });

  return (
    <div className="overflow-x-hidden px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white/60">
              {dealer.name} • {t.eyebrow}
            </div>
            <h1 className="mt-2 text-2xl font-semibold">{t.title}</h1>
            <p className="mt-1 text-sm text-white/60">
              {user.email}
              {membership ? ` • ${membershipRoleLabels[locale][membership.role]}` : ` • ${t.platformAccess}`}
            </p>
          </div>

          <form action={dealerLogoutAction}>
            <input type="hidden" name="lang" value={locale} />
            <button
              type="submit"
              className="h-10 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              {t.logout}
            </button>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-start gap-3 text-xs font-semibold md:justify-end">
          <span className="text-white/50">{t.language}</span>
          <Link href="/dealer?lang=uk" className={locale === "uk" ? "text-white" : "text-white/45"}>UKR</Link>
          <Link href="/dealer?lang=cs" className={locale === "cs" ? "text-white" : "text-white/45"}>CS</Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard label={t.vehicles} value={String(metrics.vehicleCount)} />
          <MetricCard label={t.leads} value={String(metrics.applicationsTotal)} />
          <MetricCard label={locale === "cs" ? "Schváleno" : "Схвалено"} value={String(metrics.applicationsApproved)} />
          <MetricCard label={locale === "cs" ? "Zamítnuto" : "Відхилено"} value={String(metrics.applicationsRejected)} />
        </div>

        <div className="mt-3 text-right text-xs text-white/45">
          {metrics.latestSnapshotDate
            ? `${locale === "cs" ? "Poslední denní snapshot" : "Останній daily snapshot"}: ${new Date(
                metrics.latestSnapshotDate
              ).toLocaleDateString()}`
            : locale === "cs"
              ? "Denní snapshot zatím nebyl vytvořen"
              : "Daily snapshot ще не створено"}
        </div>

        <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
          <h2 className="text-lg font-semibold text-white">{t.leadInbox}</h2>
          <div className="mt-5 divide-y divide-white/10">
            {applications.length ? (
              applications.map((lead) => (
                <div key={lead.id} className="py-5">
                  <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
                    <div>
                      <div className="text-sm font-semibold text-white">{lead.fullName}</div>
                      <div className="mt-1 text-xs text-white/50">
                        {new Date(lead.createdAt).toLocaleString()} • {topicLabels[locale][lead.topic]} •{" "}
                        {financingStatusLabels[locale][lead.financingStatus]}
                      </div>
                      <div className="mt-1 text-xs text-white/40">
                        {lead.phone || "—"} • {lead.email || "—"}
                      </div>
                      {lead.vehicle ? (
                        <div className="mt-2 text-xs text-[var(--color-accent)]">
                          {t.leadVehicle}: {lead.vehicle.title}
                        </div>
                      ) : null}
                      {lead.message ? (
                        <div className="mt-3 text-sm leading-6 text-white/70">{lead.message}</div>
                      ) : null}
                    </div>

                    <div className="grid gap-3">
                      <form action={setDealerApplicationStatusAction} className="flex gap-2">
                        <input type="hidden" name="id" value={lead.id} />
                        <select
                          name="status"
                          defaultValue={lead.status}
                          className="h-10 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs font-semibold text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {applicationStatusLabels[locale][status]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                        >
                          {t.save}
                        </button>
                      </form>

                      <form action={setDealerApplicationNoteAction} className="grid gap-2">
                        <input type="hidden" name="id" value={lead.id} />
                        <textarea
                          name="dealerNote"
                          defaultValue={lead.dealerNote ?? ""}
                          placeholder={t.dealerNotePlaceholder}
                          className="min-h-24 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="h-10 rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10"
                          >
                            {t.saveNote}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-sm text-white/60">{t.noLeads}</div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
          <h2 className="text-lg font-semibold text-white">{t.addVehicle}</h2>
          <p className="mt-1 text-sm text-white/60">
            {t.addVehicleText}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              {key: "all", label: locale === "cs" ? "Vše" : "Усі"},
              {key: "on_site", label: availabilityLabels[locale].ON_SITE},
              {key: "in_transit", label: availabilityLabels[locale].IN_TRANSIT},
              {key: "sold", label: availabilityLabels[locale].SOLD},
            ].map((item) => (
              <Link
                key={item.key}
                href={`/dealer?lang=${locale}&inventory=${item.key}`}
                className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold ${
                  inventoryFilter === item.key
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <details className="mt-5 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-white/[0.03] p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
              {t.addVehicleButton}
            </summary>
            <form action={createDealerVehicleAction} className="mt-4 grid gap-4 lg:grid-cols-2 [&_input]:min-w-0 [&_input]:w-full [&_select]:min-w-0 [&_select]:w-full [&_textarea]:min-w-0 [&_textarea]:w-full">
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">{t.titleField}</span>
              <input
                name="title"
                required
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder={t.titlePlaceholder}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.stockNumber}</span>
              <input
                name="stockNumber"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="YA-001"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.vinLast6}</span>
              <input
                name="vinLast6"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="123ABC"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.make}</span>
              <input
                name="make"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="BMW"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.model}</span>
              <input
                name="model"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="320d Touring"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.year}</span>
              <input
                name="year"
                type="number"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="2021"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.mileageKm}</span>
              <input
                name="mileageKm"
                type="number"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="74000"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.fuel}</span>
              <input
                name="fuel"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder={t.fuelPlaceholder}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.transmission}</span>
              <input
                name="transmission"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder={t.transmissionPlaceholder}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.priceCzk}</span>
              <input
                name="priceCzk"
                type="number"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="649000"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.availability}</span>
              <select
                name="availability"
                defaultValue="ON_SITE"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
              >
                {AVAILABILITY_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {availabilityLabels[locale][status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">{t.uploadPhoto}</span>
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                className="rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">{t.uploadVideo}</span>
              <input
                name="videoFile"
                type="file"
                accept="video/*"
                className="rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">{t.imageUrl}</span>
              <input
                name="imageUrl"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="https://..."
              />
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">{t.videoUrl}</span>
              <input
                name="videoUrl"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="https://..."
              />
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">{t.description}</span>
              <textarea
                name="description"
                className="min-h-24 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder={t.descriptionPlaceholder}
              />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white/75 lg:col-span-2">
              <input
                type="checkbox"
                name="leasingEligible"
                defaultChecked
                className="h-4 w-4 rounded border-white/20 bg-black/20"
              />
              {t.leasingEligible}
            </label>
            <div className="lg:col-span-2 flex justify-end">
              <button
                type="submit"
                className="h-11 rounded-2xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-black hover:brightness-95"
              >
                {t.addVehicleButton}
              </button>
            </div>
            </form>
          </details>
        </section>

        <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
          <h2 className="text-lg font-semibold text-white">{t.vehiclesHeading}</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {visibleVehicles.length ? (
              visibleVehicles.map((vehicle) => (
                <article
                  key={vehicle.id}
                  className={`rounded-[26px] border p-4 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.55)] ${
                    vehicle.availability === "SOLD"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-bold border-white/10 bg-white/5 text-white/70">
                      {availabilityLabels[locale][vehicle.availability]}
                    </span>
                    <div className="text-[11px] text-white/45">
                      {vehicle.published ? t.published : locale === "cs" ? "Skryto" : "Приховано"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="line-clamp-2 text-base font-black text-white">{vehicle.title}</div>
                    <div className="mt-2 text-sm font-semibold text-[var(--color-accent)]">
                      {vehicle.priceCzk ? `${vehicle.priceCzk.toLocaleString()} CZK` : t.priceOnRequest}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/55">
                      {vehicle.make ? <span>{vehicle.make}</span> : null}
                      {vehicle.model ? <span>{vehicle.model}</span> : null}
                      {vehicle.year ? <span>{vehicle.year}</span> : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {vehicle.availability !== "SOLD" ? (
                      <form action={markDealerVehicleSoldAction}>
                        <input type="hidden" name="id" value={vehicle.id} />
                        <button
                          type="submit"
                          className="h-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/15"
                        >
                          {availabilityLabels[locale].SOLD}
                        </button>
                      </form>
                    ) : null}
                    <details className="flex-1 min-w-[180px] rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.22)] p-3">
                      <summary className="cursor-pointer list-none text-center text-xs font-semibold text-white [&::-webkit-details-marker]:hidden">
                        {locale === "cs" ? "Opravit" : "Виправити"}
                      </summary>
                      <form action={updateDealerVehicleAction} className="mt-3 grid gap-2">
                        <input type="hidden" name="id" value={vehicle.id} />
                        <select
                          name="availability"
                          defaultValue={vehicle.availability}
                          className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs font-semibold text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                        >
                          {AVAILABILITY_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {availabilityLabels[locale][status]}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white/70">
                          <input
                            type="checkbox"
                            name="published"
                            defaultChecked={vehicle.published}
                            className="h-4 w-4 rounded border-white/20 bg-[rgba(50,32,8,0.70)]"
                          />
                          {t.published}
                        </label>
                        <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white/70">
                          <input
                            type="checkbox"
                            name="featured"
                            defaultChecked={vehicle.featured}
                            className="h-4 w-4 rounded border-white/20 bg-[rgba(50,32,8,0.70)]"
                          />
                          {t.featured}
                        </label>
                        <button
                          type="submit"
                          className="h-10 rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10"
                        >
                          {locale === "cs" ? "Opravit" : "Виправити"}
                        </button>
                      </form>
                    </details>
                    <form action={deleteDealerVehicleAction}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <button
                        type="submit"
                        className="h-10 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 text-xs font-semibold text-red-200 hover:bg-red-500/15"
                      >
                        {t.delete}
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-6 text-sm text-white/60 lg:col-span-2">{t.noVehicles}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-3xl border border-[rgba(255,180,80,0.14)] bg-white/[0.03] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-white/45">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
