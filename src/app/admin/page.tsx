import {
  adminLogoutAction,
  createDealerProvisionAction,
  deleteApplicationAction,
  setAdminNoteAction,
  setApplicationStatusAction,
  setFinancingStatusAction,
  toggleArchivedAction,
} from "@/app/admin/actions";
import {requireAdmin} from "@/lib/adminAuth";
import {prisma} from "@/lib/prisma";
import {getDealerCrmUrl, getDealerPublicUrl} from "@/lib/tenant";

const STATUS_OPTIONS = [
  "NEW",
  "IN_REVIEW",
  "NEED_INFO",
  "CONTACTED",
  "APPROVED",
  "REJECTED",
] as const;

const FINANCING_STATUS_OPTIONS = [
  "NEW",
  "QUALIFYING",
  "DOCUMENTS_PENDING",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "FUNDED",
] as const;

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{
    dealerCreated?: string | string[];
    dealerError?: string | string[];
  }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const dealerCreated = Array.isArray(params.dealerCreated)
    ? params.dealerCreated[0]
    : params.dealerCreated;
  const dealerError = Array.isArray(params.dealerError)
    ? params.dealerError[0]
    : params.dealerError;

  const [applications, dealers, activeUsers, dealerList] = await Promise.all([
    prisma.application.findMany({
      where: {deletedAt: null},
      orderBy: {createdAt: "desc"},
      take: 200,
      include: {
        dealer: true,
        financingCase: true,
      },
    }),
    prisma.dealer.count({
      where: {status: "ACTIVE"},
    }),
    prisma.adminUser.count({
      where: {isActive: true},
    }),
    prisma.dealer.findMany({
      orderBy: {createdAt: "desc"},
      include: {
        memberships: {
          where: {isActive: true},
          include: {user: true},
        },
      },
      take: 50,
    }),
  ]);

  const leadsNew = applications.filter((item) => item.status === "NEW").length;
  const financingOpen = applications.filter(
    (item) =>
      item.financingStatus !== "APPROVED" &&
      item.financingStatus !== "REJECTED" &&
      item.financingStatus !== "FUNDED"
  ).length;

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white/60">YASKRAVA • CRM</div>
            <h1 className="mt-2 text-2xl font-semibold">Central CRM</h1>
            <p className="mt-1 text-sm text-white/60">
              Logged in as {user.email}
            </p>
          </div>

          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="h-10 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard label="Active dealers" value={String(dealers)} />
          <MetricCard label="Active CRM users" value={String(activeUsers)} />
          <MetricCard label="Open financing cases" value={String(financingOpen)} />
          <MetricCard label="New leads" value={String(leadsNew)} />
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Provision dealer</h2>
              <p className="mt-1 text-sm text-white/60">
                Create dealer, subdomain and owner account in one step.
              </p>
            </div>
          </div>

          {dealerCreated ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Dealer created: <span className="font-semibold">{dealerCreated}</span> ·{" "}
              public <span className="text-white/90">{getDealerPublicUrl(dealerCreated)}</span> ·
              CRM <span className="text-white/90">{getDealerCrmUrl(dealerCreated)}</span>
            </div>
          ) : null}

          {dealerError ? (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Could not provision dealer. Check slug/email uniqueness and try again.
            </div>
          ) : null}

          <form action={createDealerProvisionAction} className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Dealer name</span>
              <input
                name="name"
                required
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="Premium Auto Brno"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Subdomain slug</span>
              <input
                name="slug"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="premium-auto-brno"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Legal name</span>
              <input
                name="legalName"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="Premium Auto Brno s.r.o."
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Support email</span>
              <input
                name="supportEmail"
                type="email"
                required
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="info@dealer.cz"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Support phone</span>
              <input
                name="supportPhone"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="+420..."
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Owner email</span>
              <input
                name="ownerEmail"
                type="email"
                required
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="owner@dealer.cz"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Owner first name</span>
              <input
                name="ownerFirstName"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="Jan"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Owner last name</span>
              <input
                name="ownerLastName"
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="Novak"
              />
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">Owner password</span>
              <input
                name="ownerPassword"
                type="text"
                required
                className="h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/25"
                placeholder="Temporary secure password"
              />
            </label>
            <div className="lg:col-span-2 flex justify-end">
              <button
                type="submit"
                className="h-11 rounded-2xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-black hover:brightness-95"
              >
                Provision dealer
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Dealer network</h2>
          <div className="mt-5 divide-y divide-white/10">
            {dealerList.map((dealer) => {
              const owner = dealer.memberships.find((item) => item.role === "DEALER_OWNER")?.user;
              return (
                <div key={dealer.id} className="grid gap-3 py-4 md:grid-cols-[1.2fr_1fr_1fr]">
                  <div>
                    <div className="text-sm font-semibold text-white">{dealer.name}</div>
                    <div className="mt-1 text-xs text-white/50">
                      {dealer.slug} • {dealer.status}
                    </div>
                  </div>
                  <div className="text-xs text-white/65">
                    <div>{getDealerPublicUrl(dealer.slug)}</div>
                    <div className="mt-1">{getDealerCrmUrl(dealer.slug)}</div>
                  </div>
                  <div className="text-xs text-white/65">
                    <div>{owner?.email || "No owner assigned"}</div>
                    <div className="mt-1">{dealer.supportEmail || "No support email"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
          <div className="grid grid-cols-12 gap-0 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-white/70">
            <div className="col-span-12 md:col-span-3">Client</div>
            <div className="col-span-12 md:col-span-2">Dealer</div>
            <div className="col-span-12 md:col-span-2">Lead status</div>
            <div className="col-span-12 md:col-span-2">Financing</div>
            <div className="col-span-12 md:col-span-1">Archived</div>
            <div className="col-span-12 md:col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/10">
            {applications.length ? (
              applications.map((a) => (
                <div key={a.id} className="px-4 py-4">
                  <div className="grid grid-cols-12 items-start gap-4">
                    <div className="col-span-12 md:col-span-3">
                      <div className="text-sm font-semibold text-white">{a.fullName}</div>
                      <div className="mt-1 text-xs text-white/50">
                        {new Date(a.createdAt).toLocaleString()} • {a.locale} •{" "}
                        {a.topic}
                      </div>
                      <div className="mt-1 text-xs text-white/40">
                        {a.sourceDomain}
                        {a.sourcePath ? ` • ${a.sourcePath}` : ""}
                      </div>
                      {a.message ? (
                        <div className="mt-2 line-clamp-3 text-xs leading-5 text-white/60">
                          {a.message}
                        </div>
                      ) : null}
                      <div>{a.phone || "—"}</div>
                      <div className="text-xs text-white/60">{a.email || "—"}</div>
                      <div className="mt-2 text-xs text-white/50">{a.city || ""}</div>
                      {a.calculator ? (
                        <div className="mt-2 text-xs font-semibold text-[var(--color-accent)]">
                          calc attached
                        </div>
                      ) : null}
                    </div>

                    <div className="col-span-12 md:col-span-2">
                      <div className="text-sm font-semibold text-white">{a.dealer.name}</div>
                      <div className="mt-1 text-xs text-white/50">{a.dealer.slug}</div>
                    </div>

                    <div className="col-span-12 md:col-span-2">
                      <form action={setApplicationStatusAction} className="flex gap-2">
                        <input type="hidden" name="id" value={a.id} />
                        <select
                          name="status"
                          defaultValue={a.status}
                          className="h-10 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs font-semibold text-white outline-none focus:border-white/25"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
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
                    </div>

                    <div className="col-span-12 md:col-span-2">
                      <form action={setFinancingStatusAction} className="flex gap-2">
                        <input type="hidden" name="id" value={a.id} />
                        <select
                          name="status"
                          defaultValue={a.financingStatus}
                          className="h-10 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs font-semibold text-white outline-none focus:border-white/25"
                        >
                          {FINANCING_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
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
                    </div>

                    <div className="col-span-12 md:col-span-1">
                      <form action={toggleArchivedAction} className="flex items-center gap-3">
                        <input type="hidden" name="id" value={a.id} />
                        <label className="flex items-center gap-2 text-xs text-white/70">
                          <input
                            type="checkbox"
                            name="archived"
                            defaultChecked={a.archived}
                            className="h-4 w-4 rounded border-white/20 bg-black/40"
                          />
                          Archived
                        </label>
                        <button
                          type="submit"
                          className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                        >
                          Update
                        </button>
                      </form>
                    </div>

                    <div className="col-span-12 md:col-span-2">
                      <div className="flex items-center justify-end gap-2">
                        <form action={deleteApplicationAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            type="submit"
                            className="h-10 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 text-xs font-semibold text-red-200 hover:bg-red-500/15"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <form action={setAdminNoteAction} className="grid gap-2">
                      <input type="hidden" name="id" value={a.id} />
                      <textarea
                        name="adminNote"
                        defaultValue={a.adminNote ?? ""}
                        placeholder="Internal note…"
                        className="min-h-20 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-white/25"
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
              ))
            ) : (
              <div className="px-4 py-10 text-sm text-white/60">
                No applications yet.
              </div>
            )}
          </div>
        </div>
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

