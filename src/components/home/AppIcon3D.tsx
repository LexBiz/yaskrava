"use client";

import Image from "next/image";
import {Link} from "@/i18n/navigation";

export function AppIcon3D() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none">

      {/* Ambient glow behind */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 260,
          height: 260,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(255,121,24,0.55) 0%, rgba(255,153,2,0.30) 35%, transparent 72%)",
          filter: "blur(40px)",
          animation: "glow-pulse 4s ease-in-out infinite",
        }}
      />

      {/* 3D floating icon wrapper */}
      <div className="app-icon-3d">
        <div
          className="relative overflow-hidden"
          style={{
            width: 200,
            height: 200,
            borderRadius: 44,
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.18) inset," +
              "0 0 0 2px rgba(255,121,24,0.35) inset," +
              "0 32px 80px rgba(0,0,0,0.80)," +
              "0 8px 24px rgba(255,121,24,0.40)",
          }}
        >
          <Image
            src="/Logo.png"
            alt="Yaskrava App"
            width={200}
            height={200}
            priority
            style={{width: "100%", height: "100%", objectFit: "cover"}}
          />

          {/* Specular highlight — top-left glare */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: "52%",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.24) 0%, transparent 60%)",
              borderRadius: "44px 44px 0 0",
            }}
          />

          {/* Right edge light (from perspective tilt) */}
          <div
            className="absolute right-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: 14,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12))",
              borderRadius: "0 44px 44px 0",
            }}
          />

          {/* Shimmer sweep */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{borderRadius: 44}}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 48%, transparent 100%)",
                animation: "reflect-shimmer 5s 1s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Ground shadow / reflection */}
        <div className="app-icon-reflection" />
      </div>

      {/* Label */}
      <Link
        href="/apply"
        className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-white rounded-full px-5 py-2.5 transition-all hover:brightness-110"
        style={{
          background: "linear-gradient(135deg, #FF7918, #FF9902)",
          boxShadow: "0 4px 20px -6px rgba(255,121,24,0.70)",
        }}
      >
        Завантажити застосунок
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </Link>
    </div>
  );
}
