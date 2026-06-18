declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type GtmEventParams = Record<string, string | number | boolean | undefined>;

export function trackGtmEvent(eventName: string, params?: GtmEventParams) {
  if (!window.gtag) return;
  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      )
    : undefined;
  window.gtag("event", eventName, cleaned);
}
