import { supabase } from "./supabase";

export function isAuthCallbackUrl(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  const search = window.location.search;
  return hash.includes("access_token=") || search.includes("code=");
}

/** Parse Supabase OAuth callback (hash or PKCE code) and establish client session. */
export async function completeAuthCallback(): Promise<boolean> {
  if (!supabase || !isAuthCallbackUrl()) return false;

  const search = window.location.search;
  if (search.includes("code=")) {
    const params = new URLSearchParams(search);
    const code = params.get("code");
    if (!code) throw new Error("Missing OAuth code");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) throw new Error("Could not establish session from OAuth callback");
  }

  window.history.replaceState(null, "", window.location.pathname);
  return true;
}
