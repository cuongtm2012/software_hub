import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onRefresh?: () => void;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
}

export function DashboardShell({
  title,
  subtitle,
  badge,
  onRefresh,
  actions,
  children,
  className,
  icon: Icon,
}: DashboardShellProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/60 pb-5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#004080]/10 text-[#004080]">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              aria-label="Làm mới dữ liệu"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}
