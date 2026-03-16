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
  deactivateDealerAction,
  reactivateDealerAction,
} from "@/app/admin/actions";
import {requireAdmin} from "@/lib/adminAuth";
import {
  adminCrmUk,
  applicationStatusLabels,
  financingStatusLabels,
  partnerStatusLabels,
  topicLabels,
} from "@/lib/crmCopy";
import {getDealerMetricsMap} from "@/lib/dealerMetrics";
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

const ADMIN_VIEWS = ["financing", "vehicles", "vacancies", "dealers"] as const;
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
  return {firstName: parts[0] || "", lastName: parts.slice(1).join(" ")};
}

function normalizeFinancingPeriod(value: string | undefined): FinancingPeriod {
  return (FINANCING_PERIODS as readonly string[]).includes(value || "") ? (value as FinancingPeriod) : "7d";
}

function normalizeFinancingSort(value: string | undefined): FinancingSort {
  return (FINANCING_SORTS as readonly string[]).includes(value || "") ? (value as FinancingSort) : "newest";
}

function normalizeVehicleFilter(value: string | undefined): VehicleFilter {
  return (VEHICLE_FILTERS as readonly string[]).includes(value || "") ? (value as VehicleFilter) : "all";
}

function normalizePage(value: string | undefined) {
  const page = Number(value || "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function getVehicleGalleryImages(vehicle: {imageUrl?: string | null; images: Array<{url: string}>}) {
  return Array.from(new Set(vehicle.images.map((i) => i.url).filter(Boolean)));
}

function getVehicleGalleryVideos(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

// ─── input / select / textarea shared styles ───────────────────────────────
const INP = "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] transition";
const INP_SM = "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] transition";
const SEL = "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-[var(--color-accent)]/50 transition cursor-pointer";
const SEL_SM = "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-[var(--color-accent)]/50 transition cursor-pointer";
const AREA = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[var(--color-accent)]/50 focus:bg-white/[0.07] resize-none transition";
const BTN_PRIMARY = "inline-flex h-11 items-center rounded-xl bg-[var(--color-accent)] px-5 text-sm font-bold text-black hover:brightness-110 active:scale-[.98] transition";
const BTN_GHOST = "inline-flex h-10 items-center rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10 active:scale-[.98] transition";
const BTN_GHOST_SM = "inline-flex h-9 items-center rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10 transition";
const BTN_DANGER_SM = "inline-flex h-9 items-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition";
const LABEL = "block text-xs font-semibold text-white/55 mb-1.5";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.03]";
const SECTION = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";
const FILE_INP = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-accent)] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-black cursor-pointer";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{
    dealerCreated?: string | string[];
    dealerError?: string | string[];
    ownerEmail?: string | string[];
    ownerPassword?: string | string[];
    vehicleSaved?: string | string[];
    vehicleError?: string | string[];
    vacancySaved?: string | string[];
    vacancyError?: string | string[];
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

  const sp = (k: keyof typeof params): string | undefined => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const dealerCreated = sp("dealerCreated");
  const dealerError = sp("dealerError");
  const ownerEmail = sp("ownerEmail");
  const ownerPassword = sp("ownerPassword");
  const vehicleSaved = sp("vehicleSaved");
  const vehicleError = sp("vehicleError");
  const vacancySaved = sp("vacancySaved");
  const vacancyError = sp("vacancyError");
  const activeView = normalizeAdminView(sp("view"));
  const financingPeriod = normalizeFinancingPeriod(sp("period"));
  const financingSort = normalizeFinancingSort(sp("sort"));
  const showArchivedApplications = sp("archived") === "1";
  const vehicleStatusFilter = normalizeVehicleFilter(sp("vehicleStatus"));
  const financingPage = normalizePage(sp("financingPage"));
  const dealerLeadPage = normalizePage(sp("dealerLeadPage"));
  const dealerPage = normalizePage(sp("dealerPage"));
  const vehiclePage = normalizePage(sp("vehiclePage"));

  const platformDealerSlug = process.env.DEFAULT_DEALER_SLUG || "yaskrava";

  const [applications, partnerLeads, dealers, activeUsers, dealerList, platformDealer] =
    await Promise.all([
      prisma.application.findMany({
        where: {deletedAt: null},
        orderBy: {createdAt: "desc"},
        take: 200,
        include: {dealer: true, financingCase: true},
      }),
      prisma.partnerLead.findMany({
        where: {deletedAt: null},
        orderBy: {createdAt: "desc"},
        take: 100,
        include: {convertedDealer: true},
      }),
      prisma.dealer.count({where: {status: "ACTIVE", slug: {not: platformDealerSlug}}}),
      prisma.adminUser.count({where: {isActive: true, platformRole: {not: null}}}),
      prisma.dealer.findMany({
        orderBy: {createdAt: "desc"},
        include: {memberships: {where: {isActive: true}, include: {user: true}}},
        take: 50,
      }),
      prisma.dealer.findUnique({
        where: {slug: platformDealerSlug},
        select: {id: true, name: true, slug: true},
      }),
    ]);

  const [vacancies, yaskravaVehicles] = platformDealer
    ? await Promise.all([
        prisma.vacancy.findMany({
          where: {dealerId: platformDealer.id, deletedAt: null},
          orderBy: [{sortOrder: "asc"}, {createdAt: "desc"}],
          take: 100,
        }),
        prisma.vehicle.findMany({
          where: {dealerId: platformDealer.id, deletedAt: null},
          orderBy: [{featured: "desc"}, {createdAt: "desc"}],
          include: {images: {orderBy: {sortOrder: "asc"}}},
          take: 100,
        }),
      ])
    : [[], []];

  const dealerMetrics = await getDealerMetricsMap(dealerList.map((d) => d.id));

  const leadsNew = applications.filter((a) => a.status === "NEW").length;
  const partnerNew = partnerLeads.filter((a) => a.status === "NEW").length;
  const financingOpen = applications.filter(
    (a) => a.financingStatus !== "APPROVED" && a.financingStatus !== "REJECTED" && a.financingStatus !== "FUNDED"
  ).length;
  const pendingPartnerLeads = partnerLeads.filter((l) => !l.convertedDealerId && !l.archived);

  const sortedVehicles = [...yaskravaVehicles].sort((a, b) =>
    (a.availability === "SOLD" ? 1 : 0) - (b.availability === "SOLD" ? 1 : 0)
  );
  const filteredVehicles = sortedVehicles.filter((v) => {
    if (vehicleStatusFilter === "on_site") return v.availability === "ON_SITE";
    if (vehicleStatusFilter === "in_transit") return v.availability === "IN_TRANSIT";
    if (vehicleStatusFilter === "sold") return v.availability === "SOLD";
    return true;
  });

  const now = Date.now();
  const periodMs =
    financingPeriod === "today" ? 86_400_000
    : financingPeriod === "7d" ? 604_800_000
    : financingPeriod === "30d" ? 2_592_000_000
    : null;

  const financingApplications = [...applications]
    .filter((a) => (showArchivedApplications ? true : !a.archived))
    .filter((a) => (periodMs ? now - new Date(a.createdAt).getTime() <= periodMs : true))
    .sort((a, b) => {
      if (financingSort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (financingSort === "dealer") return a.dealer.name.localeCompare(b.dealer.name);
      if (financingSort === "status") return a.financingStatus.localeCompare(b.financingStatus);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const pagedPartnerLeads = pendingPartnerLeads.slice((dealerLeadPage - 1) * CRM_PAGE_SIZE, dealerLeadPage * CRM_PAGE_SIZE);
  const partnerLeadPages = Math.max(1, Math.ceil(pendingPartnerLeads.length / CRM_PAGE_SIZE));
  const pagedDealers = dealerList.slice((dealerPage - 1) * CRM_PAGE_SIZE, dealerPage * CRM_PAGE_SIZE);
  const dealerPages = Math.max(1, Math.ceil(dealerList.length / CRM_PAGE_SIZE));
  const pagedVehicles = filteredVehicles.slice((vehiclePage - 1) * CRM_PAGE_SIZE, vehiclePage * CRM_PAGE_SIZE);
  const vehiclePages = Math.max(1, Math.ceil(filteredVehicles.length / CRM_PAGE_SIZE));
  const pagedFinancing = financingApplications.slice((financingPage - 1) * CRM_PAGE_SIZE, financingPage * CRM_PAGE_SIZE);
  const financingPages = Math.max(1, Math.ceil(financingApplications.length / CRM_PAGE_SIZE));

  const navItems = [
    {key: "financing", label: "Фінансування", badge: leadsNew + financingOpen},
    {key: "vehicles", label: "Авто", badge: yaskravaVehicles.length},
    {key: "vacancies", label: "Вакансії", badge: vacancies.length},
    {key: "dealers", label: "Дилери", badge: pendingPartnerLeads.length > 0 ? pendingPartnerLeads.length : 0},
  ] as const;

  return (
    <div className="min-h-screen bg-[#0e0d0e]">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/8 bg-[#0e0d0e]/95 px-4 backdrop-blur lg:px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black tracking-tight text-white">YASK<span className="text-[var(--color-accent)]">RAVA</span></span>
          <span className="hidden rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/50 sm:block">CRM ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-white/40 sm:block">{user.email}</span>
          <form action={adminLogoutAction}>
            <button type="submit" className={BTN_GHOST_SM}>Вийти</button>
          </form>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col border-r border-white/8 bg-[#0e0d0e] p-4 lg:flex">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={`/admin?view=${item.key}`}
                className={`flex h-10 items-center justify-between rounded-xl px-3 text-sm font-semibold transition ${
                  activeView === item.key
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
                {item.badge > 0 ? (
                  <span className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
                    activeView === item.key ? "bg-[var(--color-accent)]/30 text-[var(--color-accent)]" : "bg-white/10 text-white/50"
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </a>
            ))}
          </nav>

          <div className="mt-auto grid gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-[11px] text-white/40">
            <div className="flex justify-between"><span>Дилерів</span><span className="font-bold text-white/60">{dealers}</span></div>
            <div className="flex justify-between"><span>Відкр. фін.</span><span className="font-bold text-white/60">{financingOpen}</span></div>
            <div className="flex justify-between"><span>Нових лідів</span><span className="font-bold text-[var(--color-accent)]">{leadsNew}</span></div>
            <div className="flex justify-between"><span>Партнерів</span><span className="font-bold text-amber-400">{partnerNew}</span></div>
          </div>
        </aside>

        {/* ── Mobile tab bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-white/10 bg-[#0e0d0e]/95 backdrop-blur lg:hidden">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={`/admin?view=${item.key}`}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition ${
                activeView === item.key ? "text-[var(--color-accent)]" : "text-white/40"
              }`}
            >
              {item.badge > 0 ? (
                <span className="absolute right-1/4 top-1.5 h-4 min-w-4 rounded-full bg-[var(--color-accent)] px-1 text-center text-[9px] font-black leading-4 text-black">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
              {item.label}
            </a>
          ))}
        </div>

        {/* ── Main content ── */}
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-8">

          {/* ═══════════════════════════════════════════════
              ФІНАНСУВАННЯ
          ═══════════════════════════════════════════════ */}
          {activeView === "financing" ? (
            <div className="mx-auto max-w-4xl">
              <PageHeader title="Фінансування та заявки" subtitle="Всі заявки на лізинг і фінансування по всіх дилерах" />

              {/* Filters */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/40">Період:</span>
                {([["today","Сьогодні"],["7d","7 днів"],["30d","30 днів"],["all","Весь час"]] as const).map(([k,l]) => (
                  <a key={k} href={`/admin?view=financing&period=${k}&sort=${financingSort}${showArchivedApplications ? "&archived=1" : ""}`}
                    className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-semibold transition ${
                      financingPeriod === k ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-[var(--color-accent)]" : "border-white/10 bg-white/5 text-white/55 hover:text-white"
                    }`}>{l}</a>
                ))}
                <span className="ml-2 text-xs text-white/40">Сорт:</span>
                {([["newest","Нові↓"],["oldest","Старі↑"],["dealer","По дилеру"],["status","По статусу"]] as const).map(([k,l]) => (
                  <a key={k} href={`/admin?view=financing&period=${financingPeriod}&sort=${k}${showArchivedApplications ? "&archived=1" : ""}`}
                    className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-semibold transition ${
                      financingSort === k ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-[var(--color-accent)]" : "border-white/10 bg-white/5 text-white/55 hover:text-white"
                    }`}>{l}</a>
                ))}
                <a href={`/admin?view=financing&period=${financingPeriod}&sort=${financingSort}${showArchivedApplications ? "" : "&archived=1"}`}
                  className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-semibold transition ${
                    showArchivedApplications ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-white/55 hover:text-white"
                  }`}>
                  {showArchivedApplications ? "✓ Архів" : "Архів"}
                </a>
              </div>

              <div className="mt-4 text-xs text-white/30">{financingApplications.length} заявок</div>

              <div className="mt-3 grid gap-3">
                {financingApplications.length ? (
                  pagedFinancing.map((a) => (
                    <article key={a.id} className={`${CARD} p-4`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white">{a.fullName}</div>
                          <div className="mt-0.5 text-xs text-white/40">
                            {new Date(a.createdAt).toLocaleString("uk")} · {topicLabels.uk[a.topic]} · {a.dealer.name}
                          </div>
                          <div className="mt-0.5 text-xs text-white/30">{a.phone || "—"} · {a.email || "—"} · {a.city || "—"}</div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge label={applicationStatusLabels.uk[a.status]} tone="neutral" />
                          <StatusBadge label={financingStatusLabels.uk[a.financingStatus]} tone="accent" />
                          {a.archived ? <StatusBadge label="Архів" tone="muted" /> : null}
                        </div>
                      </div>

                      {a.message ? <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/50">{a.message}</p> : null}

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
                        <form action={setApplicationStatusAction} className="flex gap-2">
                          <input type="hidden" name="id" value={a.id} />
                          <select name="status" defaultValue={a.status} className={SEL_SM}>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{applicationStatusLabels.uk[s]}</option>)}
                          </select>
                          <button type="submit" className={BTN_GHOST_SM}>OK</button>
                        </form>

                        <form action={setFinancingStatusAction} className="flex gap-2">
                          <input type="hidden" name="id" value={a.id} />
                          <select name="status" defaultValue={a.financingStatus} className={SEL_SM}>
                            {FINANCING_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{financingStatusLabels.uk[s]}</option>)}
                          </select>
                          <button type="submit" className={BTN_GHOST_SM}>OK</button>
                        </form>

                        <div className="flex gap-2">
                          <form action={toggleArchivedAction} className="flex items-center gap-1.5">
                            <input type="hidden" name="id" value={a.id} />
                            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 h-9 text-xs text-white/60">
                              <input type="checkbox" name="archived" defaultChecked={a.archived} className="h-3.5 w-3.5" />
                              Архів
                            </label>
                            <button type="submit" className={BTN_GHOST_SM}>OK</button>
                          </form>
                          <form action={deleteApplicationAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <button type="submit" className={BTN_DANGER_SM}>✕</button>
                          </form>
                        </div>
                      </div>

                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-white/30 hover:text-white/60">Нотатка адміна ▸</summary>
                        <form action={setAdminNoteAction} className="mt-2 flex flex-col gap-2">
                          <input type="hidden" name="id" value={a.id} />
                          <textarea name="adminNote" defaultValue={a.adminNote ?? ""} rows={3}
                            placeholder="Внутрішня нотатка…" className={AREA} />
                          <div className="flex justify-end">
                            <button type="submit" className={BTN_GHOST_SM}>{t.saveNote}</button>
                          </div>
                        </form>
                      </details>
                    </article>
                  ))
                ) : (
                  <EmptyState text={t.noApplications} />
                )}
              </div>
              {financingPages > 1 && (
                <PaginationRow currentPage={financingPage} totalPages={financingPages}
                  hrefForPage={(p) => `/admin?view=financing&period=${financingPeriod}&sort=${financingSort}${showArchivedApplications ? "&archived=1" : ""}&financingPage=${p}`} />
              )}
            </div>
          ) : null}

          {/* ═══════════════════════════════════════════════
              АВТО
          ═══════════════════════════════════════════════ */}
          {activeView === "vehicles" ? (
            <div className="mx-auto max-w-5xl">
              <PageHeader title="Авто платформи" subtitle={`Каталог головного сайту · ${platformDealer?.name || platformDealerSlug}`} />

              {vehicleSaved ? (
                <Toast tone="success" text={vehicleSaved === "created" ? "Авто додано і опубліковано на сайті." : "Картку авто оновлено."} />
              ) : null}
              {vehicleError ? (
                <Toast tone="error" text={vehicleError === "platform" ? "Платформеного дилера не знайдено." : "Не вдалося зберегти авто — перевірте поля і посилання."} />
              ) : null}

              {/* Stats row */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Всього" value={String(yaskravaVehicles.length)} />
                <StatCard label="Опубліковані" value={String(yaskravaVehicles.filter((v) => v.published).length)} />
                <StatCard label="Рекомендовані" value={String(yaskravaVehicles.filter((v) => v.featured).length)} />
                <StatCard label="З фото" value={String(yaskravaVehicles.filter((v) => getVehicleGalleryImages(v).length > 0 || v.imageUrl).length)} />
              </div>

              {/* ADD VEHICLE FORM */}
              <section className="mt-6 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white">+ Додати авто</h2>
                    <p className="mt-0.5 text-xs text-white/40">Заповніть картку і натисніть «Зберегти» — авто відразу з'явиться на сайті</p>
                  </div>
                </div>

                <form action={createPlatformVehicleAction} className="mt-5 grid gap-5">
                  {/* Block 1: Основне */}
                  <FormBlock title="Основне">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <LabelField label="Назва оголошення *" hint="Марка, модель, рік, комплектація">
                        <input name="title" required className={INP} placeholder="BMW 320d Touring · 2021 · Luxury Line" />
                      </LabelField>
                      <LabelField label="Артикул (Stock №)">
                        <input name="stockNumber" className={INP} placeholder="YA-320D-001" />
                      </LabelField>
                    </div>
                  </FormBlock>

                  {/* Block 2: Характеристики */}
                  <FormBlock title="Характеристики">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <LabelField label="Марка"><input name="make" className={INP} placeholder="BMW" /></LabelField>
                      <LabelField label="Модель"><input name="model" className={INP} placeholder="320d Touring" /></LabelField>
                      <LabelField label="VIN (останні 6)"><input name="vinLast6" className={INP} placeholder="ABC123" /></LabelField>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-4">
                      <LabelField label="Рік"><input name="year" type="number" className={INP} placeholder="2021" /></LabelField>
                      <LabelField label="Пробіг, км"><input name="mileageKm" type="number" className={INP} placeholder="74000" /></LabelField>
                      <LabelField label="Паливо"><input name="fuel" className={INP} placeholder="Diesel" /></LabelField>
                      <LabelField label="Коробка"><input name="transmission" className={INP} placeholder="Automatic" /></LabelField>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <LabelField label="Ціна, CZK"><input name="priceCzk" type="number" className={INP} placeholder="649 000" /></LabelField>
                      <LabelField label="Наявність">
                        <select name="availability" defaultValue="ON_SITE" className={SEL}>
                          <option value="ON_SITE">{t.availabilityOnSite}</option>
                          <option value="IN_TRANSIT">{t.availabilityTransit}</option>
                          <option value="SOLD">{t.availabilitySold}</option>
                        </select>
                      </LabelField>
                      <div className="flex flex-col gap-2">
                        <span className={LABEL}>Опції</span>
                        <div className="grid gap-2">
                          <CheckboxField name="published" defaultChecked label="Опублікувати" />
                          <CheckboxField name="featured" label="Рекомендоване" />
                          <CheckboxField name="leasingEligible" defaultChecked label="Лізинг" />
                        </div>
                      </div>
                    </div>
                  </FormBlock>

                  {/* Block 3: Медіа */}
                  <FormBlock title="Фото і відео">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="mb-3 text-xs font-bold text-white/70">📷 Фото (до 10)</div>
                        <div className="grid gap-3">
                          <LabelField label="Завантажити файли (до 10)">
                            <input name="imageFiles" type="file" accept="image/*" multiple className={FILE_INP} />
                          </LabelField>
                          <LabelField label="або вставте URL головного фото">
                            <input name="imageUrl" className={INP} placeholder="https://…" />
                          </LabelField>
                          <LabelField label="Додаткові фото URL (кожне з нового рядка)">
                            <textarea name="galleryImageUrls" rows={3} className={AREA} placeholder={"https://…\nhttps://…"} />
                          </LabelField>
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="mb-3 text-xs font-bold text-white/70">🎬 Відео (1 файл)</div>
                        <div className="grid gap-3">
                          <LabelField label="Завантажити відео">
                            <input name="videoFile" type="file" accept="video/*" className={FILE_INP} />
                          </LabelField>
                          <LabelField label="або вставте URL відео">
                            <input name="videoUrl" className={INP} placeholder="https://…" />
                          </LabelField>
                        </div>
                      </div>
                    </div>
                  </FormBlock>

                  {/* Block 4: Опис */}
                  <FormBlock title="Опис">
                    <LabelField label="Опис авто">
                      <textarea name="description" rows={4} className={AREA}
                        placeholder="Стан, комплектація, сервісна історія, переваги для покупця…" />
                    </LabelField>
                  </FormBlock>

                  <div className="flex justify-end">
                    <button type="submit" className={BTN_PRIMARY}>Зберегти авто →</button>
                  </div>
                </form>
              </section>

              {/* INVENTORY */}
              <div className="mt-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-white">Список авто</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {([["all","Усі"],["on_site",t.availabilityOnSite],["in_transit",t.availabilityTransit],["sold",t.availabilitySold]] as const).map(([k,l]) => (
                      <a key={k} href={`/admin?view=vehicles&vehicleStatus=${k}`}
                        className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-semibold transition ${
                          vehicleStatusFilter === k ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-[var(--color-accent)]" : "border-white/10 bg-white/5 text-white/55 hover:text-white"
                        }`}>{l}</a>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredVehicles.length ? (
                    pagedVehicles.map((vehicle) => {
                      const galleryImages = getVehicleGalleryImages(vehicle);
                      const galleryVideos = getVehicleGalleryVideos(vehicle.videoGallery);
                      const extraGalleryImages = galleryImages.filter((url) => url !== vehicle.imageUrl);
                      const thumbSrc = vehicle.imageUrl || galleryImages[0];

                      return (
                        <article key={vehicle.id} className={`${CARD} flex flex-col overflow-hidden`}>
                          {/* Thumbnail */}
                          <div className="relative h-36 w-full bg-white/5">
                            {thumbSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={thumbSrc} alt={vehicle.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-2xl text-white/15">🚗</div>
                            )}
                            <div className="absolute left-2 top-2 flex gap-1">
                              <VehicleStatusPill label={vehicle.availability === "SOLD" ? "Продано" : vehicle.availability === "IN_TRANSIT" ? "В дорозі" : "В наявності"} tone={vehicle.availability} />
                            </div>
                            {vehicle.featured ? (
                              <div className="absolute right-2 top-2 rounded-lg bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-black text-black">FEATURED</div>
                            ) : null}
                            {!vehicle.published ? (
                              <div className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white/70">Прихований</div>
                            ) : null}
                          </div>

                          {/* Info */}
                          <div className="flex flex-1 flex-col gap-3 p-4">
                            <div>
                              <div className="line-clamp-2 text-sm font-bold text-white leading-tight">{vehicle.title}</div>
                              <div className="mt-1 text-sm font-bold text-[var(--color-accent)]">
                                {vehicle.priceCzk ? `${vehicle.priceCzk.toLocaleString("cs")} CZK` : "За запитом"}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-white/40">
                                {vehicle.make ? <span>{vehicle.make}</span> : null}
                                {vehicle.model ? <span>{vehicle.model}</span> : null}
                                {vehicle.year ? <span>{vehicle.year}</span> : null}
                                {vehicle.mileageKm ? <span>{vehicle.mileageKm.toLocaleString()} km</span> : null}
                              </div>
                              <div className="mt-1 flex gap-2 text-[10px] text-white/30">
                                {galleryImages.length > 0 ? <span>📷 {galleryImages.length}</span> : null}
                                {galleryVideos.length > 0 ? <span>🎬 {galleryVideos.length}</span> : null}
                              </div>
                            </div>

                            {/* Quick actions */}
                            <div className="flex flex-wrap gap-2">
                              {vehicle.availability !== "SOLD" ? (
                                <form action={markPlatformVehicleSoldAction}>
                                  <input type="hidden" name="id" value={vehicle.id} />
                                  <button type="submit" className="inline-flex h-8 items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition">
                                    Продано
                                  </button>
                                </form>
                              ) : null}
                              <form action={deletePlatformVehicleAction}>
                                <input type="hidden" name="id" value={vehicle.id} />
                                <button type="submit" className="inline-flex h-8 items-center rounded-lg border border-red-500/25 bg-red-500/8 px-3 text-[11px] font-semibold text-red-400 hover:bg-red-500/15 transition">
                                  Видалити
                                </button>
                              </form>
                            </div>

                            {/* Edit form */}
                            <details className="rounded-xl border border-white/8 bg-white/[0.02]">
                              <summary className="cursor-pointer px-3 py-2.5 text-xs font-semibold text-white/50 hover:text-white/80 [&::-webkit-details-marker]:hidden">
                                ✏️ Редагувати картку
                              </summary>
                              <form action={updatePlatformVehicleAction} className="px-3 pb-4 pt-2">
                                <input type="hidden" name="id" value={vehicle.id} />
                                <div className="grid gap-3">
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <LabelField label="Назва *">
                                      <input name="title" required defaultValue={vehicle.title} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Артикул">
                                      <input name="stockNumber" defaultValue={vehicle.stockNumber ?? ""} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Марка">
                                      <input name="make" defaultValue={vehicle.make ?? ""} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Модель">
                                      <input name="model" defaultValue={vehicle.model ?? ""} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Рік">
                                      <input name="year" type="number" defaultValue={vehicle.year ?? ""} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Пробіг, км">
                                      <input name="mileageKm" type="number" defaultValue={vehicle.mileageKm ?? ""} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Паливо">
                                      <input name="fuel" defaultValue={vehicle.fuel ?? ""} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Коробка">
                                      <input name="transmission" defaultValue={vehicle.transmission ?? ""} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Ціна CZK">
                                      <input name="priceCzk" type="number" defaultValue={vehicle.priceCzk ?? ""} className={INP_SM} />
                                    </LabelField>
                                    <LabelField label="Наявність">
                                      <select name="availability" defaultValue={vehicle.availability} className={SEL_SM}>
                                        <option value="ON_SITE">{t.availabilityOnSite}</option>
                                        <option value="IN_TRANSIT">{t.availabilityTransit}</option>
                                        <option value="SOLD">{t.availabilitySold}</option>
                                      </select>
                                    </LabelField>
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    <CheckboxField name="published" defaultChecked={vehicle.published} label="Опубліковано" />
                                    <CheckboxField name="featured" defaultChecked={vehicle.featured} label="Рекомендоване" />
                                    <CheckboxField name="leasingEligible" defaultChecked={vehicle.leasingEligible} label="Лізинг" />
                                  </div>
                                  <LabelField label="Головне фото URL">
                                    <input name="imageUrl" defaultValue={vehicle.imageUrl ?? ""} className={INP_SM} placeholder="https://…" />
                                  </LabelField>
                                  <LabelField label="Додаткові фото URL">
                                    <textarea name="galleryImageUrls" defaultValue={extraGalleryImages.join("\n")} rows={2} className={`${AREA} text-xs`} />
                                  </LabelField>
                                  <LabelField label="Завантажити нові фото (до 10)">
                                    <input name="imageFiles" type="file" accept="image/*" multiple className={FILE_INP} />
                                  </LabelField>
                                  <LabelField label="URL відео">
                                    <input name="videoUrl" defaultValue={vehicle.videoUrl ?? ""} className={INP_SM} placeholder="https://…" />
                                  </LabelField>
                                  <LabelField label="Завантажити відео">
                                    <input name="videoFile" type="file" accept="video/*" className={FILE_INP} />
                                  </LabelField>
                                  <LabelField label="Опис">
                                    <textarea name="description" defaultValue={vehicle.description ?? ""} rows={3} className={`${AREA} text-xs`} />
                                  </LabelField>
                                  <div className="flex justify-end pt-1">
                                    <button type="submit" className={BTN_PRIMARY}>Зберегти</button>
                                  </div>
                                </div>
                              </form>
                            </details>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="col-span-full">
                      <EmptyState text={t.noPlatformVehicles} />
                    </div>
                  )}
                </div>
                {vehiclePages > 1 && (
                  <PaginationRow currentPage={vehiclePage} totalPages={vehiclePages}
                    hrefForPage={(p) => `/admin?view=vehicles&vehicleStatus=${vehicleStatusFilter}&vehiclePage=${p}`} />
                )}
              </div>
            </div>
          ) : null}

          {/* ═══════════════════════════════════════════════
              ВАКАНСІЇ
          ═══════════════════════════════════════════════ */}
          {activeView === "vacancies" ? (
            <div className="mx-auto max-w-3xl">
              <PageHeader title="Вакансії" subtitle="Публічна сторінка кар'єри — додавайте та редагуйте вакансії" />

              {vacancySaved ? <Toast tone="success" text={vacancySaved === "created" ? "Вакансію додано." : "Вакансію оновлено."} /> : null}
              {vacancyError ? <Toast tone="error" text="Не вдалося зберегти — перевірте поля." /> : null}

              {/* CREATE VACANCY */}
              <section className="mt-5 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04] p-5">
                <h2 className="text-base font-bold text-white">+ Нова вакансія</h2>
                <form action={createCareerVacancyAction} className="mt-4 grid gap-4 sm:grid-cols-2">
                  <LabelField label="Назва посади *" className="sm:col-span-2">
                    <input name="title" required className={INP} placeholder="Senior Sales Manager" />
                  </LabelField>
                  <LabelField label="Місто">
                    <input name="city" className={INP} placeholder="Прага" />
                  </LabelField>
                  <LabelField label="Тип зайнятості">
                    <input name="employmentType" className={INP} placeholder="Повна зайнятість" />
                  </LabelField>
                  <LabelField label="Зарплата" className="sm:col-span-2">
                    <input name="salary" className={INP} placeholder="40 000 – 60 000 CZK/місяць" />
                  </LabelField>
                  <LabelField label="Email для зв'язку">
                    <input name="contactEmail" type="email" className={INP} placeholder="career@yaskrava.eu" />
                  </LabelField>
                  <LabelField label="Позиція у списку (1 = перша)">
                    <input name="sortOrder" type="number" defaultValue={0} min={0} className={INP} />
                  </LabelField>
                  <LabelField label="Опис вакансії" className="sm:col-span-2">
                    <textarea name="description" rows={4} className={AREA}
                      placeholder="Коротко: роль, задачі, що пропонуємо кандидату…" />
                  </LabelField>
                  <div className="flex items-center justify-between sm:col-span-2">
                    <CheckboxField name="published" defaultChecked label="Опублікувати одразу" />
                    <button type="submit" className={BTN_PRIMARY}>{t.createVacancyButton}</button>
                  </div>
                </form>
              </section>

              {/* VACANCY LIST */}
              <div className="mt-6 grid gap-3">
                {vacancies.length ? (
                  vacancies.map((vacancy) => (
                    <article key={vacancy.id} className={SECTION}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-white">{vacancy.title}</div>
                          <div className="mt-0.5 text-xs text-white/40">
                            {[vacancy.city, vacancy.employmentType, (vacancy as {salary?: string | null}).salary].filter(Boolean).join(" · ") || "Без деталей"}
                            {vacancy.sortOrder > 0 ? ` · позиція ${vacancy.sortOrder}` : ""}
                          </div>
                        </div>
                        <span className={`inline-flex h-7 items-center rounded-lg border px-2.5 text-[11px] font-bold ${
                          vacancy.published ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-white/50"
                        }`}>
                          {vacancy.published ? "Опублікована" : "Прихована"}
                        </span>
                      </div>

                      {vacancy.description ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/40">{vacancy.description}</p>
                      ) : null}

                      <details className="mt-3 rounded-xl border border-white/8 bg-white/[0.02]">
                        <summary className="cursor-pointer px-3 py-2.5 text-xs font-semibold text-white/50 hover:text-white/80 [&::-webkit-details-marker]:hidden">
                          ✏️ Редагувати
                        </summary>
                        <div className="grid gap-3 px-3 pb-4 pt-2">
                          <form action={updateCareerVacancyAction} className="grid gap-3 sm:grid-cols-2">
                            <input type="hidden" name="id" value={vacancy.id} />
                            <LabelField label="Назва посади">
                              <input name="title" defaultValue={vacancy.title} className={INP_SM} />
                            </LabelField>
                            <LabelField label="Місто">
                              <input name="city" defaultValue={vacancy.city ?? ""} className={INP_SM} />
                            </LabelField>
                            <LabelField label="Тип зайнятості">
                              <input name="employmentType" defaultValue={vacancy.employmentType ?? ""} className={INP_SM} />
                            </LabelField>
                            <LabelField label="Зарплата">
                              <input name="salary" defaultValue={(vacancy as {salary?: string | null}).salary ?? ""} className={INP_SM} placeholder="40 000 – 60 000 CZK/міс" />
                            </LabelField>
                            <LabelField label="Email">
                              <input name="contactEmail" defaultValue={vacancy.contactEmail ?? ""} className={INP_SM} />
                            </LabelField>
                            <LabelField label="Позиція у списку (1 = перша)">
                              <input name="sortOrder" type="number" min={0} defaultValue={vacancy.sortOrder} className={INP_SM} />
                            </LabelField>
                            <div className="flex items-end">
                              <CheckboxField name="published" defaultChecked={vacancy.published} label="Опублікована" />
                            </div>
                            <div />
                            <LabelField label="Опис" className="sm:col-span-2">
                              <textarea name="description" defaultValue={vacancy.description ?? ""} rows={3} className={`${AREA} text-xs`} />
                            </LabelField>
                            <div className="flex justify-end sm:col-span-2">
                              <button type="submit" className={BTN_PRIMARY}>{t.save}</button>
                            </div>
                          </form>
                          <form action={archiveCareerVacancyAction} className="pt-1 border-t border-white/8">
                            <input type="hidden" name="id" value={vacancy.id} />
                            <button type="submit" className={BTN_DANGER_SM}
                              onClick={(e) => { if (!confirm("Видалити вакансію назавжди?")) e.preventDefault(); }}>
                              🗑 Видалити вакансію
                            </button>
                          </form>
                        </div>
                      </details>
                    </article>
                  ))
                ) : (
                  <EmptyState text={t.noVacancies} />
                )}
              </div>
            </div>
          ) : null}

          {/* ═══════════════════════════════════════════════
              ДИЛЕРИ
          ═══════════════════════════════════════════════ */}
          {activeView === "dealers" ? (
            <div className="mx-auto max-w-4xl">
              <PageHeader title="Дилери та партнери" subtitle="Підключення нових дилерів і мережа партнерів" />

              {dealerCreated ? (
                <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-4">
                  <div className="text-sm font-bold text-emerald-300">✓ Дилера підключено!</div>
                  <div className="mt-2 grid gap-1 text-xs text-emerald-200/70">
                    <div>Slug: <span className="font-bold text-white">{dealerCreated}</span></div>
                    <div>Сайт: <span className="font-bold text-white">{getDealerPublicUrl(dealerCreated)}</span></div>
                    <div>CRM: <span className="font-bold text-white">{getDealerCrmUrl(dealerCreated)}</span></div>
                    {ownerEmail ? <div>Логін: <span className="font-bold text-white">{ownerEmail}</span></div> : null}
                    {ownerPassword ? <div>Пароль: <span className="font-bold text-white">{ownerPassword}</span></div> : null}
                  </div>
                </div>
              ) : null}
              {dealerError ? <Toast tone="error" text="Помилка: дилер або email вже існує, або поля заповнені невірно." /> : null}

              {/* Incoming partner leads */}
              {pendingPartnerLeads.length > 0 ? (
                <section className="mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{t.incomingDealerLeads}</h2>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300">{pendingPartnerLeads.length}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pagedPartnerLeads.map((lead) => {
                      const nameParts = splitContactName(lead.contactName);
                      return (
                        <article key={lead.id} className={SECTION}>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-bold text-white">{lead.companyName}</div>
                              <div className="mt-0.5 text-xs text-white/40">{lead.contactName} · {new Date(lead.createdAt).toLocaleDateString("uk")}</div>
                              <div className="mt-0.5 text-xs text-white/35">{lead.email} {lead.phone ? `· ${lead.phone}` : ""}</div>
                            </div>
                            <StatusBadge label={partnerStatusLabels.uk[lead.status]} tone="muted" />
                          </div>
                          {lead.message ? <p className="mt-2 line-clamp-2 text-xs text-white/40">{lead.message}</p> : null}

                          <div className="mt-3 flex gap-2">
                            <form action={setPartnerLeadStatusAction} className="flex flex-1 gap-2">
                              <input type="hidden" name="id" value={lead.id} />
                              <select name="status" defaultValue={lead.status} className={SEL_SM}>
                                {PARTNER_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{partnerStatusLabels.uk[s]}</option>)}
                              </select>
                              <button type="submit" className={BTN_GHOST_SM}>OK</button>
                            </form>
                          </div>

                          <details className="mt-3 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04]">
                            <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-[var(--color-accent)]/80 hover:text-[var(--color-accent)] [&::-webkit-details-marker]:hidden">
                              🔗 Підключити як дилера →
                            </summary>
                            <form action={createDealerProvisionAction} className="grid gap-3 px-3 pb-4 pt-2 sm:grid-cols-2">
                              <input type="hidden" name="partnerLeadId" value={lead.id} />
                              <LabelField label="Назва дилера *">
                                <input name="name" required defaultValue={lead.companyName} className={INP_SM} />
                              </LabelField>
                              <LabelField label="Slug (субдомен)">
                                <input name="slug" className={INP_SM} placeholder="premium-auto" />
                              </LabelField>
                              <LabelField label="Юридична назва" className="sm:col-span-2">
                                <input name="legalName" defaultValue={lead.companyName} className={INP_SM} />
                              </LabelField>
                              <LabelField label="Підтримка email">
                                <input name="supportEmail" type="email" required defaultValue={lead.email} className={INP_SM} />
                              </LabelField>
                              <LabelField label="Підтримка телефон">
                                <input name="supportPhone" defaultValue={lead.phone ?? ""} className={INP_SM} />
                              </LabelField>
                              <LabelField label="Email власника">
                                <input name="ownerEmail" type="email" required defaultValue={lead.email} className={INP_SM} />
                              </LabelField>
                              <LabelField label="Ім'я власника">
                                <input name="ownerFirstName" defaultValue={nameParts.firstName} className={INP_SM} />
                              </LabelField>
                              <LabelField label="Прізвище власника">
                                <input name="ownerLastName" defaultValue={nameParts.lastName} className={INP_SM} />
                              </LabelField>
                              <LabelField label="Пароль власника *" className="sm:col-span-2">
                                <input name="ownerPassword" required className={INP_SM} placeholder="Тимчасовий пароль мін. 8 символів" />
                              </LabelField>
                              <div className="sm:col-span-2 flex justify-end">
                                <button type="submit" className={BTN_PRIMARY}>{t.provisionButton}</button>
                              </div>
                            </form>
                          </details>
                        </article>
                      );
                    })}
                  </div>
                  {partnerLeadPages > 1 && (
                    <PaginationRow currentPage={dealerLeadPage} totalPages={partnerLeadPages}
                      hrefForPage={(p) => `/admin?view=dealers&dealerLeadPage=${p}&dealerPage=${dealerPage}`} />
                  )}
                </section>
              ) : null}

              {/* Manual provision */}
              <section className="mt-6 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04] p-5">
                <h2 className="mb-1 text-base font-bold text-white">{t.manualProvisionTitle}</h2>
                <p className="mb-4 text-xs text-white/40">{t.manualProvisionText}</p>
                <form action={createDealerProvisionAction} className="grid gap-4 sm:grid-cols-2">
                  <LabelField label="Назва дилера *">
                    <input name="name" required className={INP} placeholder="Premium Auto Brno" />
                  </LabelField>
                  <LabelField label="Slug (субдомен) *">
                    <input name="slug" className={INP} placeholder="premium-auto-brno" />
                  </LabelField>
                  <LabelField label="Юридична назва" className="sm:col-span-2">
                    <input name="legalName" className={INP} placeholder="Premium Auto Brno s.r.o." />
                  </LabelField>
                  <LabelField label="Email підтримки *">
                    <input name="supportEmail" type="email" required className={INP} placeholder="info@dealer.cz" />
                  </LabelField>
                  <LabelField label="Телефон підтримки">
                    <input name="supportPhone" className={INP} placeholder="+420…" />
                  </LabelField>
                  <LabelField label="Email власника *">
                    <input name="ownerEmail" type="email" required className={INP} placeholder="owner@dealer.cz" />
                  </LabelField>
                  <LabelField label="Ім'я">
                    <input name="ownerFirstName" className={INP} placeholder="Jan" />
                  </LabelField>
                  <LabelField label="Прізвище">
                    <input name="ownerLastName" className={INP} placeholder="Novak" />
                  </LabelField>
                  <LabelField label="Пароль (мін. 8 символів) *" className="sm:col-span-2">
                    <input name="ownerPassword" required className={INP} placeholder="Тимчасовий безпечний пароль" />
                  </LabelField>
                  <div className="sm:col-span-2 flex justify-end">
                    <button type="submit" className={BTN_PRIMARY}>{t.provisionButton}</button>
                  </div>
                </form>
              </section>

              {/* Dealer network */}
              <section className="mt-8">
                <h2 className="mb-3 text-base font-bold text-white">{t.dealerNetwork}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {pagedDealers.map((dealer) => {
                    const owner = dealer.memberships.find((m) => m.role === "DEALER_OWNER")?.user;
                    const kpi = dealerMetrics.get(dealer.id) || {vehicleCount:0, applicationsTotal:0, applicationsApproved:0, applicationsRejected:0, latestSnapshotDate:null};
                    return (
                      <article key={dealer.id} className={SECTION}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white">{dealer.name}</div>
                            <div className="mt-0.5 text-xs text-white/40">{dealer.slug} · {dealer.status}</div>
                          </div>
                          <span className="shrink-0 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                            Активний
                          </span>
                        </div>

                        <div className="mt-3 grid gap-1 text-[11px] text-white/40">
                          <div className="truncate">{getDealerPublicUrl(dealer.slug)}</div>
                          <div>{owner?.email || "—"}</div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs">
                          <span className="text-white/60">Авто: <strong className="text-white">{kpi.vehicleCount}</strong></span>
                          <span className="text-white/60">Заявки: <strong className="text-white">{kpi.applicationsTotal}</strong></span>
                          <span className="text-emerald-400">✓ {kpi.applicationsApproved}</span>
                          <span className="text-red-400">✕ {kpi.applicationsRejected}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] text-white/30">
                            {kpi.latestSnapshotDate
                              ? `Snapshot: ${new Date(kpi.latestSnapshotDate).toLocaleDateString("uk")}`
                              : "Snapshot pending"}
                          </div>
                          <div className="flex items-center gap-2">
                            {dealer.status === "ACTIVE" ? (
                              <form action={deactivateDealerAction}
                                onSubmit={(e) => { if (!confirm(`Деактивувати дилера «${dealer.name}»?`)) e.preventDefault(); }}>
                                <input type="hidden" name="id" value={dealer.id} />
                                <button type="submit" className="inline-flex h-7 items-center rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition">
                                  Деактивувати
                                </button>
                              </form>
                            ) : (
                              <form action={reactivateDealerAction}>
                                <input type="hidden" name="id" value={dealer.id} />
                                <button type="submit" className="inline-flex h-7 items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition">
                                  Активувати
                                </button>
                              </form>
                            )}
                            <a href={`/admin/dealers/${dealer.id}`} className={BTN_GHOST_SM}>Деталі →</a>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {dealerPages > 1 && (
                  <PaginationRow currentPage={dealerPage} totalPages={dealerPages}
                    hrefForPage={(p) => `/admin?view=dealers&dealerLeadPage=${dealerLeadPage}&dealerPage=${p}`} />
                )}
              </section>
            </div>
          ) : null}

        </main>
      </div>
    </div>
  );
}

// ── Reusable UI primitives ────────────────────────────────────────────────────

function PageHeader({title, subtitle}: {title: string; subtitle: string}) {
  return (
    <div>
      <h1 className="text-xl font-black text-white">{title}</h1>
      <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>
    </div>
  );
}

function FormBlock({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">{title}</div>
      {children}
    </div>
  );
}

function LabelField({label, children, hint, className}: {label: string; children: React.ReactNode; hint?: string; className?: string}) {
  return (
    <div className={className}>
      <label>
        <div className="mb-1.5 text-xs font-semibold text-white/55">{label}</div>
        {hint ? <div className="mb-1 text-[10px] text-white/30">{hint}</div> : null}
        {children}
      </label>
    </div>
  );
}

function CheckboxField({name, defaultChecked, label}: {name: string; defaultChecked?: boolean; label: string}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-white/70 hover:text-white transition">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-white/20 accent-[var(--color-accent)]" />
      {label}
    </label>
  );
}

function StatCard({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/35">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function StatusBadge({label, tone}: {label: string; tone: "neutral" | "accent" | "muted"}) {
  const cls =
    tone === "accent" ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
    : tone === "neutral" ? "border-white/10 bg-white/5 text-white/60"
    : "border-white/8 bg-white/[0.03] text-white/35";
  return <span className={`inline-flex h-7 items-center rounded-lg border px-2.5 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function Toast({tone, text}: {tone: "success" | "error"; text: string}) {
  return (
    <div className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
      tone === "success" ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-300" : "border-red-500/30 bg-red-500/8 text-red-300"
    }`}>
      {tone === "success" ? "✓ " : "✕ "}{text}
    </div>
  );
}

function EmptyState({text}: {text: string}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-5 py-10 text-center text-sm text-white/35">
      {text}
    </div>
  );
}

function VehicleStatusPill({label, tone}: {label: string; tone: "IN_TRANSIT" | "ON_SITE" | "SOLD"}) {
  const cls =
    tone === "SOLD" ? "bg-emerald-500/80 text-black"
    : tone === "IN_TRANSIT" ? "bg-amber-500/80 text-black"
    : "bg-sky-500/80 text-white";
  return <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black ${cls}`}>{label}</span>;
}

function PaginationRow({currentPage, totalPages, hrefForPage}: {currentPage: number; totalPages: number; hrefForPage: (page: number) => string}) {
  const pages = Array.from({length: totalPages}, (_, i) => i + 1).slice(
    Math.max(0, currentPage - 3),
    Math.max(5, currentPage + 2)
  );
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
      {currentPage > 1 ? (
        <a href={hrefForPage(currentPage - 1)} className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/60 hover:bg-white/10 transition">← Назад</a>
      ) : null}
      {pages.map((p) => (
        <a key={p} href={hrefForPage(p)}
          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
            p === currentPage ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-[var(--color-accent)]" : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"
          }`}>{p}</a>
      ))}
      {currentPage < totalPages ? (
        <a href={hrefForPage(currentPage + 1)} className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/60 hover:bg-white/10 transition">Далі →</a>
      ) : null}
    </div>
  );
}
