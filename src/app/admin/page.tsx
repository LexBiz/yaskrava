import {
  adminLogoutAction,
  createPlatformVehicleAction,
  createDealerProvisionAction,
  deleteApplicationAction,
  setPartnerLeadNoteAction,
  setPartnerLeadStatusAction,
  setAdminNoteAction,
  setApplicationStatusAction,
  setFinancingStatusAction,
  toggleArchivedAction,
  createCareerVacancyAction,
  updateCareerVacancyAction,
  archiveCareerVacancyAction,
  updatePlatformVehicleAction,
  markPlatformVehicleSoldAction,
  deletePlatformVehicleAction,
} from "@/app/admin/actions";
import {requireAdmin} from "@/lib/adminAuth";
import {
  adminCrmUk,
  applicationStatusLabels,
  financingStatusLabels,
  partnerStatusLabels,
  topicLabels,
} from "@/lib/crmCopy";
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

const PARTNER_STATUS_OPTIONS = [
  "NEW",
  "IN_REVIEW",
  "CONTACTED",
  "APPROVED",
  "REJECTED",
] as const;

const ADMIN_VIEWS = ["financing", "vacancies", "vehicles", "dealers"] as const;
type AdminView = (typeof ADMIN_VIEWS)[number];
const FINANCING_PERIODS = ["today", "7d", "30d", "all"] as const;
type FinancingPeriod = (typeof FINANCING_PERIODS)[number];
const FINANCING_SORTS = ["newest", "oldest", "dealer", "status"] as const;
type FinancingSort = (typeof FINANCING_SORTS)[number];
const VEHICLE_FILTERS = ["all", "on_site", "in_transit", "sold"] as const;
type VehicleFilter = (typeof VEHICLE_FILTERS)[number];
const CRM_PAGE_SIZE = 12;

function normalizeAdminView(value: string | undefined): AdminView {
  if (value === "partners") return "dealers";
  return (ADMIN_VIEWS as readonly string[]).includes(value || "") ? (value as AdminView) : "financing";
}

