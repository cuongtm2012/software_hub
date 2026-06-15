/** Read URL search params — wouter location omits the query string. */
export function getUrlSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}
