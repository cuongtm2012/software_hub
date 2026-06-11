import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/design-system/page-hero";
import { SectionPanel } from "@/components/design-system/section-panel";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Loader2, ArrowRight, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  budget_range?: string | null;
  timeline?: string | null;
  status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Đã gửi",
  under_review: "Đang xem xét",
  quoted: "Đã báo giá",
  accepted: "Đã chấp nhận",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  closed: "Đóng",
  rejected: "Từ chối",
};

const STATUS_COLOR: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  accepted: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-[#004080]/10 text-[#004080]",
  completed: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-800",
};

export default function ServiceRequestsPage() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<{ requests: ServiceRequest[] }>({
    queryKey: ["/api/service-requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/service-requests");
      return res.json();
    },
  });

  const requests = data?.requests ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <PageHero
        badge="IT Studio"
        title="Yêu cầu dịch vụ của bạn"
        subtitle="Theo dõi trạng thái báo giá và tiến độ dự án"
        actions={
          <Button
            onClick={() => navigate("/services/new")}
            className="bg-[#ffcc00] text-[#004080] hover:bg-[#e6b800] font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo yêu cầu mới
          </Button>
        }
      />
      <main className="flex-grow py-10">
        <div className="w-full min-w-0 max-w-full px-[4%]">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
            </div>
          ) : requests.length === 0 ? (
            <SectionPanel title="Chưa có yêu cầu">
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Gửi yêu cầu để nhận báo giá phát triển web, app hoặc giải pháp tùy chỉnh.
                </p>
                <Button onClick={() => navigate("/services/new")} className="bg-[#004080] hover:bg-[#003366]">
                  Bắt đầu ngay
                </Button>
              </div>
            </SectionPanel>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => navigate(`/services/${req.id}`)}
                  className="w-full text-left bg-white rounded-xl border border-[#004080]/10 p-5 hover:border-[#004080]/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-[#004080] group-hover:underline">
                          {req.title}
                        </h3>
                        <Badge className={STATUS_COLOR[req.status] || "bg-gray-100"}>
                          {STATUS_LABEL[req.status] || req.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {req.budget_range && <span>Ngân sách: {req.budget_range}</span>}
                        {req.timeline && <span>Timeline: {req.timeline}</span>}
                        <span>{format(new Date(req.created_at), "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
