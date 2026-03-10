import {dealerLoginAction} from "@/app/dealer/actions";
import {dealerCrmCopy, resolveDealerCrmLocale} from "@/lib/crmCopy";
import {getCurrentDealerOrThrow} from "@/lib/tenant";
import Link from "next/link";

export default async function DealerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{error?: string | string[]; lang?: string | string[]}>;
}) {
  const dealer = await getCurrentDealerOrThrow();
  const {error, lang} = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;
  const locale = resolveDealerCrmLocale(Array.isArray(lang) ? lang[0] : lang);
  const t = dealerCrmCopy[locale];

  const errorMessage =
    errorCode === "rate"
      ? t.errorRate
      : errorCode === "dealer"
        ? t.errorDealer
        : errorCode
          ? t.errorCredentials
          : null;

  return (
    <div className="min-h-dvh px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-[rgba(255,180,80,0.14)] bg-white/[0.03] p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-white/50">{t.language}</div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link href="/dealer/login?lang=uk" className={locale === "uk" ? "text-white" : "text-white/45"}>UKR</Link>
              <Link href="/dealer/login?lang=cs" className={locale === "cs" ? "text-white" : "text-white/45"}>CS</Link>
            </div>
          </div>
          <div className="text-sm font-semibold text-white">
            {dealer.name} • {t.eyebrow}
          </div>
          <h1 className="mt-3 text-2xl font-semibold">{t.loginTitle}</h1>
          <p className="mt-2 text-sm text-white/70">
            {t.loginText}
          </p>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          <form action={dealerLoginAction} className="mt-6 grid gap-3">
            <input type="hidden" name="lang" value={locale} />
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.email}</span>
              <input
                name="email"
                type="email"
                className="h-12 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none ring-0 placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
                placeholder={t.emailPlaceholder}
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-white/70">{t.password}</span>
              <input
                name="password"
                type="password"
                className="h-12 rounded-2xl border border-[rgba(255,180,80,0.14)] bg-[rgba(50,32,8,0.70)] px-4 text-sm text-white outline-none ring-0 placeholder:text-white/30 focus:border-[rgba(255,180,80,0.28)]"
                placeholder={t.passwordPlaceholder}
                required
              />
            </label>

            <button
              type="submit"
              className="mt-2 h-12 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-black transition hover:brightness-95"
            >
              {t.signIn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
