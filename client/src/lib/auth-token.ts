import { supabase } from "./supabase";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

/** Wait until Supabase client has a JWT (e.g. right after OAuth redirect). */
export async function waitForAuthHeaders(
  maxAttempts = 15,
  intervalMs = 200,
): Promise<Record<string, string>> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const headers = await getAuthHeaders();
    if (headers.Authorization) return headers;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return {};
}

export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(options.headers as Record<string, string> | undefined),
  };
  return fetch(url, { ...options, headers, credentials: "include" });
}
