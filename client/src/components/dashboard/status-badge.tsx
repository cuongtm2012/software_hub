import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  "in-progress": "bg-amber-50 text-amber-800 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  draft: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  in_progress: "Đang làm",
  "in-progress": "Đang làm",
  completed: "Hoàn thành",
  approved: "Đã duyệt",
  cancelled: "Đã hủy",
  rejected: "Từ chối",
  draft: "Nháp",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status?.toLowerCase().replace(/\s/g, "_") || "pending";
  return (
    <Badge
      variant="outline"
      className={cn("font-normal capitalize", STATUS_STYLES[key] || STATUS_STYLES.pending)}
    >
      {STATUS_LABELS[key] || status.replace(/_/g, " ")}
    </Badge>
  );
}
