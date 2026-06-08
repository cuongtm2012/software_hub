import { cn } from "@/lib/utils";
import {
  PROJECT_STATUS_FILTERS,
  ProjectStatusFilter,
} from "@/components/dashboard/types";

interface ProjectStatusFilterProps {
  value: ProjectStatusFilter;
  counts: Record<ProjectStatusFilter, number>;
  onChange: (status: ProjectStatusFilter) => void;
}

export function ProjectStatusFilterBar({ value, counts, onChange }: ProjectStatusFilterProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
      role="tablist"
      aria-label="Lọc dự án theo trạng thái"
    >
      {PROJECT_STATUS_FILTERS.map((filter) => {
        const isActive = value === filter.value;
        const count = counts[filter.value];

        return (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.value)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#004080] text-white border-[#004080] shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-[#004080]/30 hover:text-foreground",
            )}
          >
            {filter.label}
            <span
              className={cn(
                "min-w-[1.25rem] text-center text-xs tabular-nums rounded-full px-1.5 py-0.5 leading-none",
                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
