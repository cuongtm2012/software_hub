import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders, waitForAuthHeaders } from "@/lib/auth-token";
import { getAuthRedirectUrl } from "@/lib/auth-redirect";
import { completeAuthCallback, isAuthCallbackUrl } from "@/lib/auth-callback";

type AuthUser = Omit<User, "password">;

type OAuthProvider = "google" | "github";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<void, Error, RegisterData>;
  oauthLoginMutation: UseMutationResult<void, Error, OAuthProvider>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

async function fetchCurrentUser(options?: {
  authHeaders?: Record<string, string>;
  retries?: number;
}): Promise<AuthUser | null> {
  const retries = options?.retries ?? 1;
  let authHeaders = options?.authHeaders ?? (await getAuthHeaders());

  for (let attempt = 0; attempt < retries; attempt++) {
    if (!authHeaders.Authorization && attempt > 0) {
      authHeaders = await waitForAuthHeaders();
    }

    const res = await fetch("/api/user", {
      credentials: "include",
      headers: authHeaders,
    });
    if (res.status === 401) {
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        authHeaders = await waitForAuthHeaders();
        continue;
      }
      return null;
    }
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [authBootstrapping, setAuthBootstrapping] = useState(isAuthCallbackUrl);

  const {
    data: user,
    error,
    isLoading: userLoading,
  } = useQuery<AuthUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: fetchCurrentUser,
    enabled: !authBootstrapping,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const isLoading = authBootstrapping || userLoading;

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["/api/user"], null);
      } else if (!isAuthCallbackUrl()) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !authBootstrapping) return;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        await completeAuthCallback();
        const authHeaders = await waitForAuthHeaders();
        const currentUser = await fetchCurrentUser({ authHeaders, retries: 5 });
        if (cancelled) return;

        queryClient.setQueryData(["/api/user"], currentUser);

        if (currentUser) {
          window.location.href = currentUser.role === "admin" ? "/admin" : "/dashboard";
          return;
        }

        toast({
          title: "Đăng nhập thất bại",
          description:
            "Server chưa verify được Supabase token. Kiểm tra SUPABASE_SERVICE_KEY trên VPS.",
          variant: "destructive",
        });
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "OAuth thất bại",
            description: err instanceof Error ? err.message : "Không thể hoàn tất đăng nhập",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setAuthBootstrapping(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [authBootstrapping, toast]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      if (!supabase) {
        const res = await apiRequest("POST", "/api/login", credentials);
        return await res.json();
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (signInError) throw new Error(signInError.message);

      const currentUser = await fetchCurrentUser();
      if (!currentUser) {
        throw new Error(
          "Server chưa sync được user. Kiểm tra SUPABASE_SERVICE_KEY trên production.",
        );
      }
      return currentUser;
    },
    onSuccess: async (userData: AuthUser) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng trở lại, ${userData.name}!`,
      });
      setTimeout(() => {
        window.location.href = userData.role === "admin" ? "/admin" : "/dashboard";
      }, 300);
    },
    onError: (error: Error) => {
      toast({ title: "Đăng nhập thất bại", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      if (!supabase) {
        const res = await apiRequest("POST", "/api/register", { email: userData.email });
        return await res.json();
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: getAuthRedirectUrl("/auth"),
        },
      });
      if (signUpError) throw new Error(signUpError.message);
    },
    onSuccess: () => {
      toast({
        title: "Đăng ký thành công!",
        description: "Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.",
        duration: 6000,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Đăng ký thất bại", description: error.message, variant: "destructive" });
    },
  });

  const oauthLoginMutation = useMutation({
    mutationFn: async (provider: OAuthProvider) => {
      if (!supabase) throw new Error("Supabase chưa được cấu hình");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: getAuthRedirectUrl("/auth") },
      });
      if (error) throw new Error(error.message);
    },
    onError: (error: Error) => {
      toast({ title: "Đăng nhập thất bại", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (supabase) {
        await supabase.auth.signOut();
      }
      try {
        await apiRequest("POST", "/api/logout");
      } catch {
        // Session logout optional during migration
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({ title: "Đã đăng xuất", description: "Hẹn gặp lại!" });
    },
    onError: (error: Error) => {
      toast({ title: "Đăng xuất thất bại", description: error.message, variant: "destructive" });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        oauthLoginMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
