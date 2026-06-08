import { useLocation } from "wouter";
import { CalendarDays, Clock } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DashboardProject } from "@/components/dashboard/types";
import { formatDateVi, formatVnd, getProjectDescription, getProjectTitle } from "@/components/dashboard/format";

interface ProjectRowProps {
  project: DashboardProject;
}

export function ProjectRow({ project }: ProjectRowProps) {
  const [, navigate] = useLocation();

  const budget = project.budget ? parseFloat(project.budget) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      className="group flex flex-col gap-2.5 p-4 border rounded-lg bg-background hover:bg-[#004080]/[0.03] hover:border-[#004080]/25 transition-colors cursor-pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/projects/${project.id}`)}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-foreground group-hover:text-[#004080] transition-colors">
            {getProjectTitle(project)}
          </h4>
          {project.email && (
            <p className="text-xs text-muted-foreground mt-0.5">Liên hệ: {project.email}</p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{getProjectDescription(project)}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {project.created_at && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Tạo: {formatDateVi(project.created_at)}
          </span>
        )}
        {budget != null && !Number.isNaN(budget) && (
          <span className="font-medium text-emerald-700">{formatVnd(budget)}</span>
        )}
        {project.deadline && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Hạn: {formatDateVi(project.deadline)}
          </span>
        )}
      </div>
    </div>
  );
}
