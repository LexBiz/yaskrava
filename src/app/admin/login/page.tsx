import {adminLoginAction} from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{error?: string | string[]}>;
}) {
  const {error} = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;

  const errorMessage =
    errorCode === "rate"
      ? "Забагато спроб входу. Спробуйте трохи пізніше."
      : errorCode
        ? "Невірний email або пароль."
        : null;

  return (
    <div className="min-h-dvh px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-[rgba(255,180,80,0.14)] bg-white/[0.03] p-8">
          <div className="text-sm font-semibold text-white">YASKRAVA • CRM</div>
          <h1 className="mt-3 text-2xl font-semibold">Вхід до центральної CRM</h1>
          <p className="mt-2 text-sm text-white/70">
            Увійдіть під платформеним акаунтом, щоб керувати дилерами, заявками та кейсами фінансування.
          </p>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          <form action={adminLoginAction} className="mt-6 grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Email</span>
              <input
                name="email"
                type="email"
                className="h-12 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none ring-0 placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
                placeholder="admin@yaskrava.local"
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Пароль</span>
              <input
                name="password"
                type="password"
                className="h-12 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none ring-0 placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
                placeholder="Ваш пароль"
                required
              />
            </label>

            <button
              type="submit"
              className="mt-2 h-12 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-black transition hover:brightness-95"
            >
              Увійти
            </button>
          </form>
        </div>
        <div className="mt-6 text-xs text-white/40">
          Акаунти seed-яться через <code className="text-white/60">ADMIN_EMAIL</code>,{" "}
          <code className="text-white/60">ADMIN_PASSWORD</code> та seed-дані дилерських ролей.
        </div>
      </div>
    </div>
  );
}

