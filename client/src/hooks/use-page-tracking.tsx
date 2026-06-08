import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const STORAGE_KEY = "sh-content-page-views";
const POPUP_SHOWN_KEY = "sh-consultation-popup-shown";
const TRIGGER_THRESHOLD = 3;

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
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!isTrackedPath(location)) return;

    const alreadyShown = localStorage.getItem(POPUP_SHOWN_KEY) === "true";
    if (alreadyShown) return;

    const current = getViewCount() + 1;
    localStorage.setItem(STORAGE_KEY, String(current));
    setViewCount(current);

    if (current >= TRIGGER_THRESHOLD) {
      const timer = setTimeout(() => setShouldShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const dismissPopup = () => {
    setShouldShowPopup(false);
    localStorage.setItem(POPUP_SHOWN_KEY, "true");
  };

  return { shouldShowPopup, dismissPopup, viewCount };
}
