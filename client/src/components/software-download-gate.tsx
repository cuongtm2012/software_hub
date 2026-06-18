import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { trackGtmEvent } from "@/lib/gtm-analytics";

interface SoftwareDownloadGateProps {
  open: boolean;
  onClose: () => void;
  softwareName: string;
  softwareId: number;
  downloadUrl: string;
}

function gateStorageKey(softwareId: number) {
  return `sh-download-gate-${softwareId}`;
}

export function hasPassedDownloadGate(softwareId: number): boolean {
  try {
    return sessionStorage.getItem(gateStorageKey(softwareId)) === "true";
  } catch {
    return false;
  }
}

export function markDownloadGatePassed(softwareId: number) {
  try {
    sessionStorage.setItem(gateStorageKey(softwareId), "true");
  } catch {
    // ignore
  }
}

export function openDownloadUrl(url: string, softwareId: number, softwareName: string) {
  markDownloadGatePassed(softwareId);
  trackGtmEvent("download_click", {
    software_id: softwareId,
    software_name: softwareName,
  });
  window.open(url, "_blank", "noopener,noreferrer");
}

export function SoftwareDownloadGate({
  open,
  onClose,
  softwareName,
  softwareId,
  downloadUrl,
}: SoftwareDownloadGateProps) {
  const handleSuccess = () => {
    openDownloadUrl(downloadUrl, softwareId, softwareName);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải {softwareName}</DialogTitle>
          <DialogDescription>
            Để lại email và số điện thoại để nhận link tải. Team Software Hub có thể gọi tư vấn
            cài đặt miễn phí nếu bạn cần.
          </DialogDescription>
        </DialogHeader>
        <LeadCaptureForm
          source="software_download"
          sourceId={softwareId}
          compact
          title=""
          description=""
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
