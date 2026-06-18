import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const STORAGE_KEY = "sh-content-page-views";
const POPUP_SHOWN_KEY = "sh-consultation-popup-shown";
const SLIDEIN_SHOWN_KEY = "sh-slidein-consultation-shown";
const SCROLL_CTA_DISMISSED_KEY = "sh-scroll-cta-dismissed";

const TRIGGER_THRESHOLD = 3;
const SLIDEIN_DELAY_MS = 30_000;
const SCROLL_THRESHOLD = 0.7;

const TRACKED_PREFIXES = ["/courses/", "/blog/", "/software/"];

function isTrackedPath(path: string): boolean {
  return TRACKED_PREFIXES.some((prefix) => path.startsWith(prefix) && path !== prefix.slice(0, -1));
}

function getViewCount(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function usePageTracking() {
  const [location] = useLocation();
  const [shouldShowPopup, setShouldShowPopup] = useState(false);
  const [shouldShowSlideIn, setShouldShowSlideIn] = useState(false);
  const [shouldShowScrollCta, setShouldShowScrollCta] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  const tracked = isTrackedPath(location);

  // Behavior popup: 3+ unique content page views
  useEffect(() => {
    if (!tracked) return;

    const alreadyShown = localStorage.getItem(POPUP_SHOWN_KEY) === "true";
    if (alreadyShown) return;

    const current = getViewCount() + 1;
    localStorage.setItem(STORAGE_KEY, String(current));
    setViewCount(current);

    if (current >= TRIGGER_THRESHOLD) {
      const timer = setTimeout(() => setShouldShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [location, tracked]);

  // GTM-2: slide-in consultation after 30s on content pages
  useEffect(() => {
    if (!tracked) {
      setShouldShowSlideIn(false);
      return;
    }

    const alreadyShown = sessionStorage.getItem(SLIDEIN_SHOWN_KEY) === "true";
    if (alreadyShown) return;

    const timer = setTimeout(() => setShouldShowSlideIn(true), SLIDEIN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [location, tracked]);

  // GTM-3: bottom CTA bar at 70% scroll
  useEffect(() => {
    if (!tracked) {
      setShouldShowScrollCta(false);
      return;
    }

    if (sessionStorage.getItem(SCROLL_CTA_DISMISSED_KEY) === "true") return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const ratio = window.scrollY / scrollable;
      if (ratio >= SCROLL_THRESHOLD) {
        setShouldShowScrollCta(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [location, tracked]);

  const dismissPopup = () => {
    setShouldShowPopup(false);
    localStorage.setItem(POPUP_SHOWN_KEY, "true");
  };

  const dismissSlideIn = () => {
    setShouldShowSlideIn(false);
    sessionStorage.setItem(SLIDEIN_SHOWN_KEY, "true");
  };

  const dismissScrollCta = () => {
    setShouldShowScrollCta(false);
    sessionStorage.setItem(SCROLL_CTA_DISMISSED_KEY, "true");
  };

  return {
    shouldShowPopup,
    dismissPopup,
    shouldShowSlideIn,
    dismissSlideIn,
    shouldShowScrollCta,
    dismissScrollCta,
    viewCount,
  };
}
