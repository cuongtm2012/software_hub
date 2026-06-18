import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeaders } from "./auth-token";

export function parseApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const jsonMatch = raw.match(/^\d{3}:\s*(\{[\s\S]*\})$/);
  if (jsonMatch) {
    try {
      const body = JSON.parse(jsonMatch[1]) as { message?: string };
      if (body.message) return body.message;
    } catch {
      // ignore
    }
  }
  if (raw.includes("Unexpected token") && raw.includes("<!DOCTYPE")) {
    return "API trả về HTML thay vì JSON. Hãy restart server (`npm run dev`) rồi thử lại.";
  }
  if (raw.includes("API trả về HTML")) return raw;
  return raw || "Yêu cầu API thất bại";
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function readApiJson<T = unknown>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
      throw new Error(
        "API trả về HTML thay vì JSON. Route chưa sẵn sàng — hãy restart server (`npm run dev`).",
      );
    }
    throw new Error(`${res.status}: ${text.slice(0, 240)}`);
  }
  return res.json() as Promise<T>;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(url, {
    method,
    headers: {
      ...authHeaders,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export async function apiRequestJson<T = unknown>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const res = await apiRequest(method, url, data);
  return readApiJson<T>(res);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;

    if (queryKey.length > 1 && queryKey[1]) {
      const params = queryKey[1] as Record<string, any>;
      const searchParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }

      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    const authHeaders = await getAuthHeaders();
    const res = await fetch(url, {
      credentials: "include",
      headers: authHeaders,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await readApiJson(res);
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
