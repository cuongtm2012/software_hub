import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionPanel } from "@/components/design-system/section-panel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { format } from "date-fns";

interface ServiceQuotation {
  id: number;
  title: string;
  description: string;
  total_price: string;
  deposit_amount: string;
  timeline_days: number;
  deliverables?: string[] | null;
  status: string;
  created_at: string;
}

interface ServiceProject {
  id: number;
  status: string;
  progress_percentage: number;
}

interface ServiceRequestDetail {
  request: {
    id: number;
    title: string;
    description: string;
    requirements?: string | null;
    budget_range?: string | null;
    timeline?: string | null;
    status: string;
    admin_notes?: string | null;
    created_at: string;
  };
  quotations: ServiceQuotation[];
  projects: ServiceProject[];
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Đã gửi",
  under_review: "Đang xem xét",
  quoted: "Đã báo giá",
  accepted: "Đã chấp nhận",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  pending: "Chờ phản hồi",
  rejected: "Từ chối",
};

function formatVnd(amount: string | number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(amount),
  );
}

export default function ServiceRequestDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/services/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<ServiceRequestDetail>({
    queryKey: ["/api/service-requests", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/service-requests/${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ quotationId, action }: { quotationId: number; action: "accept" | "reject" }) => {
      const res = await apiRequest("PUT", `/api/service-quotations/${quotationId}/respond`, { action });
      return res.json();
    },
    onSuccess: (_, { action }) => {
      toast({
        title: action === "accept" ? "Đã chấp nhận báo giá" : "Đã từ chối báo giá",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests", id] });
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
      </div>
    );
  }

  if (error || !data?.request) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Không tìm thấy yêu cầu.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const { request, quotations, projects } = data;
  const activeProject = projects[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <Button variant="ghost" onClick={() => navigate("/services")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>

          <SectionPanel
            title={request.title}
            subtitle={`Gửi ngày ${format(new Date(request.created_at), "dd/MM/yyyy")}`}
            action={
              <Badge className="bg-[#004080]/10 text-[#004080]">
                {STATUS_LABEL[request.status] || request.status}
              </Badge>
            }
          >
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.description}</p>
            {request.requirements && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-1">Yêu cầu kỹ thuật</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.requirements}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {request.budget_range && <span>Ngân sách: {request.budget_range}</span>}
              {request.timeline && <span>Timeline: {request.timeline}</span>}
            </div>
            {request.admin_notes && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <span className="font-medium">Ghi chú từ team: </span>
                {request.admin_notes}
              </div>
            )}
          </SectionPanel>

          {activeProject && (
            <SectionPanel title="Tiến độ dự án">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiến độ</span>
                  <span className="font-medium">{activeProject.progress_percentage}%</span>
                </div>
                <Progress value={activeProject.progress_percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Trạng thái: {STATUS_LABEL[activeProject.status] || activeProject.status}
                </p>
              </div>
            </SectionPanel>
          )}

          <SectionPanel title={`Báo giá (${quotations.length})`}>
            {quotations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Chưa có báo giá. Team sẽ phản hồi trong 24–48 giờ làm việc.
              </p>
            ) : (
              <div className="space-y-4">
                {quotations.map((q) => (
                  <div
                    key={q.id}
                    className="border border-[#004080]/10 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-[#004080]">{q.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{q.description}</p>
                      </div>
                      <Badge variant="outline">{STATUS_LABEL[q.status] || q.status}</Badge>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tổng: </span>
                        <span className="font-semibold">{formatVnd(q.total_price)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cọc: </span>
                        <span>{formatVnd(q.deposit_amount)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Thời gian: </span>
                        <span>{q.timeline_days} ngày</span>
                      </div>
                    </div>
                    {q.deliverables && q.deliverables.length > 0 && (
                      <ul className="text-sm text-muted-foreground list-disc ml-4">
                        {q.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
                    {q.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="bg-[#004080] hover:bg-[#003366]"
                          disabled={respondMutation.isPending}
                          onClick={() => respondMutation.mutate({ quotationId: q.id, action: "accept" })}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Chấp nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={respondMutation.isPending}
                          onClick={() => respondMutation.mutate({ quotationId: q.id, action: "reject" })}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>
        </div>
      </main>
      <Footer />
    </div>
  );
}
