import {adminLogoutAction, deleteApplicationAction, setAdminNoteAction, setApplicationStatusAction, toggleArchivedAction} from "@/app/admin/actions";
import {requireAdmin} from "@/lib/adminAuth";
import {prisma} from "@/lib/prisma";

const STATUS_OPTIONS = [
  "NEW",
  "IN_REVIEW",
  "NEED_INFO",
  "CONTACTED",
  "APPROVED",
  "REJECTED",
] as const;

export default async function AdminDashboard() {
  await requireAdmin();

  const applications = await prisma.application.findMany({
    orderBy: {createdAt: "desc"},
    take: 200,
  });

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white/60">YASKRAVA • CRM</div>
            <h1 className="mt-2 text-2xl font-semibold">Applications</h1>
            <p className="mt-1 text-sm text-white/60">
              Total: {applications.length}
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

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
          <div className="grid grid-cols-12 gap-0 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-white/70">
            <div className="col-span-3">Client</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Archived</div>
            <div className="col-span-2 text-right">Actions</div>
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
                      {a.message ? (
                        <div className="mt-2 line-clamp-3 text-xs leading-5 text-white/60">
                          {a.message}
                        </div>
                      ) : null}
                    </div>

                    <div className="col-span-12 md:col-span-3 text-sm text-white/80">
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

