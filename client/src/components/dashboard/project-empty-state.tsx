import {
  Briefcase,
  CheckCircle2,
  Clock,
  Inbox,
  XCircle,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectStatusFilter } from "@/components/dashboard/types";

interface ProjectEmptyStateProps {
  status: ProjectStatusFilter;
  onCreate: () => void;
  onViewAll: () => void;
}

const CONFIG: Record<
  ProjectStatusFilter,
  { icon: LucideIcon; title: string; description: string; showCreate?: boolean; showViewAll?: boolean }
> = {
  all: {
    icon: Briefcase,
    title: "Chưa có dự án nào",
    description: "Gửi yêu cầu dự án để nhận báo giá từ developer trên Software Hub.",
    showCreate: true,
  },
  pending: {
    icon: Inbox,
    title: "Không có dự án chờ xử lý",
    description: "Các yêu cầu mới sau khi gửi sẽ xuất hiện tại đây.",
    showViewAll: true,
  },
  in_progress: {
    icon: Clock,
    title: "Chưa có dự án đang thực hiện",
    description: "Khi developer bắt đầu làm, dự án sẽ chuyển sang trạng thái này.",
    showViewAll: true,
  },
  completed: {
    icon: CheckCircle2,
    title: "Chưa có dự án hoàn thành",
    description: "Các dự án đã bàn giao sẽ được lưu tại đây để bạn tra cứu.",
    showViewAll: true,
  },
  cancelled: {
    icon: XCircle,
    title: "Không có dự án đã hủy",
    description: "Không có yêu cầu nào bị hủy — bạn có thể yên tâm theo dõi các dự án khác.",
    showViewAll: true,
  },
};

export function ProjectEmptyState({ status, onCreate, onViewAll }: ProjectEmptyStateProps) {
  const { icon: Icon, title, description, showCreate, showViewAll } = CONFIG[status];

  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-14 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#004080]/8 mb-4">
        <Icon className="h-8 w-8 text-[#004080]/70" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-5 leading-relaxed">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {showCreate && (
          <Button onClick={onCreate} className="bg-[#004080] hover:bg-[#003366]">
            Tạo dự án mới
          </Button>
        )}
        {showViewAll && status !== "all" && (
          <Button variant="outline" onClick={onViewAll}>
            Xem tất cả dự án
          </Button>
        )}
      </div>
    </div>
  );
}
