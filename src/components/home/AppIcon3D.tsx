"use client";

import Image from "next/image";
import {useTranslations} from "next-intl";
import {SmartDownloadLink} from "@/components/shared/SmartDownloadLink";
import {APP_STORE_URL, PLAY_STORE_URL} from "@/lib/appLinks";

export function AppIcon3D() {
  const t = useTranslations("Home");

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-1 sm:py-6">

      {/* === AMBIENT GLOW — soft orange haze around icon, no hard shadow === */}
      <div
        className="absolute pointer-events-none"
        aria-hidden
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          width: "min(320px, 88vw)",
          height: "min(320px, 88vw)",
          background:
            "radial-gradient(ellipse 60% 60% at 42% 46%, rgba(255,121,24,0.28) 0%, rgba(255,153,2,0.14) 40%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />

      {/* === 3D ICON: tilted like a physical app icon in space === */}
      <div
        className="relative z-10"
        style={{
          transform:
            "perspective(900px) rotateX(14deg) rotateY(-18deg) rotateZ(1.5deg)",
          transformStyle: "preserve-3d",
          /* Clean light glow — NO dark shadow underneath */
          filter:
            "drop-shadow(0 0 32px rgba(255,121,24,0.38)) " +
            "drop-shadow(0 0 14px rgba(255,153,2,0.25)) " +
            "drop-shadow(4px -4px 12px rgba(255,255,255,0.06))",
          animation: "float3d 5s ease-in-out infinite",
          willChange: "transform",
        }}
      >
        {/* Icon image — main face */}
        <div
          style={{
            width: "min(190px, 54vw)",
            aspectRatio: "1 / 1",
            borderRadius: 44,
            overflow: "hidden",
            position: "relative",
            /* Bright edge border — simulates glass edge */
            outline: "1.5px solid rgba(255,255,255,0.22)",
            outlineOffset: "-1.5px",
            /* Inner glow to simulate screen backlight */
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.12), " +
              "inset 0 2px 8px rgba(255,200,100,0.12)",
          }}
        >
          <Image
            src="/Logo.png"
            alt="Yaskrava"
            width={190}
            height={190}
            priority
            style={{width: "100%", height: "100%", objectFit: "cover", display: "block"}}
          />

          {/* Top-left specular — sharp light hitting the top corner */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: 0,
              background:
                "linear-gradient(140deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.06) 28%, transparent 48%)",
              borderRadius: 44,
            }}
          />

          {/* Bottom edge rim light — warm orange bounce */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: 0, left: 0, right: 0,
              height: "40%",
              background:
                "linear-gradient(180deg, transparent 0%, rgba(255,121,24,0.10) 100%)",
              borderRadius: "0 0 44px 44px",
            }}
          />
        </div>

        {/* === BOTTOM FACE — gives physical thickness without dark shadow === */}
        <div
          style={{
            position: "absolute",
            bottom: -9,
            left: 10,
            right: 10,
            height: 10,
            borderRadius: "0 0 26px 26px",
            background: "linear-gradient(180deg, rgba(200,80,0,0.70) 0%, rgba(150,50,0,0.45) 100%)",
            transform: "rotateX(-90deg) translateZ(-5px)",
            transformOrigin: "top center",
          }}
        />

        {/* === RIGHT FACE — physical thickness === */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: -9,
            bottom: 10,
            width: 10,
            borderRadius: "0 26px 26px 0",
            background: "linear-gradient(90deg, rgba(220,90,0,0.65) 0%, rgba(160,55,0,0.45) 100%)",
            transform: "rotateY(90deg) translateZ(-5px)",
            transformOrigin: "left center",
          }}
        />
      </div>

      {/* === REFLECTION — very subtle, no heavy shadow === */}
      <div
        className="pointer-events-none z-10"
        style={{
          width: "min(190px, 54vw)",
          height: 40,
          overflow: "hidden",
          transform:
            "perspective(900px) rotateX(14deg) rotateY(-18deg) rotateZ(1.5deg) scaleY(-1)",
          opacity: 0.12,
          filter: "blur(3px)",
          marginTop: -6,
        }}
        aria-hidden
      >
        <Image
          src="/Logo.png"
          alt=""
          width={190}
          height={40}
          style={{width: "100%", height: 190, objectFit: "cover", display: "block", marginTop: -150}}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(59,59,61,0.1) 0%, rgba(59,59,61,1) 100%)",
          }}
        />
      </div>

      {/* CTA link */}
      <SmartDownloadLink
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white rounded-full px-6 py-2.5 transition-all hover:brightness-110 sm:mt-8"
        style={{
          background: "linear-gradient(135deg, #FF7918, #FF9902)",
          boxShadow: "0 4px 24px -6px rgba(255,121,24,0.60)",
        }}
      >
        {t("downloadAppCta")}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </SmartDownloadLink>
    </div>
  );
}
