import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: ReactNode;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
  /** default: title left + actions right (marketplace). centered: landing hero */
  align?: "default" | "centered";
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  badge,
  actions,
  align = "default",
  className,
}: PageHeroProps) {
  const isCentered = align === "centered";

  return (
    <section
      className={cn(
        "relative overflow-hidden text-white",
        "bg-gradient-to-br from-[#004080] via-[#003566] to-slate-900",
        className,
      )}
    >
      {/* Soft brand glow — no busy patterns */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,204,0,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(255,255,255,0.06), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />

      <div
        className={cn(
          "relative w-full px-[4%]",
          isCentered ? "py-14 sm:py-20 lg:py-24" : "py-8 sm:py-10",
        )}
      >
        <div
          className={cn(
            "flex gap-6",
            isCentered
              ? "flex-col items-center text-center"
              : "flex-col sm:flex-row sm:items-end sm:justify-between",
          )}
        >
          <div className={cn("space-y-4", isCentered && "max-w-3xl")}>
            {badge && (
              <span className="inline-flex items-center rounded-full border border-[#ffcc00]/35 bg-[#ffcc00]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#ffcc00]">
                {badge}
              </span>
            )}
            <div className="space-y-3">
              <h1
                className={cn(
                  "font-bold tracking-tight text-balance",
                  isCentered
                    ? "text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-slate-50"
                    : "text-2xl sm:text-3xl text-white",
                )}
              >
                {isCentered ? (
                  <span className="inline-block">
                    {title}
                  </span>
                ) : (
                  title
                )}
              </h1>
              {subtitle && (
                <p
                  className={cn(
                    "text-white/80 leading-relaxed",
                    isCentered
                      ? "text-base sm:text-lg max-w-2xl mx-auto"
                      : "text-sm sm:text-base max-w-2xl",
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div
              className={cn(
                "flex flex-wrap gap-3 shrink-0",
                isCentered && "justify-center pt-1",
              )}
            >
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Wave divider into page content */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 overflow-hidden" aria-hidden>
        <svg viewBox="0 0 1440 48" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M0,24 C360,48 720,0 1440,24 L1440,48 L0,48 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
