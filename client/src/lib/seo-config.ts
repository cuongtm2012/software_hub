/** Shared SEO constants — used by PageMeta, schemas, and server prerender. */

export const SITE_NAME = "Software Hub";
export const SITE_TAGLINE = "Khóa học IT, phần mềm miễn phí & Marketplace số";
export const DEFAULT_LOCALE = "vi_VN";

export function getSiteUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return (
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_PUBLIC_URL ||
    "https://swhubco.com"
  );
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function defaultOgImage(): string {
  return absoluteUrl("/icon-192x192.svg");
}

export const LEVEL_SEO_LABEL: Record<string, string> = {
  beginner: "người mới",
  intermediate: "trung cấp",
  advanced: "nâng cao",
};
