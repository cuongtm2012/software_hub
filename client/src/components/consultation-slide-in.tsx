import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ConsultationSlideInProps {
  visible: boolean;
  onDismiss: () => void;
}

export function ConsultationSlideIn({ visible, onDismiss }: ConsultationSlideInProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 right-4 z-40 w-[min(100vw-2rem,20rem)] animate-in slide-in-from-right-5 fade-in duration-300"
      role="complementary"
      aria-label="Tải lộ trình học PDF"
    >
      <div className="relative rounded-xl border border-[#004080]/15 bg-white shadow-lg p-4 uupm-card">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#004080]/10">
            <BookOpen className="h-5 w-5 text-[#004080]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              Tải lộ trình học PDF miễn phí
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ebook Fullstack 6 tháng — tiếng Việt, cập nhật 2025.
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="w-full mt-3 bg-[#004080] hover:bg-[#003366] font-semibold"
          onClick={onDismiss}
        >
          <Link href="/ebook/fullstack-roadmap">Nhận ebook ngay</Link>
        </Button>
      </div>
    </div>
  );
}
