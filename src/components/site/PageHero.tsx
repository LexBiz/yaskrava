import {ReactNode} from "react";
import {cn} from "@/lib/cn";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageHero({eyebrow, title, subtitle, children, className}: Props) {
  return (
    <section
      className={cn("relative overflow-hidden border-b", className)}
      style={{
        background: "var(--color-bg)",
        borderColor: "var(--border)",
        backgroundImage:
          "radial-gradient(ellipse 60% 70% at -8% -12%, rgba(254,147,2,0.09) 0%, transparent 60%)," +
          "radial-gradient(ellipse 35% 45% at 100% 100%, rgba(255,90,42,0.05) 0%, transparent 55%)",
      }}
    >
      {/* Warm grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,200,120,1) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,200,120,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: 0.017,
          maskImage: "radial-gradient(ellipse 65% 75% at 0% 0%, black 0%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-14 sm:py-20">
        {eyebrow && (
          <span className="yask-badge mb-5 inline-block">{eyebrow}</span>
        )}

        {/* Accent line */}
        <div className="section-accent-line mb-5" />

        <h1
          className="font-black tracking-[-0.02em] leading-[1.05] max-w-3xl"
          style={{
            fontSize: "clamp(2.2rem, 4.4vw, 4rem)",
            background: "linear-gradient(175deg, #FFFFFF 5%, rgba(255,235,200,0.58) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-5 text-base sm:text-[17px] leading-relaxed max-w-2xl font-medium"
            style={{color: "var(--text-2)"}}
          >
            {subtitle}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
