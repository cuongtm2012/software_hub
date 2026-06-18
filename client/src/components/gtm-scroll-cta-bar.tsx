import { X, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface GtmScrollCtaBarProps {
  visible: boolean;
  onDismiss: () => void;
}

export function GtmScrollCtaBar({ visible, onDismiss }: GtmScrollCtaBarProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
      role="complementary"
      aria-label="Cần team code?"
    >
      <div className="border-t border-[#004080]/15 bg-white/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(0,64,128,0.08)]">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ffcc00]/30">
            <Code2 className="h-5 w-5 text-[#004080]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">Cần team code dự án?</p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              IT Studio — web, app, CRM cho doanh nghiệp. Tư vấn miễn phí trong 4 giờ.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="shrink-0 bg-[#004080] hover:bg-[#003366] font-semibold"
            onClick={onDismiss}
          >
            <Link href="/booking">Đặt lịch tư vấn</Link>
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
