import { usePageTracking } from "@/hooks/use-page-tracking";
import { ConsultationPopup } from "@/components/consultation-popup";
import { ConsultationSlideIn } from "@/components/consultation-slide-in";
import { GtmScrollCtaBar } from "@/components/gtm-scroll-cta-bar";

export function GtmBehaviorTracker() {
  const {
    shouldShowPopup,
    dismissPopup,
    shouldShowSlideIn,
    dismissSlideIn,
    shouldShowScrollCta,
    dismissScrollCta,
  } = usePageTracking();

  return (
    <>
      <ConsultationPopup open={shouldShowPopup} onClose={dismissPopup} />
      <ConsultationSlideIn visible={shouldShowSlideIn} onDismiss={dismissSlideIn} />
      <GtmScrollCtaBar visible={shouldShowScrollCta} onDismiss={dismissScrollCta} />
    </>
  );
}
