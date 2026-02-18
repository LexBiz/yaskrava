import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageHero({ eyebrow, title, subtitle, children, className }: Props) {
  return (
    <section
      className={cn("relative overflow-hidden border-b bg-black", className)}
      style={{ borderColor: "var(--border)" }}
    >
      {/* Subtle top-left radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 55% 60% at -5% -10%,
              rgba(6,193,103,0.07) 0%, transparent 65%)
          `,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 80% at 0% 0%, black 0%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-20">
        {eyebrow && (
          <span className="yask-badge mb-5 inline-block">{eyebrow}</span>
        )}

        <div className="section-accent-line mb-5" />

        <h1
          className="text-gradient-hero text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] max-w-3xl"
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-5 text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ color: "var(--text-2)" }}
          >
            {subtitle}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
