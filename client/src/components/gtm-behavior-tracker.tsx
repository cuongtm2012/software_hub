import { usePageTracking } from "@/hooks/use-page-tracking";
import { ConsultationPopup } from "@/components/consultation-popup";

export function GtmBehaviorTracker() {
  const { shouldShowPopup, dismissPopup } = usePageTracking();
  return <ConsultationPopup open={shouldShowPopup} onClose={dismissPopup} />;
}
