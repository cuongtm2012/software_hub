import { createClient, SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";

let supabaseAdmin: SupabaseClient | null = null;

/** Node 20 on Linux has no native WebSocket — required for @supabase/supabase-js. */
function supabaseServerClientOptions() {
  return {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      WebSocket: ws as unknown as typeof WebSocket,
    },
    realtime: {
      transport: ws,
    },
  };
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY)
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!url || !serviceKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_SECRET_KEY) must be set",
      );
    }

    supabaseAdmin = createClient(url, serviceKey, supabaseServerClientOptions());
  }

  return supabaseAdmin;
}

export async function verifySupabaseToken(
  token: string,
): Promise<{ id: string; email?: string } | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error) {
      console.warn("Supabase JWT verify failed:", error.message);
      return null;
    }
    if (!data.user) return null;
    return { id: data.user.id, email: data.user.email ?? undefined };
  } catch (err) {
    console.warn("Supabase JWT verify error:", err);
    return null;
  }
}

/** True when the service/secret key can call Supabase Auth admin APIs. */
export async function isSupabaseAdminHealthy(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await getSupabaseAdmin().auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    if (error) {
      console.warn("Supabase admin health check failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase admin health check error:", err);
    return false;
  }
}
