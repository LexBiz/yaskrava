import {ReactNode} from "react";
import {cn} from "@/lib/cn";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  variant?: "charcoal" | "orange" | "gradient";
};

export function PageHero({eyebrow, title, subtitle, children, className, variant = "charcoal"}: Props) {
  const isOrange = variant === "orange" || variant === "gradient";

  return (
    <section
      className={cn("relative overflow-hidden border-b", className)}
      style={{
        background:
          variant === "gradient"
            ? "linear-gradient(135deg, #FF7918 0%, #FF9902 100%)"
            : variant === "orange"
              ? "#FF7918"
              : "#3B3B3D",
        borderColor: isOrange ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
      }}
    >
      {/* Noise + grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: isOrange ? 0.06 : 0.04,
          maskImage: "radial-gradient(ellipse 70% 80% at 5% 5%, black 0%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-14 sm:py-20">
        {eyebrow && (
          <span
            className={cn("mb-5 inline-block", isOrange ? "yask-badge-on-orange" : "yask-badge")}
          >
            {eyebrow}
          </span>
        )}

        <div
          className="w-8 h-[3px] rounded-full mb-5"
          style={{
            background: isOrange ? "rgba(255,255,255,0.75)" : "linear-gradient(90deg,#FF7918,#FF9902)",
            boxShadow: isOrange ? "0 0 12px rgba(255,255,255,0.45)" : "0 0 14px rgba(255,121,24,0.60)",
          }}
        />

        <h1
          className="font-black tracking-[-0.02em] leading-[1.05] max-w-3xl"
          style={{
            fontSize: "clamp(2.2rem, 4.4vw, 4rem)",
            color: "#FFFFFF",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-5 text-base sm:text-[17px] leading-relaxed max-w-2xl font-medium"
            style={{color: isOrange ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.65)"}}
          >
            {subtitle}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
