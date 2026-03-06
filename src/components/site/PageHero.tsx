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
        background: "linear-gradient(160deg, #3D2A12 0%, #2F1F0C 40%, #251809 100%)",
        borderColor: "rgba(255,170,60,0.12)",
      }}
    >
      {/* Orange glow top-left */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at -10% -15%, rgba(254,147,2,0.16) 0%, transparent 60%)," +
            "radial-gradient(ellipse 40% 50% at 100% 100%, rgba(255,90,42,0.08) 0%, transparent 55%)",
        }}
      />
      {/* Warm grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,200,100,1) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,200,100,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: 0.020,
          maskImage: "radial-gradient(ellipse 65% 75% at 0% 0%, black 0%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-14 sm:py-20">
        {eyebrow && <span className="yask-badge mb-5 inline-block">{eyebrow}</span>}
        <div className="section-accent-line mb-5" />
        <h1
          className="font-black tracking-[-0.02em] leading-[1.05] max-w-3xl"
          style={{
            fontSize: "clamp(2.2rem, 4.4vw, 4rem)",
            background: "linear-gradient(175deg, #FFFFFF 0%, rgba(255,235,190,0.60) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-base sm:text-[17px] leading-relaxed max-w-2xl font-medium"
            style={{color: "var(--text-2)"}}>
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
