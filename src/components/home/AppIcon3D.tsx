"use client";

import Image from "next/image";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";

export function AppIcon3D() {
  const t = useTranslations("Home");

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-8">

      {/* === FLOOR GLOW (cast light from icon onto surface) === */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 20,
          left: "50%",
          width: "min(260px, 72vw)",
          height: 50,
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse, rgba(255,121,24,0.55) 0%, transparent 72%)",
          filter: "blur(18px)",
        }}
      />

      {/* === 3D ICON: like an app icon sitting on a table, viewed from slight above-right === */}
      <div
        className="relative"
        style={{
          /* Core 3D perspective tilt */
          transform:
            "perspective(900px) rotateX(18deg) rotateY(-22deg) rotateZ(2deg)",
          transformStyle: "preserve-3d",
          /* Multi-level shadow = depth illusion */
          filter:
            "drop-shadow(0 2px 0px rgba(180,60,0,0.70)) " +
            "drop-shadow(0 6px 12px rgba(0,0,0,0.75)) " +
            "drop-shadow(0 20px 40px rgba(0,0,0,0.65)) " +
            "drop-shadow(0 0 50px rgba(255,121,24,0.40))",
          /* Tiny upward float to sit above "surface" */
          marginBottom: 8,
        }}
      >
        {/* Icon image */}
        <div
          style={{
            width: "min(180px, 52vw)",
            aspectRatio: "1 / 1",
            borderRadius: 40,
            overflow: "hidden",
            position: "relative",
            /* Inset border — gives physical edge feel */
            outline: "1.5px solid rgba(255,255,255,0.16)",
            outlineOffset: "-1.5px",
          }}
        >
          <Image
            src="/Logo.png"
            alt="Yaskrava"
            width={180}
            height={180}
            priority
            style={{width: "100%", height: "100%", objectFit: "cover", display: "block"}}
          />

          {/* Top-left specular glare (light hitting the glass/screen) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 45%)",
              borderRadius: 40,
            }}
          />

          {/* Bottom-right ambient bounce light */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(315deg, rgba(255,153,2,0.14) 0%, transparent 45%)",
              borderRadius: 40,
            }}
          />
        </div>

        {/* === SIDE FACE (bottom edge, gives 3D thickness) === */}
        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: 8,
            right: 8,
            height: 12,
            borderRadius: "0 0 28px 28px",
            background: "linear-gradient(180deg, rgba(180,60,0,0.90) 0%, rgba(120,30,0,0.70) 100%)",
            transform: "rotateX(-90deg) translateZ(-6px)",
            transformOrigin: "top center",
          }}
        />

        {/* === RIGHT FACE (gives 3D thickness) === */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: -10,
            bottom: 8,
            width: 12,
            borderRadius: "0 28px 28px 0",
            background: "linear-gradient(90deg, rgba(200,70,0,0.80) 0%, rgba(140,40,0,0.60) 100%)",
            transform: "rotateY(90deg) translateZ(-6px)",
            transformOrigin: "left center",
          }}
        />
      </div>

      {/* === REFLECTION (mirror image below, fading out) === */}
      <div
        className="relative pointer-events-none"
        style={{
          width: "min(180px, 52vw)",
          height: 60,
          overflow: "hidden",
          transform: "perspective(900px) rotateX(18deg) rotateY(-22deg) rotateZ(2deg) scaleY(-1)",
          opacity: 0.18,
          filter: "blur(4px)",
          marginTop: -8,
        }}
      >
        <Image
          src="/Logo.png"
          alt=""
          aria-hidden="true"
          width={180}
          height={60}
          style={{width: "100%", height: 180, objectFit: "cover", display: "block", marginTop: -120}}
        />
        {/* Fade out reflection */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(59,59,61,0) 0%, rgba(59,59,61,1) 100%)",
          }}
        />
      </div>

      {/* CTA link */}
      <Link
        href="/apply"
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white rounded-full px-6 py-2.5 transition-all hover:brightness-110"
        style={{
          background: "linear-gradient(135deg, #FF7918, #FF9902)",
          boxShadow: "0 4px 20px -6px rgba(255,121,24,0.70)",
        }}
      >
        {t("downloadAppCta")}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </Link>
    </div>
  );
}
