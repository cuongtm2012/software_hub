import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatVnd, formatDateVi } from "@/components/dashboard/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import {
  Loader2,
  RefreshCw,
  Wrench,
  Plus,
  User,
  Mail,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  Info,
} from "lucide-react";

interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  requirements?: string | null;
  budget_range?: string | null;
  timeline?: string | null;
  status: string;
  priority?: string | null;
  admin_notes?: string | null;
  client_id: number;
  client_name?: string;
  client_email?: string;
  created_at: string;
}

interface ServiceQuotation {
  id: number;
  title: string;
  status: string;
  total_price: string;
  deposit_amount: string;
  timeline_days: number;
  deliverables?: string[] | null;
}

interface ServiceProject {
  id: number;
  status: string;
  progress_percentage: number;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: "Mới gửi",
  under_review: "Đang xem xét",
  quoted: "Đã báo giá",
  accepted: "Khách chấp nhận",
  in_progress: "Đang triển khai",
  completed: "Hoàn thành",
  closed: "Đã đóng",
  rejected: "Từ chối",
};

const STATUS_COLOR: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-amber-100 text-amber-800",
  quoted: "bg-purple-100 text-purple-800",
  accepted: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-cyan-100 text-cyan-800",
  completed: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
  rejected: "bg-red-100 text-red-800",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Thấp",
  normal: "Bình thường",
  high: "Cao",
  urgent: "Khẩn",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-slate-100 text-slate-700",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const QUOTE_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ phản hồi",
  accepted: "Đã chấp nhận",
  rejected: "Từ chối",
  expired: "Hết hạn",
};

const QUOTABLE_STATUSES = new Set(["submitted", "under_review", "quoted", "accepted"]);

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={STATUS_COLOR[status] ?? "bg-gray-100 text-gray-700"}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

