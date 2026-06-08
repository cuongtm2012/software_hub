import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#004080]/10 bg-card p-4 sm:p-5 shadow-sm uupm-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-600" : "text-red-600",
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% so với tháng trước
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#004080]/8 text-[#004080]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
