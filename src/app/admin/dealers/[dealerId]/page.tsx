import {
  adminLogoutAction,
  setAdminNoteAction,
  setApplicationStatusAction,
  setFinancingStatusAction,
  toggleArchivedAction,
} from "@/app/admin/actions";
import {requireAdmin} from "@/lib/adminAuth";
import {
  adminCrmUk,
  applicationStatusLabels,
  financingStatusLabels,
  topicLabels,
} from "@/lib/crmCopy";
import {getDealerDailySnapshots, getDealerMetricSummary} from "@/lib/dealerMetrics";
import {prisma} from "@/lib/prisma";
import {getDealerCrmUrl, getDealerPublicUrl} from "@/lib/tenant";
import {notFound} from "next/navigation";
import Link from "next/link";

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

export const dynamic = "force-dynamic";

export default async function AdminDealerDetailPage({
  params,
}: {
  params: Promise<{dealerId: string}>;
}) {
  const t = adminCrmUk;
  const user = await requireAdmin();
  const {dealerId} = await params;

  const dealer = await prisma.dealer.findUnique({
    where: {id: dealerId},
    include: {
      domains: {
        orderBy: [{isPrimary: "desc"}, {hostname: "asc"}],
      },
      memberships: {
        where: {isActive: true},
        include: {user: true},
      },
    },
  });

  if (!dealer) {
    notFound();
  }

  const [metrics, snapshots, applications, auditLogs, vehicles] = await Promise.all([
    getDealerMetricSummary(dealer.id),
    getDealerDailySnapshots(dealer.id, 14),
    prisma.application.findMany({
      where: {
        dealerId: dealer.id,
        deletedAt: null,
      },
      orderBy: {createdAt: "desc"},
      take: 25,
      include: {
        vehicle: true,
      },
    }),
    prisma.auditLog.findMany({
      where: {dealerId: dealer.id},
      orderBy: {createdAt: "desc"},
      take: 20,
      include: {
        actorUser: true,
        application: true,
        vehicle: true,
      },
    }),
    prisma.vehicle.findMany({
      where: {
        dealerId: dealer.id,
        deletedAt: null,
      },
      orderBy: {createdAt: "desc"},
      take: 8,
    }),
  ]);

  const owner = dealer.memberships.find((membership) => membership.role === "DEALER_OWNER")?.user;

  return (
    <div className="overflow-x-hidden px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white/60">{t.eyebrow}</div>
            <h1 className="mt-2 text-2xl font-semibold text-white">{dealer.name}</h1>
            <p className="mt-1 text-sm text-white/60">
              {user.email} • {dealer.slug} • {dealer.status}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin?view=dealers"
              className="inline-flex h-10 items-center rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              До дилерів
            </Link>
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="h-10 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                {t.logout}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard label="Авто" value={String(metrics.vehicleCount)} />
          <MetricCard label="Усього заявок" value={String(metrics.applicationsTotal)} />
          <MetricCard label="Схвалено" value={String(metrics.applicationsApproved)} />
          <MetricCard label="Відхилено" value={String(metrics.applicationsRejected)} />
        </div>

        <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Профіль дилера</h2>
              <p className="mt-1 text-sm text-white/60">
                Публічний сайт, CRM, домени та обліковий запис власника.
              </p>
            </div>
            <div className="text-sm text-white/50">
              {metrics.latestSnapshotDate
                ? `Останній daily snapshot: ${new Date(metrics.latestSnapshotDate).toLocaleDateString()}`
                : "Daily snapshot ще не створено"}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <InfoCard
              title="Публічний сайт"
              lines={[
                getDealerPublicUrl(dealer.slug),
                getDealerCrmUrl(dealer.slug),
                dealer.supportEmail || "Support email не вказано",
                dealer.supportPhone || "Support phone не вказано",
              ]}
            />
            <InfoCard
              title="Власник дилера"
              lines={[
                owner?.email || "Owner не призначений",
                [owner?.firstName, owner?.lastName].filter(Boolean).join(" ") || "Ім'я не вказано",
                dealer.legalName || "Юридична назва не вказана",
                dealer.city || "Місто не вказано",
              ]}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-semibold text-white">Домени дилера</div>
            <div className="mt-3 grid gap-2 text-sm text-white/70">
              {dealer.domains.length ? (
                dealer.domains.map((domain) => (
                  <div key={domain.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="break-all">{domain.hostname}</span>
                    <span className="text-xs text-white/45">
                      {domain.isPrimary ? "primary" : "secondary"} • {domain.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-white/45">Домени ще не додані.</div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Останні заявки</h2>
              <p className="mt-1 text-sm text-white/60">
                Звідси можна відразу позначати рішення по фінансуванню дилера.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {applications.length ? (
              applications.map((application) => (
                <article key={application.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white">{application.fullName}</div>
                      <div className="mt-1 text-xs text-white/50">
                        {new Date(application.createdAt).toLocaleString()} • {topicLabels.uk[application.topic]}
                      </div>
                      <div className="mt-1 text-xs text-white/40">
                        {application.phone || "—"} • {application.email || "—"}
                      </div>
                      {application.vehicle ? (
                        <div className="mt-2 text-xs text-[var(--color-accent)]">
                          Авто: {application.vehicle.title}
                        </div>
                      ) : null}
                      {application.message ? (
                        <div className="mt-3 text-sm leading-6 text-white/70">{application.message}</div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                      <span className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-white/70">
                        {applicationStatusLabels.uk[application.status]}
                      </span>
                      <span className="inline-flex h-8 items-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/12 px-3 text-[var(--color-accent)]">
                        {financingStatusLabels.uk[application.financingStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_1fr_auto]">
                    <form action={setApplicationStatusAction} className="flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="id" value={application.id} />
                      <select
                        name="status"
                        defaultValue={application.status}
                        className="h-10 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs font-semibold text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {applicationStatusLabels.uk[status]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        {t.update}
                      </button>
                    </form>

                    <form action={setFinancingStatusAction} className="flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="id" value={application.id} />
                      <select
                        name="status"
                        defaultValue={application.financingStatus}
                        className="h-10 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs font-semibold text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                      >
                        {FINANCING_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {financingStatusLabels.uk[status]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        {t.update}
                      </button>
                    </form>

                    <form action={toggleArchivedAction} className="flex items-center gap-2 xl:justify-end">
                      <input type="hidden" name="id" value={application.id} />
                      <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white/70">
                        <input
                          type="checkbox"
                          name="archived"
                          defaultChecked={application.archived}
                          className="h-4 w-4 rounded border-white/20 bg-[rgba(50,32,8,0.70)]"
                        />
                        {t.archived}
                      </label>
                      <button
                        type="submit"
                        className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        {t.update}
                      </button>
                    </form>
                  </div>

                  <div className="mt-4">
                    <form action={setAdminNoteAction} className="grid gap-2">
                      <input type="hidden" name="id" value={application.id} />
                      <textarea
                        name="adminNote"
                        defaultValue={application.adminNote ?? ""}
                        placeholder={t.internalNotePlaceholder}
                        className="min-h-20 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
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
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-white/60">
                Заявок ще немає.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
            <h2 className="text-lg font-semibold text-white">Daily snapshots</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm text-white/75">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.14em] text-white/45">
                  <tr>
                    <th className="px-4 py-3 text-left">Дата</th>
                    <th className="px-4 py-3 text-left">Авто</th>
                    <th className="px-4 py-3 text-left">Усього</th>
                    <th className="px-4 py-3 text-left">Схвалено</th>
                    <th className="px-4 py-3 text-left">Відхилено</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {snapshots.length ? (
                    snapshots.map((snapshot) => (
                      <tr key={snapshot.id}>
                        <td className="px-4 py-3">{new Date(snapshot.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{snapshot.vehicleCount}</td>
                        <td className="px-4 py-3">{snapshot.applicationsTotal}</td>
                        <td className="px-4 py-3">{snapshot.applicationsApproved}</td>
                        <td className="px-4 py-3">{snapshot.applicationsRejected}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-white/45">
                        Daily snapshots ще не згенеровані.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-8">
            <section className="rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
              <h2 className="text-lg font-semibold text-white">Останні авто</h2>
              <div className="mt-5 grid gap-3">
                {vehicles.length ? (
                  vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-sm font-semibold text-white">{vehicle.title}</div>
                      <div className="mt-1 text-xs text-white/45">
                        {vehicle.availability} • {vehicle.published ? "published" : "hidden"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                    Авто ще не додані.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
              <h2 className="text-lg font-semibold text-white">Останні дії</h2>
              <div className="mt-5 grid gap-3">
                {auditLogs.length ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-sm text-white">{log.message || log.action}</div>
                      <div className="mt-1 text-xs text-white/45">
                        {new Date(log.createdAt).toLocaleString()} • {log.actorUser?.email || "system"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                    Історія дій ще порожня.
                  </div>
                )}
              </div>
            </section>
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

function InfoCard({title, lines}: {title: string; lines: string[]}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-3 grid gap-2 text-sm text-white/70">
        {lines.map((line) => (
          <div key={`${title}-${line}`} className="break-all">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
