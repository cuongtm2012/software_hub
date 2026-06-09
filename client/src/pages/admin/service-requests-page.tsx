import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, Briefcase, Plus } from "lucide-react";
import { format } from "date-fns";

interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  budget_range?: string | null;
  status: string;
  client_id: number;
  created_at: string;
}

const STATUS_OPTIONS = [
  "submitted",
  "under_review",
  "quoted",
  "in_progress",
  "completed",
  "closed",
  "rejected",
];

export default function AdminServiceRequestsPage() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    title: "",
    description: "",
    total_price: "",
    deposit_amount: "",
    timeline_days: "30",
    deliverables: "",
  });
  const [progressForm, setProgressForm] = useState({ progress: "0", status: "in_progress" });

  const { data, isLoading, refetch } = useQuery<{ requests: ServiceRequest[] }>({
    queryKey: ["/api/service-requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/service-requests");
      return res.json();
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["/api/service-requests", selectedId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/service-requests/${selectedId}`);
      return res.json();
    },
    enabled: !!selectedId,
  });

  const quoteMutation = useMutation({
    mutationFn: async () => {
      const deliverables = quoteForm.deliverables
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await apiRequest("POST", `/api/service-requests/${selectedId}/quotations`, {
        title: quoteForm.title,
        description: quoteForm.description,
        total_price: quoteForm.total_price,
        deposit_amount: quoteForm.deposit_amount,
        timeline_days: parseInt(quoteForm.timeline_days, 10),
        deliverables,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Đã gửi báo giá" });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests", selectedId] });
      setQuoteForm({ title: "", description: "", total_price: "", deposit_amount: "", timeline_days: "30", deliverables: "" });
    },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  const progressMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await apiRequest("PUT", `/api/service-projects/${projectId}/progress`, {
        progress_percentage: parseInt(progressForm.progress, 10),
        status: progressForm.status,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Đã cập nhật tiến độ" });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests", selectedId] });
    },
  });

  const requests = data?.requests ?? [];
  const project = detail?.projects?.[0];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              IT Service Requests
            </h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý yêu cầu dịch vụ & báo giá</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border">
            {isLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow
                      key={r.id}
                      className={`cursor-pointer ${selectedId === r.id ? "bg-blue-50" : ""}`}
                      onClick={() => setSelectedId(r.id)}
                    >
                      <TableCell>#{r.id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{r.title}</TableCell>
                      <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                      <TableCell className="text-xs">{format(new Date(r.created_at), "dd/MM/yy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="bg-white rounded-lg border p-5 min-h-[400px]">
            {!selectedId ? (
              <p className="text-muted-foreground text-center py-16">Chọn yêu cầu để xem chi tiết</p>
            ) : detailLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>
            ) : detail?.request ? (
              <div className="space-y-5">
                <div>
                  <h2 className="font-bold text-lg">{detail.request.title}</h2>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{detail.request.description}</p>
                  {detail.request.budget_range && (
                    <p className="text-sm mt-2">Ngân sách: {detail.request.budget_range}</p>
                  )}
                </div>

                {detail.quotations?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Báo giá đã gửi ({detail.quotations.length})</h3>
                    {detail.quotations.map((q: { id: number; title: string; status: string; total_price: string }) => (
                      <div key={q.id} className="text-sm border rounded p-2 mb-2">
                        {q.title} — {Number(q.total_price).toLocaleString("vi-VN")}₫ — {q.status}
                      </div>
                    ))}
                  </div>
                )}

                {project && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Cập nhật tiến độ dự án #{project.id}</h3>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs">Tiến độ (%)</label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={progressForm.progress}
                          onChange={(e) => setProgressForm({ ...progressForm, progress: e.target.value })}
                        />
                      </div>
                      <Select
                        value={progressForm.status}
                        onValueChange={(v) => setProgressForm({ ...progressForm, status: v })}
                      >
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => progressMutation.mutate(project.id)}>
                        Lưu
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo báo giá mới
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Tiêu đề báo giá"
                      value={quoteForm.title}
                      onChange={(e) => setQuoteForm({ ...quoteForm, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Mô tả chi tiết"
                      rows={3}
                      value={quoteForm.description}
                      onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Tổng giá (VND)"
                        value={quoteForm.total_price}
                        onChange={(e) => setQuoteForm({ ...quoteForm, total_price: e.target.value })}
                      />
                      <Input
                        placeholder="Tiền cọc (VND)"
                        value={quoteForm.deposit_amount}
                        onChange={(e) => setQuoteForm({ ...quoteForm, deposit_amount: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder="Số ngày thực hiện"
                      value={quoteForm.timeline_days}
                      onChange={(e) => setQuoteForm({ ...quoteForm, timeline_days: e.target.value })}
                    />
                    <Textarea
                      placeholder="Deliverables (mỗi dòng 1 mục)"
                      rows={3}
                      value={quoteForm.deliverables}
                      onChange={(e) => setQuoteForm({ ...quoteForm, deliverables: e.target.value })}
                    />
                    <Button
                      className="w-full bg-[#004080]"
                      disabled={quoteMutation.isPending}
                      onClick={() => quoteMutation.mutate()}
                    >
                      Gửi báo giá cho khách
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
