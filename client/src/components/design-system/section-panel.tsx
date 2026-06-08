import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionPanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}

export function SectionPanel({
  title,
  subtitle,
  action,
  children,
  className,
  headerClassName,
}: SectionPanelProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#004080]/10 bg-card shadow-sm overflow-hidden uupm-card",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-b border-[#004080]/10 bg-gradient-to-r from-[#004080]/6 to-transparent",
          headerClassName,
        )}
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
