import { supabase } from "./supabase";

export function isAuthCallbackUrl(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  const search = window.location.search;
  return hash.includes("access_token=") || search.includes("code=");
}

async function waitForSession(maxAttempts = 20, intervalMs = 150) {
  if (!supabase) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (session?.access_token) return session;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return null;
}

/** Parse Supabase OAuth callback (hash or PKCE code) and establish client session. */
export async function completeAuthCallback(): Promise<boolean> {
  if (!supabase || !isAuthCallbackUrl()) return false;

  const search = window.location.search;

  if (search.includes("code=")) {
    let session = await waitForSession(3, 50);
    if (!session) {
      const code = new URLSearchParams(search).get("code");
      if (!code) throw new Error("Missing OAuth code");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      session = data.session;
    }
    if (!session) {
      session = await waitForSession();
    }
    if (!session) throw new Error("Could not establish session from OAuth callback");
  } else {
    const session = await waitForSession();
    if (!session) throw new Error("Could not establish session from OAuth callback");
  }

  window.history.replaceState(null, "", window.location.pathname);
  return true;
}
