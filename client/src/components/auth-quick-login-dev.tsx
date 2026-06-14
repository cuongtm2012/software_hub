import { useMutation } from "@tanstack/react-query";
import { Code, Users, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { DEMO_ACCOUNTS, type DemoRole } from "@shared/demo-accounts";

export function AuthQuickLoginDev() {
  const { toast } = useToast();

  const quickLoginMutation = useMutation({
    mutationFn: async (role: DemoRole) => {
      const creds = DEMO_ACCOUNTS[role];
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: creds.email,
          password: creds.password,
        });
        if (error) throw new Error(error.message);
        const session = (await supabase.auth.getSession()).data.session;
        const res = await fetch("/api/user", {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        });
        if (!res.ok) throw new Error("Failed to sync user profile");
        return res.json();
      }
      const response = await fetch(`/api/auth/quick-login/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to quick login as ${role}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Quick Login Successful",
        description: `Logged in as ${data.name} (${data.role})`,
      });
      window.location.href = data.role === "admin" ? "/admin" : "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Quick Login Failed",
        description: error.message || "Run: npx tsx scripts/seed-demo-users.ts",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="mt-8">
      <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-wider">
        Quick Login (Development)
      </p>
      <div className="mb-3 rounded-lg bg-slate-100 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-700 text-center mb-2">
          Tài khoản test — mật khẩu:{" "}
          <code className="bg-white px-1 rounded">testpassword</code>
        </p>
        {(Object.entries(DEMO_ACCOUNTS) as [DemoRole, typeof DEMO_ACCOUNTS.seller][]).map(
          ([role, acc]) => (
            <p key={role} className="flex justify-between gap-2">
              <span className="font-medium capitalize">{acc.label}</span>
              <span className="text-slate-500 truncate">{acc.email}</span>
            </p>
          ),
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => quickLoginMutation.mutate("seller")}
          disabled={quickLoginMutation.isPending}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <Code className="w-4 h-4" />
          Seller
        </button>
        <button
          type="button"
          onClick={() => quickLoginMutation.mutate("buyer")}
          disabled={quickLoginMutation.isPending}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <Users className="w-4 h-4" />
          Buyer
        </button>
        <button
          type="button"
          onClick={() => quickLoginMutation.mutate("admin")}
          disabled={quickLoginMutation.isPending}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <Crown className="w-4 h-4" />
          Admin
        </button>
      </div>
    </div>
  );
}
