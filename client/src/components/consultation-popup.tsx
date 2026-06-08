import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadCaptureForm } from "@/components/lead-capture-form";

interface ConsultationPopupProps {
  open: boolean;
  onClose: () => void;
}

export function ConsultationPopup({ open, onClose }: ConsultationPopupProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bạn đang tìm lộ trình học phù hợp?</DialogTitle>
          <DialogDescription>
            Để lại thông tin, team Software Hub sẽ gọi tư vấn miễn phí trong 4 giờ.
          </DialogDescription>
        </DialogHeader>
        <LeadCaptureForm
          source="behavior_popup"
          compact
          title=""
          description=""
        />
      </DialogContent>
    </Dialog>
  );
}
