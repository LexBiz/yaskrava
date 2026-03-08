import Image from "next/image";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";

export function CinematicPhoto() {
  const t = useTranslations("Home");

  return (
    <section
      className="section-charcoal py-16 sm:py-24"
      style={{
        background: "#3B3B3D",
        overflow: "hidden",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">

          {/* ── LEFT: Text ───────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="h-0.5 w-8 rounded-full" style={{background: "linear-gradient(90deg,#FF7918,#FF9902)"}}/>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{color: "rgba(255,255,255,0.45)"}}>
                FLEET
              </span>
            </div>

            <h2
              className="font-black leading-tight text-white"
              style={{
                fontSize: "clamp(2rem, 3.8vw, 3.4rem)",
                letterSpacing: "-0.025em",
              }}
            >
              {t("fleetVisualTitle")}{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #FF7918 0%, #FF9902 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("fleetVisualAccent")}
              </span>
            </h2>

            <p
              className="mt-5 text-base font-medium max-w-md leading-relaxed"
              style={{color: "rgba(255,255,255,0.60)"}}
            >
              {t("fleetVisualText")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full font-bold text-white text-sm hover:brightness-110 transition-all"
                style={{
                  background: "linear-gradient(135deg, #FF7918, #FF9902)",
                  boxShadow: "0 4px 24px -6px rgba(255,121,24,0.70)",
                }}
              >
                {t("fleetVisualPrimary")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full font-semibold text-white text-sm transition-all"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.20)",
                  color: "rgba(255,255,255,0.80)",
                }}
              >
                {t("fleetVisualSecondary")}
              </Link>
            </div>
          </div>

          {/* ── RIGHT: 3D "photo in space" ────────────────── */}
          <div
            className="relative flex items-center justify-center"
            style={{
              /* enough breathing room for shadows to show */
              padding: "32px 24px 48px",
            }}
          >
            {/* === AMBIENT GLOW POOL below the image === */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: 0,
                left: "15%",
                right: "15%",
                height: 80,
                background: "radial-gradient(ellipse, rgba(255,121,24,0.45) 0%, transparent 72%)",
                filter: "blur(20px)",
                borderRadius: "50%",
              }}
            />

            {/* === THE 3D IMAGE: tilted like a photo on a table === */}
            <div
              style={{
                /* Perspective tilt: slight upward angle + left lean */
                transform:
                  "perspective(1100px) rotateX(8deg) rotateY(6deg) rotateZ(-1.5deg)",
                transformStyle: "preserve-3d",
                /* Long multi-layer shadow gives physical depth */
                boxShadow:
                  /* Contact shadow right under */
                  "0 4px 12px rgba(0,0,0,0.55)," +
                  /* Mid shadow */
                  "0 16px 40px rgba(0,0,0,0.55)," +
                  /* Distant shadow */
                  "0 40px 80px rgba(0,0,0,0.45)," +
                  /* Orange glow edge */
                  "0 0 0 2px rgba(255,121,24,0.25)," +
                  /* Ambient orange light */
                  "-8px 8px 40px rgba(255,121,24,0.16)",
                borderRadius: 16,
                overflow: "hidden",
                /* Prevents image overflow */
                position: "relative",
                lineHeight: 0,
              }}
            >
              <Image
                src="/Photo1.jpg"
                alt="Yaskrava fleet — автомобілі в дорозі"
                width={680}
                height={383}
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  maxWidth: 560,
                }}
              />

              {/* Top-edge specular glare (glass/laminate reflection) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(175deg, rgba(255,255,255,0.14) 0%, transparent 28%)",
                  borderRadius: 16,
                }}
              />

              {/* Bottom vignette to anchor the image */}
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                  height: "25%",
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.32) 100%)",
                  borderRadius: "0 0 16px 16px",
                }}
              />
            </div>

            {/* === PHYSICAL SHADOW CAST on "floor" === */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: 8,
                left: "10%",
                right: "10%",
                height: 24,
                background:
                  "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 72%)",
                filter: "blur(12px)",
                transform: "scaleX(0.85)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
