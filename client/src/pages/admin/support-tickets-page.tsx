import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  buyer_id: number;
  seller_id?: number | null;
  order_id?: number | null;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Mở",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đóng",
};

const STATUS_COLOR: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
};

export default function AdminSupportTicketsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch } = useQuery<{ tickets: SupportTicket[] }>({
    queryKey: ["/api/support/tickets", "admin"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/support/tickets");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, priority }: { id: number; status?: string; priority?: string }) => {
      const res = await apiRequest("PATCH", `/api/support/tickets/${id}`, { status, priority });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      toast({ title: "Đã cập nhật ticket" });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const tickets = (data?.tickets ?? []).filter(
    (t) => statusFilter === "all" || t.status === statusFilter,
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Support Tickets
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý ticket hỗ trợ từ người mua
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Làm mới
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 mb-4">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="open">Mở</SelectItem>
            <SelectItem value="in_progress">Đang xử lý</SelectItem>
            <SelectItem value="resolved">Đã giải quyết</SelectItem>
            <SelectItem value="closed">Đóng</SelectItem>
          </SelectContent>
        </Select>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
          </div>
        ) : (
          <div className="rounded-lg border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Không có ticket
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>#{ticket.id}</TableCell>
                      <TableCell>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLOR[ticket.status] || ""}>
                          {STATUS_LABEL[ticket.status] || ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.priority}</TableCell>
                      <TableCell>{ticket.order_id ? `#${ticket.order_id}` : "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(status) => updateMutation.mutate({ id: ticket.id, status })}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Mở</SelectItem>
                            <SelectItem value="in_progress">Đang xử lý</SelectItem>
                            <SelectItem value="resolved">Đã giải quyết</SelectItem>
                            <SelectItem value="closed">Đóng</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
