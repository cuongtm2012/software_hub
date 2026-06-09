import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/design-system/page-hero";
import { SectionPanel } from "@/components/design-system/section-panel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BUDGET_OPTIONS = [
  "Dưới 10 triệu",
  "10 – 30 triệu",
  "30 – 50 triệu",
  "50 – 100 triệu",
  "Trên 100 triệu",
];

const TIMELINE_OPTIONS = [
  "1 – 2 tuần",
  "2 – 4 tuần",
  "1 – 2 tháng",
  "2 – 3 tháng",
  "Linh hoạt",
];

export default function ServiceRequestNewPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    budget_range: "",
    timeline: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/service-requests", form);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Đã gửi yêu cầu", description: "Team sẽ liên hệ báo giá trong 24–48h." });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      navigate(`/services/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Gửi thất bại", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Vui lòng điền tiêu đề và mô tả", variant: "destructive" });
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <PageHero
        badge="IT Studio"
        title="Yêu cầu báo giá dịch vụ"
        subtitle="Mô tả dự án — Software Hub sẽ gửi báo giá chi tiết qua hệ thống"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/services")}
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Danh sách yêu cầu
          </Button>
        }
      />
      <main className="flex-grow py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <SectionPanel title="Thông tin dự án">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tiêu đề dự án *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Website bán hàng + quản lý kho"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Mô tả chi tiết *</label>
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mục tiêu, phạm vi, đối tượng người dùng..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Yêu cầu kỹ thuật</label>
                <Textarea
                  rows={3}
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="Công nghệ, tích hợp, bảo mật..."
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ngân sách dự kiến</label>
                  <Select
                    value={form.budget_range}
                    onValueChange={(v) => setForm({ ...form, budget_range: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức ngân sách" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Thời gian mong muốn</label>
                  <Select
                    value={form.timeline}
                    onValueChange={(v) => setForm({ ...form, timeline: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINE_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto bg-[#004080] hover:bg-[#003366]"
              >
                {mutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Gửi yêu cầu báo giá
              </Button>
            </form>
          </SectionPanel>
        </div>
      </main>
      <Footer />
    </div>
  );
}
