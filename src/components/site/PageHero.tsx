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
          "radial-gradient(ellipse 55% 65% at -5% -10%, rgba(255,121,24,0.08) 0%, transparent 65%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: 0.020,
          maskImage: "radial-gradient(ellipse 70% 80% at 0% 0%, black 0%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-14 sm:py-20">
        {eyebrow && (
          <span className="yask-badge mb-5 inline-block">{eyebrow}</span>
        )}

        <div className="section-accent-line mb-5" />

        <h1
          className="font-black tracking-tight leading-[1.05] max-w-3xl"
          style={{
            fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
            background: "linear-gradient(175deg, #ffffff 10%, rgba(255,255,255,0.55) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-5 text-base sm:text-lg leading-relaxed max-w-2xl font-medium"
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
