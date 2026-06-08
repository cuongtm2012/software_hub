import { useLocation } from "wouter";
import { Plus, Briefcase, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProjectRow } from "@/components/dashboard/project-row";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { ProjectStatusFilterBar } from "@/components/dashboard/project-status-filter";
import { ProjectEmptyState } from "@/components/dashboard/project-empty-state";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { SectionPanel } from "@/components/design-system/section-panel";
import {
  DashboardProject,
  PROJECT_STATUS_FILTERS,
  ProjectStatusFilter,
} from "@/components/dashboard/types";

interface ProjectsTabProps {
  projects: DashboardProject[];
  projectStats: {
    total: number;
    active: number;
    quotes: number;
  };
  projectCounts: Record<ProjectStatusFilter, number>;
  status: ProjectStatusFilter;
  onStatusChange: (status: ProjectStatusFilter) => void;
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  showQuotesMetric?: boolean;
}

function getStatusLabel(status: ProjectStatusFilter) {
  return PROJECT_STATUS_FILTERS.find((f) => f.value === status)?.label ?? "Tất cả";
}

export function ProjectsTab({
  projects,
  projectStats,
  projectCounts,
  status,
  onStatusChange,
  isLoading,
  page,
  totalPages,
  totalItems,
  onPageChange,
  showQuotesMetric = true,
}: ProjectsTabProps) {
  const [, navigate] = useLocation();
  const statusLabel = getStatusLabel(status);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className={`grid gap-3 ${showQuotesMetric ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
        <MetricCard label="Tổng dự án" value={projectStats.total} icon={Briefcase} />
        <MetricCard label="Đang thực hiện" value={projectStats.active} icon={Clock} />
        {showQuotesMetric && (
          <MetricCard label="Báo giá" value={projectStats.quotes} icon={FileText} />
        )}
      </div>

      <SectionPanel
        title="Dự án của bạn"
        subtitle={
          isLoading
            ? "Đang tải…"
            : totalItems === 0
              ? `Không có dự án · ${statusLabel}`
              : `${totalItems} dự án · ${statusLabel}`
        }
        action={
          <Button
            size="sm"
            onClick={() => navigate("/request-project")}
            className="bg-[#004080] hover:bg-[#003366] w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tạo dự án
          </Button>
        }
        headerClassName="!p-4 sm:!px-5"
        className="!shadow-none border-0 rounded-none overflow-visible"
      >
        <div className="pb-4 border-b border-[#004080]/10 mb-4 -mt-1">
          <ProjectStatusFilterBar
            value={status}
            counts={projectCounts}
            onChange={onStatusChange}
          />
        </div>

        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : projects.length === 0 ? (
          <ProjectEmptyState
            status={status}
            onCreate={() => navigate("/request-project")}
            onViewAll={() => onStatusChange("all")}
          />
        ) : (
          <div className="space-y-2.5">
            {projects.map((project, index) => (
              <ProjectRow
                key={`${project.id}-${index}-${project.type ?? "p"}`}
                project={project}
              />
            ))}
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemLabel="dự án"
              isLoading={isLoading}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