export default function AdminServiceRequestsPage() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [adminNotesDraft, setAdminNotesDraft] = useState("");
  const [quoteForm, setQuoteForm] = useState({
    title: "",
    description: "",
    total_price: "",
    deposit_amount: "",
    timeline_days: "30",
    deliverables: "",
  });
  const [progressForm, setProgressForm] = useState({ progress: "0", status: "in_progress" });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [statusFilter, priorityFilter, search]);

  const { data, isLoading, refetch } = useQuery<{ requests: ServiceRequest[] }>({
    queryKey: ["/api/service-requests", statusFilter, priorityFilter, search],
    queryFn: async () => {
      const qs = queryParams ? `?${queryParams}` : "";
      const res = await apiRequest("GET", `/api/service-requests${qs}`);
      return res.json();
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery<{
    request: ServiceRequest;
    quotations: ServiceQuotation[];
    projects: ServiceProject[];
  }>({
    queryKey: ["/api/service-requests", selectedId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/service-requests/${selectedId}`);
      return res.json();
    },
    enabled: !!selectedId,
  });

  const project = detail?.projects?.[0];
  const canCreateQuote = detail?.request && QUOTABLE_STATUSES.has(detail.request.status);

  useEffect(() => {
    if (detail?.request) {
      setStatusDraft(detail.request.status);
      setAdminNotesDraft(detail.request.admin_notes ?? "");
    }
  }, [detail?.request?.id, detail?.request?.status, detail?.request?.admin_notes]);

  useEffect(() => {
    if (project) {
      setProgressForm({
        progress: String(project.progress_percentage),
        status: project.status,
      });
    } else {
      setProgressForm({ progress: "0", status: "in_progress" });
    }
  }, [project?.id, project?.progress_percentage, project?.status]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    if (selectedId) {
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests", selectedId] });
    }
  };

  const statusMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/service-requests/${selectedId}/status`, {
        status: statusDraft,
        admin_notes: adminNotesDraft.trim() || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Đã cập nhật trạng thái" });
      invalidateAll();
    },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
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
      invalidateAll();
      setQuoteForm({
        title: "",
        description: "",
        total_price: "",
        deposit_amount: "",
        timeline_days: "30",
        deliverables: "",
      });
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
      invalidateAll();
    },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  const requests = data?.requests ?? [];

  const stats = useMemo(() => {
    const pending = requests.filter((r) =>
      ["submitted", "under_review", "quoted"].includes(r.status),
    ).length;
    const active = requests.filter((r) =>
      ["accepted", "in_progress"].includes(r.status),
    ).length;
    const done = requests.filter((r) =>
      ["completed", "closed"].includes(r.status),
    ).length;
    return { total: requests.length, pending, active, done };
  }, [requests]);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="h-6 w-6 text-[#004080]" />
              Dịch vụ IT
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý yêu cầu dịch vụ, báo giá và tiến độ triển khai
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Làm mới
          </Button>
        </div>

        <div className="flex gap-3 p-4 rounded-lg border bg-blue-50/50 border-blue-100 text-sm text-blue-900">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            <strong>Dịch vụ IT</strong> là flow báo giá → triển khai có hợp đồng (bảng{" "}
            <code className="text-xs bg-blue-100 px-1 rounded">service_requests</code>). Khác với{" "}
            <strong>Yêu cầu dự án</strong> (form công khai / đăng ký developer).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tổng", value: stats.total },
            { label: "Chờ xử lý", value: stats.pending },
            { label: "Đang triển khai", value: stats.active },
            { label: "Hoàn thành", value: stats.done },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Tìm theo tiêu đề, khách hàng, mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi ưu tiên</SelectItem>
              {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Wrench className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Chưa có yêu cầu dịch vụ</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Khách</TableHead>
                    <TableHead>Ưu tiên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow
                      key={r.id}
                      className={`cursor-pointer ${selectedId === r.id ? "bg-blue-50/80" : ""}`}
                      onClick={() => setSelectedId(r.id)}
                    >
                      <TableCell className="font-mono text-sm">#{r.id}</TableCell>
                      <TableCell className="max-w-[160px] truncate" title={r.title}>
                        {r.title}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-sm">
                        {r.client_name ?? `#${r.client_id}`}
                      </TableCell>
                      <TableCell>
                        {r.priority && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${PRIORITY_COLOR[r.priority] ?? ""}`}
                          >
                            {PRIORITY_LABEL[r.priority] ?? r.priority}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {formatDateVi(r.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="rounded-lg border bg-card p-5 min-h-[480px]">
            {!selectedId ? (
              <p className="text-muted-foreground text-center py-16">
                Chọn yêu cầu để xem chi tiết
              </p>
            ) : detailLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : detail?.request ? (
              <div className="space-y-5">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-bold text-lg">{detail.request.title}</h2>
                    <StatusBadge status={detail.request.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {detail.request.client_name ?? `User #${detail.request.client_id}`}
                    </span>
                    {detail.request.client_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {detail.request.client_email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateVi(detail.request.created_at)}
                    </span>
                  </div>
                </div>

                <div className="text-sm space-y-2">
                  <p className="whitespace-pre-wrap">{detail.request.description}</p>
                  {detail.request.requirements && (
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Yêu cầu kỹ thuật
                      </p>
                      <p className="whitespace-pre-wrap">{detail.request.requirements}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 pt-1">
                    {detail.request.budget_range && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        Ngân sách: <strong>{detail.request.budget_range}</strong>
                      </span>
                    )}
                    {detail.request.timeline && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Timeline: <strong>{detail.request.timeline}</strong>
                      </span>
                    )}
                    {detail.request.priority && (
                      <Badge
                        variant="outline"
                        className={PRIORITY_COLOR[detail.request.priority] ?? ""}
                      >
                        {PRIORITY_LABEL[detail.request.priority] ?? detail.request.priority}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium text-sm">Cập nhật trạng thái</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={statusDraft} onValueChange={setStatusDraft}>
                      <SelectTrigger className="sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate()}
                      disabled={statusMutation.isPending}
                    >
                      Lưu trạng thái
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Ghi chú nội bộ (admin_notes)..."
                    rows={2}
                    value={adminNotesDraft}
                    onChange={(e) => setAdminNotesDraft(e.target.value)}
                  />
                </div>

                {detail.quotations && detail.quotations.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">
                      Báo giá đã gửi ({detail.quotations.length})
                    </h3>
                    <div className="space-y-2">
                      {detail.quotations.map((q) => (
                        <div key={q.id} className="text-sm border rounded-lg p-3 bg-muted/30">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium">{q.title}</span>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {QUOTE_STATUS_LABEL[q.status] ?? q.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {formatVnd(Number(q.total_price))} · Cọc{" "}
                            {formatVnd(Number(q.deposit_amount))} · {q.timeline_days} ngày
                          </p>
                          {q.deliverables && q.deliverables.length > 0 && (
                            <ul className="mt-2 text-xs text-muted-foreground list-disc pl-4">
                              {q.deliverables.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project && (
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="font-medium">Dự án triển khai #{project.id}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Tiến độ</span>
                        <span className="font-medium tabular-nums">{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} className="h-2" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-end">
                      <div className="flex-1 w-full">
                        <label className="text-xs text-muted-foreground">Tiến độ (%)</label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={progressForm.progress}
                          onChange={(e) =>
                            setProgressForm({ ...progressForm, progress: e.target.value })
                          }
                        />
                      </div>
                      <Select
                        value={progressForm.status}
                        onValueChange={(v) => setProgressForm({ ...progressForm, status: v })}
                      >
                        <SelectTrigger className="w-full sm:w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">Đang triển khai</SelectItem>
                          <SelectItem value="completed">Hoàn thành</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => progressMutation.mutate(project.id)}
                        disabled={progressMutation.isPending}
                      >
                        Lưu tiến độ
                      </Button>
                    </div>
                  </div>
                )}

                {canCreateQuote ? (
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
                        onChange={(e) =>
                          setQuoteForm({ ...quoteForm, description: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Tổng giá (VND)"
                          value={quoteForm.total_price}
                          onChange={(e) =>
                            setQuoteForm({ ...quoteForm, total_price: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Tiền cọc (VND)"
                          value={quoteForm.deposit_amount}
                          onChange={(e) =>
                            setQuoteForm({ ...quoteForm, deposit_amount: e.target.value })
                          }
                        />
                      </div>
                      <Input
                        placeholder="Số ngày thực hiện"
                        value={quoteForm.timeline_days}
                        onChange={(e) =>
                          setQuoteForm({ ...quoteForm, timeline_days: e.target.value })
                        }
                      />
                      <Textarea
                        placeholder="Deliverables (mỗi dòng 1 mục)"
                        rows={3}
                        value={quoteForm.deliverables}
                        onChange={(e) =>
                          setQuoteForm({ ...quoteForm, deliverables: e.target.value })
                        }
                      />
                      <Button
                        className="w-full bg-[#004080] hover:bg-[#003366]"
                        disabled={
                          quoteMutation.isPending ||
                          !quoteForm.title.trim() ||
                          !quoteForm.total_price.trim()
                        }
                        onClick={() => quoteMutation.mutate()}
                      >
                        Gửi báo giá cho khách
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4 flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      Không thể tạo báo giá mới khi yêu cầu ở trạng thái{" "}
                      <strong>{STATUS_LABEL[detail.request.status] ?? detail.request.status}</strong>.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
