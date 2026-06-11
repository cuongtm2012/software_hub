import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/design-system/page-hero";
import { SectionPanel } from "@/components/design-system/section-panel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, MessageSquare, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
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

export default function SupportTicketsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [orderId, setOrderId] = useState("");

  const { data, isLoading } = useQuery<{ tickets: SupportTicket[] }>({
    queryKey: ["/api/support/tickets"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/support/tickets");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = { subject, description };
      if (orderId.trim()) body.order_id = parseInt(orderId, 10);
      const res = await apiRequest("POST", "/api/support/tickets", body);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Tạo ticket thất bại");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Đã gửi yêu cầu hỗ trợ", description: "Chúng tôi sẽ phản hồi sớm nhất." });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      setShowForm(false);
      setSubject("");
      setDescription("");
      setOrderId("");
    },
    onError: (e: Error) => {
      toast({ title: "Lỗi", description: e.message, variant: "destructive" });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/support/tickets/${id}`, { status: "closed" });
      if (!res.ok) throw new Error("Không thể đóng ticket");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      toast({ title: "Đã đóng ticket" });
    },
  });

  const tickets = data?.tickets ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <PageHero
        badge="Hỗ trợ"
        title="Ticket hỗ trợ"
        subtitle="Gửi yêu cầu hỗ trợ sau khi mua hàng hoặc gặp sự cố"
        actions={
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#ffcc00] text-[#004080] hover:bg-[#e6b800] font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo ticket mới
          </Button>
        }
      />
      <main className="flex-grow py-10">
        <div className="w-full min-w-0 max-w-full px-[4%] space-y-6">
          {showForm && (
            <SectionPanel title="Tạo ticket mới" subtitle="Mô tả vấn đề bạn gặp phải">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Tiêu đề</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="VD: Không nhận được mã kích hoạt"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Mô tả chi tiết</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả vấn đề, thời gian xảy ra..."
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="orderId">Mã đơn hàng (tuỳ chọn)</Label>
                  <Input
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="VD: 123"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={!subject.trim() || !description.trim() || createMutation.isPending}
                    className="bg-[#004080] hover:bg-[#003366]"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Gửi ticket
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Huỷ
                  </Button>
                </div>
              </div>
            </SectionPanel>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
            </div>
          ) : tickets.length === 0 ? (
            <SectionPanel title="Chưa có ticket" subtitle="Tạo ticket mới nếu bạn cần hỗ trợ">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
                <Button onClick={() => setShowForm(true)} className="bg-[#004080] hover:bg-[#003366]">
                  Tạo ticket đầu tiên
                </Button>
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
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                    {ticket.order_id && (
                      <span className="text-xs text-muted-foreground">Đơn #{ticket.order_id}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                  {ticket.status !== "closed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => closeMutation.mutate(ticket.id)}
                      disabled={closeMutation.isPending}
                    >
                      Đóng ticket
                    </Button>
                  )}
                </SectionPanel>
              ))}
            </div>
          )}

          <Button variant="ghost" onClick={() => navigate("/buyer")} className="text-[#004080]">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Về bảng điều khiển
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
