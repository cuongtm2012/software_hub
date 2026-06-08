import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Mail, Headphones, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!compact && (
        <Input
          placeholder="Họ tên (không bắt buộc)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white border-[#004080]/15 focus-visible:ring-[#004080]/30"
        />
      )}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Email *"
          required
          className="pl-10 bg-white border-[#004080]/15 focus-visible:ring-[#004080]/30"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="tel"
          placeholder="Số điện thoại *"
          required
          className="pl-10 bg-white border-[#004080]/15 focus-visible:ring-[#004080]/30"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="flex justify-center pt-1">
        <Button
          type="submit"
          size="sm"
          className="w-fit min-w-[10rem] bg-[#004080] hover:bg-[#003366] font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Nhận tư vấn miễn phí
        </Button>
      </div>
    </form>
  );

  if (compact) {
    return formFields;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#004080]/12 bg-white shadow-sm uupm-card",
      )}
    >
      <div className="grid md:grid-cols-5">
        {/* Value prop */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#004080] to-[#003566] p-6 md:p-8 text-white antialiased">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 mb-4">
            <Headphones className="h-5 w-5 text-[#ffcc00]" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#ffcc00]/90 mb-2.5">
            Hỗ trợ miễn phí
          </p>
          <h3 className="text-[1.35rem] sm:text-2xl font-semibold tracking-tight leading-[1.4] text-balance text-white mb-3">
            {title}
          </h3>
          <p className="text-[15px] text-white/85 leading-relaxed font-normal mb-6 max-w-sm">
            {description}
          </p>
          <ul className="space-y-2.5 text-[14px] text-white/80 font-normal">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-[#ffcc00]" />
              Phản hồi trong vòng 4 giờ
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#ffcc00]" />
              Tư vấn miễn phí, không ràng buộc
            </li>
          </ul>
        </div>

        {/* Form */}
        <div className="md:col-span-3 p-6 md:p-8 bg-[#f9f9f9]">
          <p className="text-base font-semibold tracking-tight text-[#004080] mb-1">
            Để lại thông tin liên hệ
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Chúng tôi sẽ gọi lại trong giờ hành chính.
          </p>
          {formFields}
        </div>
      </div>
    </div>
  );
}
