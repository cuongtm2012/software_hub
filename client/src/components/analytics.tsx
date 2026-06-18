import { useEffect, useState } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function loadGtag(id: string) {
  if (document.getElementById("ga-script")) return;

  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
}

export function Analytics() {
  const [location] = useLocation();
  const gaIdFromEnv = GA_ID;
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    // Prefer build-time env, but allow runtime config from admin (/api/config)
    if (gaIdFromEnv) {
      loadGtag(gaIdFromEnv);
      return;
    }

    let cancelled = false;
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: { gaMeasurementId?: string | null }) => {
        if (cancelled) return;
        const id = data?.gaMeasurementId?.trim();
        if (!id) return;
        setGaId(id);
        loadGtag(id);
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const activeId = gaIdFromEnv || gaId;
    if (!activeId || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: location,
      page_title: document.title,
    });
  }, [location, gaId, gaIdFromEnv]);

  return null;
}
