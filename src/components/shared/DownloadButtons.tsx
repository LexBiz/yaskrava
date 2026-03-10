/* Server Component — no event handlers needed */

import {getTranslations} from "next-intl/server";

import {APP_STORE_URL, PLAY_STORE_URL} from "@/lib/appLinks";
import {getCurrentDealer} from "@/lib/tenant";
import {SmartDownloadLink} from "@/components/shared/SmartDownloadLink";

const DEFAULT_APP_STORE_URL = APP_STORE_URL;
const DEFAULT_PLAY_STORE_URL = PLAY_STORE_URL;

function AppleLogo() {
  return (
    <svg width="18" height="22" viewBox="0 0 814 1000" fill="currentColor" aria-hidden>
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 680.5 0 583 0 528.3 0 339.4 117.8 244.3 233.4 244.3c63 0 115.4 41.8 155.5 41.8 38.4 0 98.4-44.3 170-44.3zm-222-73.4c30.4-36.3 52.5-87 52.5-137.7 0-7.1-.6-14.3-1.9-20.1-49.3 1.9-107.4 32.8-142.8 74.8-27.5 31.7-54.3 82.4-54.3 133.8 0 7.8 1.3 15.5 1.9 18 3.2.6 8.4 1.3 13.6 1.3 44.3 0 100.4-29.8 131-69.1z" />
    </svg>
  );
}

function PlayLogo() {
  return (
    <svg width="20" height="22" viewBox="0 0 48 52" fill="none" aria-hidden>
      <path d="M2 2L26 26L2 50V2Z" fill="#00D2FF" />
      <path d="M2 2L44 22L34 26L2 2Z" fill="#00F076" />
      <path d="M2 50L44 30L34 26L2 50Z" fill="#FF3D00" />
      <path d="M44 22L48 24L48 28L44 30L34 26L44 22Z" fill="#FFBC00" />
    </svg>
  );
}

interface Props {
  layout?: "row" | "col";
  className?: string;
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
}

export async function DownloadButtons({
  layout = "row",
  className = "",
  appStoreUrl,
  playStoreUrl,
}: Props) {
  const t = await getTranslations("DownloadButtons");
  const dealer = await getCurrentDealer();
  const resolvedAppStoreUrl =
    appStoreUrl || dealer?.appStoreUrl || DEFAULT_APP_STORE_URL;
  const resolvedPlayStoreUrl =
    playStoreUrl || dealer?.playStoreUrl || DEFAULT_PLAY_STORE_URL;

  return (
    <div
      className={`flex gap-3 ${layout === "col" ? "flex-col" : "flex-col xs:flex-row sm:flex-row flex-wrap"} ${className}`}
    >
      <SmartDownloadLink
        appStoreUrl={resolvedAppStoreUrl}
        playStoreUrl={resolvedPlayStoreUrl}
        className="store-btn w-full sm:w-auto"
      >
        <AppleLogo />
        <div>
          <div style={{ fontSize: "10px", opacity: 0.55, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1 }}>
            {t("appStoreTop")}
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
            {t("appStoreBottom")}
          </div>
        </div>
      </SmartDownloadLink>

      <SmartDownloadLink
        appStoreUrl={resolvedAppStoreUrl}
        playStoreUrl={resolvedPlayStoreUrl}
        className="store-btn w-full sm:w-auto"
      >
        <PlayLogo />
        <div>
          <div style={{ fontSize: "10px", opacity: 0.55, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1 }}>
            {t("playStoreTop")}
          </div>
          <div style={{ fontSize: "15px", fontWeight: 800, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
            {t("playStoreBottom")}
          </div>
        </div>
      </SmartDownloadLink>
    </div>
  );
}
