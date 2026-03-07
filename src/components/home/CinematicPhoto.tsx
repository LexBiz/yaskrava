import Image from "next/image";
import {Link} from "@/i18n/navigation";

export function CinematicPhoto() {
  return (
    <section
      className="relative overflow-hidden"
      style={{background: "#2C2C2E", minHeight: 520}}
    >
      {/* ── Full bleed photo with pan animation ── */}
      <div
        className="photo-cinematic absolute inset-0"
        style={{zIndex: 1}}
      >
        <Image
          src="/Photo1.jpg"
          alt="Yaskrava fleet"
          fill
          priority
          sizes="100vw"
          style={{objectFit: "cover", objectPosition: "center 40%"}}
        />
      </div>

      {/* ── Multi-layer overlay system ── */}

      {/* Dark vignette left edge */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(100deg, rgba(44,44,46,0.92) 0%, rgba(44,44,46,0.70) 30%, rgba(44,44,46,0.10) 58%, transparent 75%)",
        }}
      />

      {/* Orange gradient bottom sweep */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          zIndex: 3,
          height: "45%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,121,24,0.08) 60%, rgba(255,121,24,0.22) 100%)",
        }}
      />

      {/* Bottom border accent */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{zIndex: 4, height: 4, background: "linear-gradient(90deg, #FF7918 0%, #FF9902 100%)"}}
      />

      {/* ── 3D perspective content ── */}
      <div
        className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20"
        style={{zIndex: 10, perspective: 1200}}
      >
        <div
          style={{
            transform: "perspective(1200px) rotateY(2deg) rotateX(1.5deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <div
              className="h-0.5 w-8 rounded-full"
              style={{background: "linear-gradient(90deg,#FF7918,#FF9902)"}}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{color: "rgba(255,255,255,0.55)"}}
            >
              FLEET
            </span>
          </div>

          {/* Headline with depth */}
          <h2
            className="font-black leading-tight text-white"
            style={{
              fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
              maxWidth: 560,
              textShadow: "0 4px 40px rgba(0,0,0,0.80), 0 2px 8px rgba(0,0,0,0.60)",
              letterSpacing: "-0.025em",
            }}
          >
            Автомобілі —
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF7918 0%, #FF9902 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 30px rgba(255,121,24,0.60))",
              }}
            >
              в дорозі та на місці
            </span>
          </h2>

          <p
            className="mt-5 text-base font-medium max-w-md"
            style={{
              color: "rgba(255,255,255,0.72)",
              textShadow: "0 2px 12px rgba(0,0,0,0.60)",
            }}
          >
            Актуальний каталог автомобілів — які вже у нас на майданчику і які ще в дорозі.
            Зручне фінансування та лізинг прямо в застосунку.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/fleet"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full font-bold text-white text-sm transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #FF7918, #FF9902)",
                boxShadow: "0 4px 28px -6px rgba(255,121,24,0.70), 0 1px 0 rgba(255,255,255,0.20) inset",
              }}
            >
              Переглянути автомобілі
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full font-semibold text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1.5px solid rgba(255,255,255,0.28)",
                color: "#FFFFFF",
                backdropFilter: "blur(8px)",
              }}
            >
              Розрахувати лізинг
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
