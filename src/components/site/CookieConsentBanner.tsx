"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

const COOKIE_KEY = "yaskrava_cookie_consent";

function persistConsent(value: "accepted" | "declined") {
  const maxAge = 60 * 60 * 24 * 180;
  document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  localStorage.setItem(COOKIE_KEY, value);
}

export function CookieConsentBanner() {
  const t = useTranslations("CookieBanner");
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const localValue = localStorage.getItem(COOKIE_KEY);
    const cookieValue = document.cookie.includes(`${COOKIE_KEY}=`);
    return !localValue && !cookieValue;
  });

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-[rgba(44,44,46,0.96)] p-4 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.55)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">{t("title")}</p>
          <p className="mt-2 text-sm leading-6 text-white/68">
            {t("text")}{" "}
            <Link href="/legal/cookies" className="font-semibold text-[#FF9902] hover:underline">
              {t("learnMore")}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              persistConsent("declined");
              setVisible(false);
            }}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white"
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={() => {
              persistConsent("accepted");
              setVisible(false);
            }}
            className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-white transition hover:brightness-105"
            style={{
              background: "linear-gradient(135deg, #FF7918, #FF9902)",
              boxShadow: "0 4px 18px -6px rgba(255,121,24,0.55)",
            }}
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