function splitContactName(contactName: string | null | undefined) {
  const parts = String(contactName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function normalizeFinancingPeriod(value: string | undefined): FinancingPeriod {
  return (FINANCING_PERIODS as readonly string[]).includes(value || "")
    ? (value as FinancingPeriod)
    : "7d";
}

function normalizeFinancingSort(value: string | undefined): FinancingSort {
  return (FINANCING_SORTS as readonly string[]).includes(value || "")
    ? (value as FinancingSort)
    : "newest";
}

function normalizeVehicleFilter(value: string | undefined): VehicleFilter {
  return (VEHICLE_FILTERS as readonly string[]).includes(value || "")
    ? (value as VehicleFilter)
    : "all";
}

function normalizePage(value: string | undefined) {
  const page = Number(value || "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{
    dealerCreated?: string | string[];
    dealerError?: string | string[];
    ownerEmail?: string | string[];
    ownerPassword?: string | string[];
    view?: string | string[];
    period?: string | string[];
    sort?: string | string[];
    archived?: string | string[];
    vehicleStatus?: string | string[];
    financingPage?: string | string[];
    dealerLeadPage?: string | string[];
    dealerPage?: string | string[];
    vehiclePage?: string | string[];
  }>;
}) {
  const t = adminCrmUk;
  const user = await requireAdmin();
  const params = await searchParams;
  const dealerCreated = Array.isArray(params.dealerCreated)
    ? params.dealerCreated[0]
    : params.dealerCreated;
  const dealerError = Array.isArray(params.dealerError)
    ? params.dealerError[0]
    : params.dealerError;
  const ownerEmail = Array.isArray(params.ownerEmail) ? params.ownerEmail[0] : params.ownerEmail;
  const ownerPassword = Array.isArray(params.ownerPassword) ? params.ownerPassword[0] : params.ownerPassword;
  const activeView = normalizeAdminView(Array.isArray(params.view) ? params.view[0] : params.view);
  const financingPeriod = normalizeFinancingPeriod(Array.isArray(params.period) ? params.period[0] : params.period);
  const financingSort = normalizeFinancingSort(Array.isArray(params.sort) ? params.sort[0] : params.sort);
  const showArchivedApplications = (Array.isArray(params.archived) ? params.archived[0] : params.archived) === "1";
  const vehicleStatusFilter = normalizeVehicleFilter(Array.isArray(params.vehicleStatus) ? params.vehicleStatus[0] : params.vehicleStatus);
  const financingPage = normalizePage(Array.isArray(params.financingPage) ? params.financingPage[0] : params.financingPage);
  const dealerLeadPage = normalizePage(Array.isArray(params.dealerLeadPage) ? params.dealerLeadPage[0] : params.dealerLeadPage);
  const dealerPage = normalizePage(Array.isArray(params.dealerPage) ? params.dealerPage[0] : params.dealerPage);
  const vehiclePage = normalizePage(Array.isArray(params.vehiclePage) ? params.vehiclePage[0] : params.vehiclePage);

  const platformDealerSlug = process.env.DEFAULT_DEALER_SLUG || "yaskrava";
  const [
    applications,
    partnerLeads,
    dealers,
    activeUsers,
    dealerList,
    platformDealer,
    appsByDealer,
    financingByDealer,
  ] = await Promise.all([
    prisma.application.findMany({
      where: {deletedAt: null},
      orderBy: {createdAt: "desc"},
      take: 200,
      include: {
        dealer: true,
        financingCase: true,
      },
    }),
    prisma.partnerLead.findMany({
      where: {deletedAt: null},
      orderBy: {createdAt: "desc"},
      take: 100,
      include: {
        convertedDealer: true,
      },
    }),
    prisma.dealer.count({
      where: {
        status: "ACTIVE",
        slug: {not: platformDealerSlug},
      },
    }),
    prisma.adminUser.count({
      where: {
        isActive: true,
        platformRole: {not: null},
      },
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
    prisma.dealer.findUnique({
      where: {slug: platformDealerSlug},
      select: {id: true, name: true, slug: true},
    }),
    prisma.application.groupBy({
      by: ["dealerId"],
      where: {deletedAt: null},
      _count: {_all: true},
    }),
    prisma.application.groupBy({
      by: ["dealerId", "financingStatus"],
      where: {
        deletedAt: null,
        financingStatus: {in: ["APPROVED", "FUNDED", "REJECTED"]},
      },
      _count: {_all: true},
    }),
  ]);

  const [vacancies, yaskravaVehicles] = platformDealer
    ? await Promise.all([
        prisma.vacancy.findMany({
          where: {
            dealerId: platformDealer.id,
            deletedAt: null,
          },
          orderBy: {createdAt: "desc"},
          take: 100,
        }),
        prisma.vehicle.findMany({
          where: {
            dealerId: platformDealer.id,
            deletedAt: null,
          },
          orderBy: {createdAt: "desc"},
          take: 100,
        }),
      ])
    : [[], []];

  const dealerMetrics = new Map<string, {total: number; approved: number; rejected: number}>();
  for (const row of appsByDealer) {
    dealerMetrics.set(row.dealerId, {
      total: row._count._all,
      approved: 0,
      rejected: 0,
    });
  }
  for (const row of financingByDealer) {
    const current = dealerMetrics.get(row.dealerId) || {total: 0, approved: 0, rejected: 0};
    if (row.financingStatus === "APPROVED" || row.financingStatus === "FUNDED") {
      current.approved += row._count._all;
    }
    if (row.financingStatus === "REJECTED") {
      current.rejected += row._count._all;
    }
    dealerMetrics.set(row.dealerId, current);
  }

  const leadsNew = applications.filter((item) => item.status === "NEW").length;
  const partnerNew = partnerLeads.filter((item) => item.status === "NEW").length;
  const financingOpen = applications.filter(
    (item) =>
      item.financingStatus !== "APPROVED" &&
      item.financingStatus !== "REJECTED" &&
      item.financingStatus !== "FUNDED"
  ).length;
  const pendingPartnerLeads = partnerLeads.filter(
    (lead) => !lead.convertedDealerId && !lead.archived
  );
  const sortedYaskravaVehicles = [...yaskravaVehicles].sort((a, b) => {
    const aWeight = a.availability === "SOLD" ? 1 : 0;
    const bWeight = b.availability === "SOLD" ? 1 : 0;
    return aWeight - bWeight;
  });
  const filteredYaskravaVehicles = sortedYaskravaVehicles.filter((vehicle) => {
    if (vehicleStatusFilter === "on_site") return vehicle.availability === "ON_SITE";
    if (vehicleStatusFilter === "in_transit") return vehicle.availability === "IN_TRANSIT";
    if (vehicleStatusFilter === "sold") return vehicle.availability === "SOLD";
    return true;
  });
  // eslint-disable-next-line react-hooks/purity -- server-side filter reference time is intentional here
  const now = Date.now();
  const periodMs =
    financingPeriod === "today"
      ? 1000 * 60 * 60 * 24
      : financingPeriod === "7d"
        ? 1000 * 60 * 60 * 24 * 7
        : financingPeriod === "30d"
          ? 1000 * 60 * 60 * 24 * 30
          : null;
  const financingApplications = [...applications]
    .filter((item) => (showArchivedApplications ? true : !item.archived))
    .filter((item) => (periodMs ? now - new Date(item.createdAt).getTime() <= periodMs : true))
    .sort((a, b) => {
      if (financingSort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (financingSort === "dealer") {
        return a.dealer.name.localeCompare(b.dealer.name);
      }
      if (financingSort === "status") {
        return a.financingStatus.localeCompare(b.financingStatus) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const pagedPartnerLeads = pendingPartnerLeads.slice((dealerLeadPage - 1) * CRM_PAGE_SIZE, dealerLeadPage * CRM_PAGE_SIZE);
  const partnerLeadPages = Math.max(1, Math.ceil(pendingPartnerLeads.length / CRM_PAGE_SIZE));
  const pagedDealers = dealerList.slice((dealerPage - 1) * CRM_PAGE_SIZE, dealerPage * CRM_PAGE_SIZE);
  const dealerPages = Math.max(1, Math.ceil(dealerList.length / CRM_PAGE_SIZE));
  const pagedVehicles = filteredYaskravaVehicles.slice((vehiclePage - 1) * CRM_PAGE_SIZE, vehiclePage * CRM_PAGE_SIZE);
  const vehiclePages = Math.max(1, Math.ceil(filteredYaskravaVehicles.length / CRM_PAGE_SIZE));
  const pagedFinancingApplications = financingApplications.slice((financingPage - 1) * CRM_PAGE_SIZE, financingPage * CRM_PAGE_SIZE);
  const financingPages = Math.max(1, Math.ceil(financingApplications.length / CRM_PAGE_SIZE));

  return (
    <div className="overflow-x-hidden px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white/60">{t.eyebrow}</div>
            <h1 className="mt-2 text-2xl font-semibold">{t.title}</h1>
            <p className="mt-1 text-sm text-white/60">
              {t.loggedInAs} {user.email}
            </p>
          </div>

          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="h-10 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              {t.logout}
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <MetricCard label={t.activeDealers} value={String(dealers)} />
          <MetricCard label={t.activeUsers} value={String(activeUsers)} />
          <MetricCard label={t.openFinancing} value={String(financingOpen)} />
          <MetricCard label={t.newLeads} value={String(leadsNew)} />
          <MetricCard label={t.newPartnerLeads} value={String(partnerNew)} />
        </div>

        <nav className="sticky top-4 z-20 mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] bg-[rgba(26,23,24,0.88)] p-3 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {[
              {key: "financing", label: t.menuFinancing},
              {key: "vacancies", label: t.menuVacancies},
              {key: "vehicles", label: t.menuVehicles},
              {key: "dealers", label: t.menuDealers},
            ].map((item) => (
              <a
                key={item.key}
                href={`/admin?view=${item.key}`}
                className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                  activeView === item.key
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
        {activeView === "dealers" ? (
          <>
            <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">{t.dealerPipeline}</h2>
                <p className="mt-1 text-sm text-white/60">{t.dealerPipelineText}</p>
              </div>

              {dealerCreated ? (
                <div className="mt-4 break-all rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  {t.dealerCreated}: <span className="font-semibold">{dealerCreated}</span> · сайт{" "}
                  <span className="text-white/90">{getDealerPublicUrl(dealerCreated)}</span> · CRM{" "}
                  <span className="text-white/90">{getDealerCrmUrl(dealerCreated)}</span>
                  {ownerEmail ? <> · login <span className="text-white/90">{ownerEmail}</span></> : null}
                  {ownerPassword ? <> · password <span className="text-white/90">{ownerPassword}</span></> : null}
                </div>
              ) : null}

              {dealerError ? (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {t.dealerError}
                </div>
              ) : null}

              <div className="mt-6">
                <h3 className="text-base font-semibold text-white">{t.incomingDealerLeads}</h3>
                <p className="mt-1 text-sm text-white/55">{t.incomingDealerLeadsText}</p>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {pendingPartnerLeads.length ? (
                  pagedPartnerLeads.map((lead) => {
                    const nameParts = splitContactName(lead.contactName);
                    return (
                      <article key={lead.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-base font-semibold text-white">{lead.companyName}</div>
                            <div className="mt-1 text-xs text-white/50">
                              {lead.contactName} • {new Date(lead.createdAt).toLocaleString()}
                            </div>
                            <div className="mt-1 text-xs text-white/40">
                              {lead.email} {lead.phone ? `• ${lead.phone}` : ""}
                            </div>
                            <div className="mt-1 text-xs text-white/40">
                              {lead.city || "—"} {lead.fleetSize ? `• ${t.fleetLabel}: ${lead.fleetSize}` : ""}
                            </div>
                            {lead.message ? (
                              <div className="mt-3 text-sm leading-6 text-white/65">{lead.message}</div>
                            ) : null}
                          </div>
                          <span className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-[11px] font-bold text-white/70">
                            {partnerStatusLabels.uk[lead.status]}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                          <div className="grid gap-3">
                            <form action={setPartnerLeadStatusAction} className="flex flex-col gap-2 sm:flex-row">
                              <input type="hidden" name="id" value={lead.id} />
                              <select
                                name="status"
                                defaultValue={lead.status}
                                className="h-10 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs font-semibold text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                              >
                                {PARTNER_STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {partnerStatusLabels.uk[s]}
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

                            <form action={setPartnerLeadNoteAction} className="grid gap-2">
                              <input type="hidden" name="id" value={lead.id} />
                              <textarea
                                name="adminNote"
                                defaultValue={lead.adminNote ?? ""}
                                placeholder={t.partnerNotePlaceholder}
                                className="min-h-24 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
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

                          <details className="rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.22)] p-4">
                            <summary className="cursor-pointer list-none text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                              {t.connectDealerFromLead}
                            </summary>
                            <form action={createDealerProvisionAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                              <input type="hidden" name="partnerLeadId" value={lead.id} />
                              <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-white/70">{t.dealerName}</span>
                                <input
                                  name="name"
                                  required
                                  defaultValue={lead.companyName}
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                />
                              </label>
                              <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-white/70">{t.subdomainSlug}</span>
                                <input
                                  name="slug"
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                  placeholder="dealer-slug"
                                />
                              </label>
                              <label className="grid gap-1.5 sm:col-span-2">
                                <span className="text-xs font-semibold text-white/70">{t.legalName}</span>
                                <input
                                  name="legalName"
                                  defaultValue={lead.companyName}
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                />
                              </label>
                              <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-white/70">{t.supportEmail}</span>
                                <input
                                  name="supportEmail"
                                  type="email"
                                  required
                                  defaultValue={lead.email}
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                />
                              </label>
                              <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-white/70">{t.supportPhone}</span>
                                <input
                                  name="supportPhone"
                                  defaultValue={lead.phone ?? ""}
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                />
                              </label>
                              <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-white/70">{t.ownerEmail}</span>
                                <input
                                  name="ownerEmail"
                                  type="email"
                                  required
                                  defaultValue={lead.email}
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                />
                              </label>
                              <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-white/70">{t.ownerFirstName}</span>
                                <input
                                  name="ownerFirstName"
                                  defaultValue={nameParts.firstName}
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                />
                              </label>
                              <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-white/70">{t.ownerLastName}</span>
                                <input
                                  name="ownerLastName"
                                  defaultValue={nameParts.lastName}
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                />
                              </label>
                              <label className="grid gap-1.5 sm:col-span-2">
                                <span className="text-xs font-semibold text-white/70">{t.ownerPassword}</span>
                                <input
                                  name="ownerPassword"
                                  type="text"
                                  required
                                  className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                                  placeholder="Тимчасовий безпечний пароль"
                                />
                              </label>
                              <div className="sm:col-span-2 flex justify-end">
                                <button
                                  type="submit"
                                  className="h-10 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-black hover:brightness-95"
                                >
                                  {t.provisionButton}
                                </button>
                              </div>
                            </form>
                          </details>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60 xl:col-span-2">
                    {t.noIncomingDealerLeads}
                  </div>
                )}
              </div>
              {partnerLeadPages > 1 ? (
                <PaginationRow
                  currentPage={dealerLeadPage}
                  totalPages={partnerLeadPages}
                  hrefForPage={(page) => `/admin?view=dealers&dealerLeadPage=${page}&dealerPage=${dealerPage}`}
                />
              ) : null}
            </section>

            <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">{t.manualProvisionTitle}</h2>
                <p className="mt-1 text-sm text-white/60">{t.manualProvisionText}</p>
              </div>
              <form action={createDealerProvisionAction} className="mt-5 grid gap-4 lg:grid-cols-2 [&_input]:min-w-0 [&_input]:w-full [&_select]:min-w-0 [&_select]:w-full [&_textarea]:min-w-0 [&_textarea]:w-full">
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-white/70">{t.dealerName}</span>
                  <input
                    name="name"
                    required
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="Premium Auto Brno"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-white/70">{t.subdomainSlug}</span>
                  <input
                    name="slug"
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="premium-auto-brno"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-white/70">{t.legalName}</span>
                  <input
                    name="legalName"
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="Premium Auto Brno s.r.o."
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-white/70">{t.supportEmail}</span>
                  <input
                    name="supportEmail"
                    type="email"
                    required
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="info@dealer.cz"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-white/70">{t.supportPhone}</span>
                  <input
                    name="supportPhone"
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="+420..."
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-white/70">{t.ownerEmail}</span>
                  <input
                    name="ownerEmail"
                    type="email"
                    required
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="owner@dealer.cz"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-white/70">{t.ownerFirstName}</span>
                  <input
                    name="ownerFirstName"
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="Jan"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-white/70">{t.ownerLastName}</span>
                  <input
                    name="ownerLastName"
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="Novak"
                  />
                </label>
                <label className="grid gap-1.5 lg:col-span-2">
                  <span className="text-xs font-semibold text-white/70">{t.ownerPassword}</span>
                  <input
                    name="ownerPassword"
                    type="text"
                    required
                    className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                    placeholder="Тимчасовий безпечний пароль"
                  />
                </label>
                <div className="lg:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="h-11 rounded-2xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-black hover:brightness-95"
                  >
                    {t.provisionButton}
                  </button>
                </div>
              </form>
            </section>

            <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
              <h2 className="text-lg font-semibold text-white">{t.dealerNetwork}</h2>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {pagedDealers.map((dealer) => {
                  const owner = dealer.memberships.find((item) => item.role === "DEALER_OWNER")?.user;
                  const kpi = dealerMetrics.get(dealer.id) || {total: 0, approved: 0, rejected: 0};
                  return (
                    <article key={dealer.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-white">{dealer.name}</div>
                          <div className="mt-1 text-xs text-white/50">
                            {dealer.slug} • {dealer.status}
                          </div>
                        </div>
                        <span className="inline-flex h-8 items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 text-[11px] font-bold text-emerald-200">
                          {t.convertedDealer}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 text-xs text-white/65 sm:grid-cols-2">
                        <div className="min-w-0">
                          <div className="break-all">{getDealerPublicUrl(dealer.slug)}</div>
                          <div className="mt-1 break-all">{getDealerCrmUrl(dealer.slug)}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="break-all">{owner?.email || t.noOwner}</div>
                          <div className="mt-1">{dealer.supportEmail || t.noSupportEmail}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/75">
                        <span>{t.dealerLeads}: {kpi.total}</span>
                        <span className="text-emerald-300">{t.dealerApproved}: {kpi.approved}</span>
                        <span className="text-red-300">{t.dealerRejected}: {kpi.rejected}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
              {dealerPages > 1 ? (
                <PaginationRow
                  currentPage={dealerPage}
                  totalPages={dealerPages}
                  hrefForPage={(page) => `/admin?view=dealers&dealerLeadPage=${dealerLeadPage}&dealerPage=${page}`}
                />
              ) : null}
            </section>
          </>
        ) : null}

        {activeView === "vehicles" ? (
        <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
          <h2 className="text-lg font-semibold text-white">{t.uploadVehicle}</h2>
          <p className="mt-1 text-sm text-white/60">
            {t.uploadVehicleText}
          </p>
          <p className="mt-1 text-xs text-white/45">
            {t.platformDealerLabel}: {platformDealer?.name || platformDealerSlug}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              {key: "all", label: "Усі"},
              {key: "on_site", label: t.availabilityOnSite},
              {key: "in_transit", label: t.availabilityTransit},
              {key: "sold", label: t.availabilitySold},
            ].map((item) => (
              <a
                key={item.key}
                href={`/admin?view=vehicles&vehicleStatus=${item.key}`}
                className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold ${
                  vehicleStatusFilter === item.key
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <details className="mt-5 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-white/[0.03] p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
              {t.uploadVehicleButton}
            </summary>
            <form action={createPlatformVehicleAction} className="mt-4 grid gap-4 lg:grid-cols-2 [&_input]:min-w-0 [&_input]:w-full [&_select]:min-w-0 [&_select]:w-full [&_textarea]:min-w-0 [&_textarea]:w-full">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.titleField}</span>
              <input
                name="title"
                required
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="BMW 320d Touring • 2021"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.stockNumber}</span>
              <input
                name="stockNumber"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.availability}</span>
              <select
                name="availability"
                defaultValue="ON_SITE"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
              >
                <option value="ON_SITE">{t.availabilityOnSite}</option>
                <option value="IN_TRANSIT">{t.availabilityTransit}</option>
                <option value="SOLD">{t.availabilitySold}</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.priceCzk}</span>
              <input
                name="priceCzk"
                type="number"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
              />
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
              <span className="text-xs font-semibold text-white/70">{t.imageUrl}</span>
              <input
                name="imageUrl"
                className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                placeholder="https://..."
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
              />
            </label>
            <div className="lg:col-span-2 flex justify-end">
              <button
                type="submit"
                className="h-11 rounded-2xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-black hover:brightness-95"
              >
                {t.uploadVehicleButton}
              </button>
            </div>
            </form>
          </details>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {filteredYaskravaVehicles.length ? (
              pagedVehicles.map((vehicle) => (
                <article
                  key={vehicle.id}
                  className={`rounded-[26px] border p-4 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.55)] ${
                    vehicle.availability === "SOLD"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <VehicleStatusPill
                      label={
                        vehicle.availability === "SOLD"
                          ? t.availabilitySold
                          : vehicle.availability === "IN_TRANSIT"
                            ? t.availabilityTransit
                            : t.availabilityOnSite
                      }
                      tone={vehicle.availability}
                    />
                    <div className="text-right text-[11px] text-white/45">
                      {vehicle.published ? t.publishedLabel : t.hiddenLabel}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4">
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      {vehicle.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vehicle.imageUrl} alt={vehicle.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-white/35">{t.noImage}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-base font-black leading-tight text-white">{vehicle.title}</div>
                      <div className="mt-2 text-sm font-semibold text-[var(--color-accent)]">
                        {vehicle.priceCzk ? `${vehicle.priceCzk.toLocaleString()} CZK` : t.priceOnRequest}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/55">
                        {vehicle.make ? <span>{vehicle.make}</span> : null}
                        {vehicle.model ? <span>{vehicle.model}</span> : null}
                        {vehicle.year ? <span>{vehicle.year}</span> : null}
                        {vehicle.videoUrl ? <span>{t.videoAttached}</span> : <span>{t.noVideo}</span>}
                      </div>
                    </div>
                  </div>

                  {vehicle.description ? (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/65">
                      {vehicle.description}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {vehicle.availability !== "SOLD" ? (
                      <form action={markPlatformVehicleSoldAction}>
                        <input type="hidden" name="id" value={vehicle.id} />
                        <button type="submit" className="h-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/15">
                          {t.markSold}
                        </button>
                      </form>
                    ) : (
                      <div className="inline-flex h-10 items-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 text-xs font-semibold text-emerald-200">
                        {t.availabilitySold}
                      </div>
                    )}
                    <details className="group flex-1 min-w-[180px]">
                      <summary className="flex h-10 cursor-pointer list-none items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10 [&::-webkit-details-marker]:hidden">
                        Виправити
                      </summary>
                      <form action={updatePlatformVehicleAction} className="mt-3 grid gap-2 sm:grid-cols-2">
                        <input type="hidden" name="id" value={vehicle.id} />
                        <input
                          name="title"
                          defaultValue={vehicle.title}
                          className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)] sm:col-span-2"
                        />
                        <input
                          name="priceCzk"
                          type="number"
                          defaultValue={vehicle.priceCzk ?? undefined}
                          placeholder="0"
                          className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                        />
                        <select
                          name="availability"
                          defaultValue={vehicle.availability}
                          className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs font-semibold text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                        >
                          <option value="ON_SITE">{t.availabilityOnSite}</option>
                          <option value="IN_TRANSIT">{t.availabilityTransit}</option>
                          <option value="SOLD">{t.availabilitySold}</option>
                        </select>
                        <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white/70">
                          <input type="checkbox" name="published" defaultChecked={vehicle.published} className="h-4 w-4 rounded border-white/20 bg-[rgba(50,32,8,0.70)]" />
                          {t.publishedLabel}
                        </label>
                        <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white/70">
                          <input type="checkbox" name="featured" defaultChecked={vehicle.featured} className="h-4 w-4 rounded border-white/20 bg-[rgba(50,32,8,0.70)]" />
                          {t.featuredLabel}
                        </label>
                        <input
                          name="imageUrl"
                          defaultValue={vehicle.imageUrl ?? ""}
                          placeholder="https://image"
                          className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)] sm:col-span-2"
                        />
                        <input
                          name="videoUrl"
                          defaultValue={vehicle.videoUrl ?? ""}
                          placeholder="https://video"
                          className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)] sm:col-span-2"
                        />
                        <input
                          name="imageFile"
                          type="file"
                          accept="image/*"
                          className="rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 py-2 text-xs text-white file:mr-3 file:rounded-xl file:border-0 file:bg-[var(--color-accent)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black sm:col-span-2"
                        />
                        <input
                          name="videoFile"
                          type="file"
                          accept="video/*"
                          className="rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 py-2 text-xs text-white file:mr-3 file:rounded-xl file:border-0 file:bg-[var(--color-accent)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black sm:col-span-2"
                        />
                        <textarea
                          name="description"
                          defaultValue={vehicle.description ?? ""}
                          placeholder={t.description}
                          className="min-h-24 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 py-3 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)] sm:col-span-2"
                        />
                        <div className="sm:col-span-2 flex justify-end">
                          <button type="submit" className="h-10 rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10">
                            Виправити
                          </button>
                        </div>
                      </form>
                    </details>
                    <form action={deletePlatformVehicleAction}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <button type="submit" className="h-10 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 text-xs font-semibold text-red-200 transition hover:bg-red-500/15">
                        {t.delete}
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-4 text-sm text-white/60 xl:col-span-3">{t.noPlatformVehicles}</div>
            )}
          </div>
          {vehiclePages > 1 ? (
            <PaginationRow
              currentPage={vehiclePage}
              totalPages={vehiclePages}
              hrefForPage={(page) => `/admin?view=vehicles&vehicleStatus=${vehicleStatusFilter}&vehiclePage=${page}`}
            />
          ) : null}
        </section>
        ) : null}

        {activeView === "vacancies" ? (
        <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
          <h2 className="text-lg font-semibold text-white">{t.vacanciesHeading}</h2>
          <p className="mt-1 text-sm text-white/60">{t.vacanciesText}</p>

          <form action={createCareerVacancyAction} className="mt-5 grid gap-4 lg:grid-cols-2 [&_input]:min-w-0 [&_input]:w-full [&_select]:min-w-0 [&_select]:w-full [&_textarea]:min-w-0 [&_textarea]:w-full">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.vacancyTitle}</span>
              <input name="title" required className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.vacancyCity}</span>
              <input name="city" className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.vacancyType}</span>
              <input name="employmentType" className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.supportEmail}</span>
              <input name="contactEmail" type="email" className="h-11 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white/75">
              <input type="checkbox" name="published" defaultChecked className="h-4 w-4 rounded border-white/20 bg-black/20" />
              {t.publishedLabel}
            </label>
            <label className="grid gap-1.5 lg:col-span-2">
              <span className="text-xs font-semibold text-white/70">{t.description}</span>
              <textarea name="description" className="min-h-24 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
            </label>
            <div className="lg:col-span-2 flex justify-end">
              <button type="submit" className="h-11 rounded-2xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-black hover:brightness-95">
                {t.createVacancyButton}
              </button>
            </div>
          </form>

          <div className="mt-5 divide-y divide-white/10">
            {vacancies.length ? (
              vacancies.map((vacancy) => (
                <div key={vacancy.id} className="py-4">
                  <form action={updateCareerVacancyAction} className="grid gap-3 lg:grid-cols-2">
                    <input type="hidden" name="id" value={vacancy.id} />
                    <input name="title" defaultValue={vacancy.title} className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
                    <input name="city" defaultValue={vacancy.city ?? ""} className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
                    <input name="employmentType" defaultValue={vacancy.employmentType ?? ""} className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
                    <input name="contactEmail" defaultValue={vacancy.contactEmail ?? ""} className="h-10 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)]" />
                    <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-2 text-xs text-white/75">
                      <input type="checkbox" name="published" defaultChecked={vacancy.published} className="h-4 w-4 rounded border-white/20 bg-black/20" />
                      {t.publishedLabel}
                    </label>
                    <textarea name="description" defaultValue={vacancy.description ?? ""} className="min-h-20 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-xs text-white outline-none focus:border-[rgba(255,180,80,0.28)] lg:col-span-2" />
                    <div className="lg:col-span-2 flex justify-end gap-2">
                      <button type="submit" className="h-10 rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10">
                        {t.save}
                      </button>
                    </div>
                  </form>
                  <form action={archiveCareerVacancyAction} className="mt-2 flex justify-end">
                    <input type="hidden" name="id" value={vacancy.id} />
                    <button type="submit" className="h-9 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 text-xs font-semibold text-red-200 hover:bg-red-500/15">
                      {t.archiveVacancy}
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="py-4 text-sm text-white/60">{t.noVacancies}</div>
            )}
          </div>
        </section>
        ) : null}

        {activeView === "financing" ? (
          <section className="mt-8 rounded-3xl border border-[rgba(255,180,80,0.14)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{t.menuFinancing}</h2>
                <p className="mt-1 text-sm text-white/60">
                  Структурований список заявок з фільтрами по періоду, статусу та архіву.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  {key: "today", label: "Сьогодні"},
                  {key: "7d", label: "7 днів"},
                  {key: "30d", label: "30 днів"},
                  {key: "all", label: "Весь час"},
                ].map((item) => (
                  <a
                    key={item.key}
                    href={`/admin?view=financing&period=${item.key}&sort=${financingSort}${showArchivedApplications ? "&archived=1" : ""}`}
                    className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold ${
                      financingPeriod === item.key
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                {key: "newest", label: "Нові зверху"},
                {key: "oldest", label: "Старі зверху"},
                {key: "dealer", label: "По дилеру"},
                {key: "status", label: "По статусу"},
              ].map((item) => (
                <a
                  key={item.key}
                  href={`/admin?view=financing&period=${financingPeriod}&sort=${item.key}${showArchivedApplications ? "&archived=1" : ""}`}
                  className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold ${
                    financingSort === item.key
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`/admin?view=financing&period=${financingPeriod}&sort=${financingSort}${showArchivedApplications ? "" : "&archived=1"}`}
                className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold ${
                  showArchivedApplications
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {showArchivedApplications ? "Архів увімкнено" : "Показати архів"}
              </a>
            </div>

            <div className="mt-6 grid gap-4">
              {financingApplications.length ? (
                pagedFinancingApplications.map((a) => (
                  <article key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-white">{a.fullName}</div>
                        <div className="mt-1 text-xs text-white/50">
                          {new Date(a.createdAt).toLocaleString()} • {a.locale} • {topicLabels.uk[a.topic]}
                        </div>
                        <div className="mt-1 break-all text-xs text-white/40">
                          {a.sourceDomain}
                          {a.sourcePath ? ` • ${a.sourcePath}` : ""}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-white/70">
                          {a.dealer.name}
                        </span>
                        <span className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-white/70">
                          {applicationStatusLabels.uk[a.status]}
                        </span>
                        <span className="inline-flex h-8 items-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/12 px-3 text-[var(--color-accent)]">
                          {financingStatusLabels.uk[a.financingStatus]}
                        </span>
                        {a.archived ? (
                          <span className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-white/70">
                            {t.archived}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-3">
                      <div>
                        <div>{a.phone || "—"}</div>
                        <div className="mt-1 break-all">{a.email || "—"}</div>
                        <div className="mt-1">{a.city || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.14em] text-white/40">{t.dealerColumn}</div>
                        <div className="mt-1 text-sm text-white">{a.dealer.name}</div>
                        <div className="mt-1 text-xs text-white/50">{a.dealer.slug}</div>
                      </div>
                      <div>
                        {a.calculator ? (
                          <div className="text-xs font-semibold text-[var(--color-accent)]">{t.calcAttached}</div>
                        ) : (
                          <div className="text-xs text-white/40">Без розрахунку</div>
                        )}
                        {a.message ? (
                          <div className="mt-2 line-clamp-4 text-sm leading-6 text-white/65">{a.message}</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_1fr_auto]">
                      <form action={setApplicationStatusAction} className="flex flex-col gap-2 sm:flex-row">
                        <input type="hidden" name="id" value={a.id} />
                        <select
                          name="status"
                          defaultValue={a.status}
                          className="h-10 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs font-semibold text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {applicationStatusLabels.uk[s]}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10">
                          {t.update}
                        </button>
                      </form>

                      <form action={setFinancingStatusAction} className="flex flex-col gap-2 sm:flex-row">
                        <input type="hidden" name="id" value={a.id} />
                        <select
                          name="status"
                          defaultValue={a.financingStatus}
                          className="h-10 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs font-semibold text-white outline-none focus:border-[rgba(255,180,80,0.28)]"
                        >
                          {FINANCING_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {financingStatusLabels.uk[s]}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10">
                          {t.update}
                        </button>
                      </form>

                      <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                        <form action={toggleArchivedAction} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={a.id} />
                          <label className="flex items-center gap-2 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-3 text-xs text-white/70">
                            <input
                              type="checkbox"
                              name="archived"
                              defaultChecked={a.archived}
                              className="h-4 w-4 rounded border-white/20 bg-[rgba(50,32,8,0.70)]"
                            />
                            {t.archived}
                          </label>
                          <button type="submit" className="h-10 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10">
                            {t.update}
                          </button>
                        </form>
                        <form action={deleteApplicationAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="h-10 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 text-xs font-semibold text-red-200 hover:bg-red-500/15">
                            {t.delete}
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="mt-4">
                      <form action={setAdminNoteAction} className="grid gap-2">
                        <input type="hidden" name="id" value={a.id} />
                        <textarea
                          name="adminNote"
                          defaultValue={a.adminNote ?? ""}
                          placeholder={t.internalNotePlaceholder}
                          className="min-h-20 w-full rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
                        />
                        <div className="flex justify-end">
                          <button type="submit" className="h-10 rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10">
                            {t.saveNote}
                          </button>
                        </div>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-10 text-sm text-white/60">
                  {t.noApplications}
                </div>
              )}
            </div>
            {financingPages > 1 ? (
              <PaginationRow
                currentPage={financingPage}
                totalPages={financingPages}
                hrefForPage={(page) =>
                  `/admin?view=financing&period=${financingPeriod}&sort=${financingSort}${showArchivedApplications ? "&archived=1" : ""}&financingPage=${page}`
                }
              />
            ) : null}
          </section>
        ) : null}
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

function VehicleStatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "IN_TRANSIT" | "ON_SITE" | "SOLD";
}) {
  const className =
    tone === "SOLD"
      ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-200"
      : tone === "IN_TRANSIT"
        ? "border-amber-500/30 bg-amber-500/12 text-amber-200"
        : "border-sky-500/30 bg-sky-500/12 text-sky-200";

  return (
    <span className={`inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-bold ${className}`}>
      {label}
    </span>
  );
}

function PaginationRow({
  currentPage,
  totalPages,
  hrefForPage,
}: {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  const pages = Array.from({length: totalPages}, (_, index) => index + 1).slice(
    Math.max(0, currentPage - 3),
    Math.max(5, currentPage + 2)
  );

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 ? (
        <a
          href={hrefForPage(currentPage - 1)}
          className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/75 hover:bg-white/10 hover:text-white"
        >
          Назад
        </a>
      ) : null}
      {pages.map((page) => (
        <a
          key={page}
          href={hrefForPage(page)}
          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-semibold ${
            page === currentPage
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
              : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          {page}
        </a>
      ))}
      {currentPage < totalPages ? (
        <a
          href={hrefForPage(currentPage + 1)}
          className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/75 hover:bg-white/10 hover:text-white"
        >
          Далі
        </a>
      ) : null}
    </div>
  );
}

