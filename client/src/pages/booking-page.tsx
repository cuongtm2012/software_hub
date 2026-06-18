import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageMeta } from "@/components/seo/page-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2, Phone, CheckCircle } from "lucide-react";
import { trackGtmEvent } from "@/lib/gtm-analytics";

export default function BookingPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    note: "",
  });

  useEffect(() => {
    trackGtmEvent("booking_view");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.phone) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || undefined,
          email: form.email,
          phone: form.phone,
          source: "booking",
          source_id: `${form.preferredDate} ${form.preferredTime}`.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      trackGtmEvent("lead_submit", { source: "booking" });
      setSubmitted(true);
      toast({
        title: "Đặt lịch thành công!",
        description: "Chúng tôi sẽ gọi xác nhận trong vòng 2 giờ.",
      });
    } catch {
      toast({ title: "Gửi thất bại", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageMeta
        title="Đặt lịch tư vấn miễn phí — Software Hub IT Studio"
        description="Đặt lịch gọi tư vấn miễn phí với team Software Hub. Tư vấn lộ trình học hoặc dự án web/app/CRM cho doanh nghiệp."
        url="/booking"
      />
      <Header />
      <main className="flex-grow container max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Đặt lịch tư vấn miễn phí</h1>
          <p className="text-gray-600">
            30 phút tư vấn với team Software Hub — lộ trình học hoặc dự án IT cho doanh nghiệp.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Đã nhận yêu cầu!</h2>
            <p className="text-gray-600">
              Team sẽ gọi xác nhận lịch trong vòng 2 giờ làm việc.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8 space-y-4">
            <Input
              placeholder="Họ tên *"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email *"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              type="tel"
              placeholder="Số điện thoại *"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={form.preferredDate}
                onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
              />
              <Input
                type="time"
                value={form.preferredTime}
                onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
              />
            </div>
            <Textarea
              placeholder="Mô tả nhu cầu (học lập trình, làm web bán hàng, CRM...)"
              rows={4}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
              Xác nhận đặt lịch
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
