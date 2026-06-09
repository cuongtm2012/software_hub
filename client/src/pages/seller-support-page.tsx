import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/components/design-system/page-hero";
import { SectionPanel } from "@/components/design-system/section-panel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  buyer_id: number;
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

export default function SellerSupportPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ tickets: SupportTicket[] }>({
    queryKey: ["/api/support/tickets"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/support/tickets");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/support/tickets/${id}`, { status });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      toast({ title: "Đã cập nhật trạng thái" });
    },
    onError: (e: Error) => {
      toast({ title: "Lỗi", description: e.message, variant: "destructive" });
    },
  });

  const tickets = data?.tickets ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <PageHero
        badge="Seller"
        title="Hỗ trợ khách hàng"
        subtitle="Xử lý ticket hỗ trợ từ người mua sản phẩm của bạn"
      />
      <main className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
            </div>
          ) : tickets.length === 0 ? (
            <SectionPanel title="Chưa có ticket" subtitle="Ticket từ khách hàng sẽ hiển thị tại đây">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Không có ticket hỗ trợ nào.</p>
              </div>
            </SectionPanel>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <SectionPanel key={ticket.id} title={ticket.subject}>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={STATUS_COLOR[ticket.status] || "bg-gray-100"}>
                      {STATUS_LABEL[ticket.status] || ticket.status}
                    </Badge>
                    <Badge variant="outline">{ticket.priority}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                    {ticket.order_id && (
                      <span className="text-xs text-muted-foreground">Đơn #{ticket.order_id}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                    {ticket.description}
                  </p>
                  {ticket.status !== "closed" && (
                    <Select
                      value={ticket.status}
                      onValueChange={(status) => updateMutation.mutate({ id: ticket.id, status })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Cập nhật trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Mở</SelectItem>
                        <SelectItem value="in_progress">Đang xử lý</SelectItem>
                        <SelectItem value="resolved">Đã giải quyết</SelectItem>
                        <SelectItem value="closed">Đóng</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </SectionPanel>
              ))}
            </div>
          )}

          <Button variant="ghost" onClick={() => navigate("/seller/dashboard")} className="text-[#004080]">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Về dashboard seller
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
