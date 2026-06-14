/** OAuth / email redirect base — prefer build-time site URL on production. */
export function getAuthRedirectUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  const base =
    fromEnv ||
    (typeof window !== "undefined" ? window.location.origin : "https://swhubco.com");
  return `${base}${normalizedPath}`;
}
