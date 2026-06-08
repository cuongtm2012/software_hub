import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Mail, MessageSquare } from "lucide-react";

interface LeadCaptureFormProps {
  source?: string;
  sourceId?: string | number;
  title?: string;
  description?: string;
  compact?: boolean;
}

export function LeadCaptureForm({
  source = "course_page",
  sourceId,
  title = "Tư vấn lộ trình học miễn phí",
  description = "Để lại email và số điện thoại, team Software Hub sẽ gọi tư vấn lộ trình phù hợp trong 4 giờ.",
  compact = false,
}: LeadCaptureFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          phone: phone.trim(),
          source,
          source_id: sourceId?.toString(),
        }),
      });

      if (!res.ok) throw new Error("Submit failed");

      toast({
        title: "Đã gửi thành công!",
        description: "Chúng tôi sẽ liên hệ tư vấn trong vòng 4 giờ.",
      });
      setEmail("");
      setPhone("");
      setName("");
    } catch {
      toast({
        title: "Gửi thất bại",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={compact ? "" : "bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 md:p-8 border border-indigo-100"}>
      {!compact && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {!compact && (
          <Input
            placeholder="Họ tên (không bắt buộc)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            placeholder="Email *"
            required
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="tel"
            placeholder="Số điện thoại *"
            required
            className="pl-10"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Nhận tư vấn miễn phí
        </Button>
      </form>
    </div>
  );
}
