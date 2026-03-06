import {
  createDealerVehicleAction,
  dealerLogoutAction,
  setDealerApplicationNoteAction,
  setDealerApplicationStatusAction,
  updateDealerVehicleAction,
} from "@/app/dealer/actions";
import {requireDealerUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

const STATUS_OPTIONS = [
  "NEW",
  "IN_REVIEW",
  "NEED_INFO",
  "CONTACTED",
  "APPROVED",
  "REJECTED",
] as const;

const AVAILABILITY_OPTIONS = ["IN_TRANSIT", "ON_SITE", "SOLD"] as const;

export const dynamic = "force-dynamic";

export default async function DealerDashboard() {
  const dealer = await getCurrentDealerOrThrow();
  const {user, membership} = await requireDealerUser(dealer.id);

  const [applications, vehicles] = await Promise.all([
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
  ]);

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white/60">
              {dealer.name} • Dealer CRM
            </div>
            <h1 className="mt-2 text-2xl font-semibold">Mini CRM</h1>
            <p className="mt-1 text-sm text-white/60">
              {user.email}
              {membership ? ` • ${membership.role}` : " • platform access"}
            </p>
          </div>

          <form action={dealerLogoutAction}>
            <button
              type="submit"
              className="h-10 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Vehicles" value={String(vehicles.length)} />
          <MetricCard label="Leads" value={String(applications.length)} />
          <MetricCard
            label="Open financing"
            value={String(
              applications.filter(
                (item) =>
                  item.financingStatus !== "APPROVED" &&
                  item.financingStatus !== "REJECTED" &&
                  item.financingStatus !== "FUNDED"
              ).length
            )}
          />
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Lead inbox</h2>
          <div className="mt-5 divide-y divide-white/10">
            {applications.length ? (
              applications.map((lead) => (
                <div key={lead.id} className="py-5">
                  <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
                    <div>
                      <div className="text-sm font-semibold text-white">{lead.fullName}</div>
                      <div className="mt-1 text-xs text-white/50">
                        {new Date(lead.createdAt).toLocaleString()} • {lead.topic} •{" "}
                        {lead.financingStatus}
                      </div>
                      <div className="mt-1 text-xs text-white/40">
                        {lead.phone || "—"} • {lead.email || "—"}
                      </div>
                      {lead.vehicle ? (
                        <div className="mt-2 text-xs text-[var(--color-accent)]">
                          Vehicle: {lead.vehicle.title}
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
                          className="h-10 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs font-semibold text-white outline-none focus:border-white/25"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                        >
                          Save
                        </button>
                      </form>

                      <form action={setDealerApplicationNoteAction} className="grid gap-2">
                        <input type="hidden" name="id" value={lead.id} />
                        <textarea
                          name="dealerNote"
                          defaultValue={lead.dealerNote ?? ""}
                          placeholder="Dealer note…"
                          className="min-h-24 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-white/25"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="h-10 rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10"
                          >
                            Save note
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-sm text-white/60">No leads yet.</div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Add vehicle</h2>
          <p className="mt-1 text-sm text-white/60">
            Publish a new car to your dealer subdomain and financing flow.
          </p>

          <form action={createDealerVehicleAction} className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">Title</span>
              <input
                name="title"
                required
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="BMW 320d Touring • 2021 • Automatic"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Make</span>
              <input
                name="make"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="BMW"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Model</span>
              <input
                name="model"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="320d Touring"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Year</span>
              <input
                name="year"
                type="number"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="2021"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Mileage (km)</span>
              <input
                name="mileageKm"
                type="number"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="74000"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Fuel</span>
              <input
                name="fuel"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="Diesel"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Transmission</span>
              <input
                name="transmission"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="Automatic"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Price CZK</span>
              <input
                name="priceCzk"
                type="number"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="649000"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Availability</span>
              <select
                name="availability"
                defaultValue="ON_SITE"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
              >
                {AVAILABILITY_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">Image URL</span>
              <input
                name="imageUrl"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="https://..."
              />
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">Description</span>
              <textarea
                name="description"
                className="min-h-24 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                placeholder="Short vehicle description and selling points."
              />
            </label>
            <div className="lg:col-span-2 flex justify-end">
              <button
                type="submit"
                className="h-11 rounded-2xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-black hover:brightness-95"
              >
                Add vehicle
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Vehicles</h2>
          <div className="mt-5 divide-y divide-white/10">
            {vehicles.length ? (
              vehicles.map((vehicle) => (
                <div key={vehicle.id} className="grid gap-4 py-5 md:grid-cols-[1.4fr_1fr]">
                  <div>
                    <div className="text-sm font-semibold text-white">{vehicle.title}</div>
                    <div className="mt-1 text-xs text-white/50">
                      {vehicle.make || "—"} • {vehicle.model || "—"} • {vehicle.year || "—"}
                    </div>
                    <div className="mt-1 text-xs text-white/40">
                      {vehicle.priceCzk ? `${vehicle.priceCzk.toLocaleString()} CZK` : "Price on request"}
                    </div>
                  </div>

                  <form action={updateDealerVehicleAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input type="hidden" name="id" value={vehicle.id} />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <select
                        name="availability"
                        defaultValue={vehicle.availability}
                        className="h-10 rounded-2xl border border-white/10 bg-black/40 px-3 text-xs font-semibold text-white outline-none focus:border-white/25"
                      >
                        {AVAILABILITY_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white/70">
                        <input
                          type="checkbox"
                          name="published"
                          defaultChecked={vehicle.published}
                          className="h-4 w-4 rounded border-white/20 bg-black/40"
                        />
                        Published
                      </label>

                      <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 text-xs text-white/70">
                        <input
                          type="checkbox"
                          name="featured"
                          defaultChecked={vehicle.featured}
                          className="h-4 w-4 rounded border-white/20 bg-black/40"
                        />
                        Featured
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="h-10 rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      Save
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="py-6 text-sm text-white/60">No vehicles yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-white/45">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
