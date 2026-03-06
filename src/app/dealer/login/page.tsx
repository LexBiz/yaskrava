import {dealerLoginAction} from "@/app/dealer/actions";
import {getCurrentDealerOrThrow} from "@/lib/tenant";

export default async function DealerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{error?: string | string[]}>;
}) {
  const dealer = await getCurrentDealerOrThrow();
  const {error} = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;

  const errorMessage =
    errorCode === "rate"
      ? "Too many login attempts. Please wait a bit."
      : errorCode === "dealer"
        ? "This account is not assigned to the current dealer."
        : errorCode
          ? "Invalid email or password."
          : null;

  return (
    <div className="min-h-dvh px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-[rgba(255,180,80,0.14)] bg-white/[0.03] p-8">
          <div className="text-sm font-semibold text-white">
            {dealer.name} • Dealer CRM
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Dealer login</h1>
          <p className="mt-2 text-sm text-white/70">
            Sign in to manage your own vehicles, leads and financing statuses.
          </p>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          <form action={dealerLoginAction} className="mt-6 grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Email</span>
              <input
                name="email"
                type="email"
                className="h-12 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none ring-0 placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
                placeholder="dealer@yaskrava.local"
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">Password</span>
              <input
                name="password"
                type="password"
                className="h-12 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none ring-0 placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
                placeholder="Your password"
                required
              />
            </label>

            <button
              type="submit"
              className="mt-2 h-12 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-black transition hover:brightness-95"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
