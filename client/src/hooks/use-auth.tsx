import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from "@/lib/auth-token";

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

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/user", {
    credentials: "include",
    headers: authHeaders,
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<AuthUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: fetchCurrentUser,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["/api/user"], null);
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      if (!supabase) {
        const res = await apiRequest("POST", "/api/login", credentials);
        return await res.json();
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (signInError) throw new Error(signInError.message);

      const currentUser = await fetchCurrentUser();
      if (!currentUser) throw new Error("Failed to sync user profile");
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
          emailRedirectTo: `${window.location.origin}/auth`,
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
        options: { redirectTo: `${window.location.origin}/dashboard` },
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
