import { useEffect, useState, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getAuthRedirectUrl } from "@/lib/auth-redirect";
import { PageMeta } from "@/components/seo/page-meta";
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons";

const AuthQuickLoginDev = import.meta.env.DEV
  ? lazy(() =>
      import("@/components/auth-quick-login-dev").then((m) => ({
        default: m.AuthQuickLoginDev,
      })),
    )
  : null;

type AuthView = "login" | "register" | "recovery";

function isSupabaseRecoveryRedirect(): boolean {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return false;
  return new URLSearchParams(hash).get("type") === "recovery";
}

function AuthDivider({ label = "hoặc" }: { label?: string }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </span>
      </div>
    </div>
  );
}

function FieldLabel({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
      <Icon className="h-3.5 w-3.5 text-[#004080]" />
      {children}
    </label>
  );
}

function IconInput({
  icon: Icon,
  className = "",
  ...props
}: React.ComponentProps<typeof Input> & { icon: typeof Mail }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        {...props}
        className={`h-11 rounded-lg border-gray-200 bg-gray-50/50 pl-10 pr-3 focus-visible:bg-white focus-visible:ring-[#004080]/20 ${className}`}
      />
    </div>
  );
}

export default function AuthPageNew() {
  const { loginMutation, registerMutation, oauthLoginMutation } = useAuth();
  const [, navigate] = useLocation();
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "" });
  const [recoveryData, setRecoveryData] = useState({ password: "", confirmPassword: "" });

  const supabaseRequired = !import.meta.env.DEV && !supabase;
  const oauthPending = oauthLoginMutation.isPending;

  useEffect(() => {
    if (isSupabaseRecoveryRedirect()) setView("recovery");
  }, []);

  const recoveryMutation = useMutation({
    mutationFn: async (password: string) => {
      if (!supabase) throw new Error("Supabase chưa được cấu hình");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      window.history.replaceState(null, "", "/auth");
      toast({
        title: "Đặt mật khẩu thành công",
        description: "Bạn có thể đăng nhập với mật khẩu mới.",
      });
      setView("login");
      setRecoveryData({ password: "", confirmPassword: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Không thể đặt mật khẩu", description: error.message, variant: "destructive" });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseRequired) {
      toast({
        title: "Đăng nhập không khả dụng",
        description: "Supabase chưa được cấu hình trên môi trường này.",
        variant: "destructive",
      });
      return;
    }
    try {
      await loginMutation.mutateAsync(loginData);
    } catch {
      /* loginMutation.onError */
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseRequired) {
      toast({
        title: "Đăng ký không khả dụng",
        description: "Supabase chưa được cấu hình trên môi trường này.",
        variant: "destructive",
      });
      return;
    }
    try {
      await registerMutation.mutateAsync(registerData);
    } catch {
      /* registerMutation.onError */
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryData.password.length < 6) {
      toast({ title: "Mật khẩu quá ngắn", description: "Tối thiểu 6 ký tự.", variant: "destructive" });
      return;
    }
    if (recoveryData.password !== recoveryData.confirmPassword) {
      toast({ title: "Mật khẩu không khớp", variant: "destructive" });
      return;
    }
    recoveryMutation.mutate(recoveryData.password);
  };

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      toast({ title: "Nhập email trước", variant: "destructive" });
      return;
    }
    if (!supabase) {
      toast({ title: "Không khả dụng", description: "Yêu cầu Supabase Auth.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
      redirectTo: getAuthRedirectUrl("/auth"),
    });
    toast({
      title: error ? "Lỗi" : "Đã gửi email",
      description: error?.message || "Kiểm tra email để đặt lại mật khẩu.",
      variant: error ? "destructive" : "default",
    });
  };

  const tabs: { id: AuthView; label: string; icon: typeof LogIn }[] = [
    { id: "login", label: "Đăng nhập", icon: LogIn },
    { id: "register", label: "Đăng ký", icon: UserPlus },
  ];

  return (
    <div className="min-h-screen flex bg-[#f9f9f9]">
      <PageMeta title="Đăng nhập / Đăng ký" description="" noindex />

      {/* Brand panel */}
      <div className="relative hidden lg:flex lg:w-[44%] flex-col justify-center overflow-hidden bg-gradient-to-br from-[#004080] via-[#003366] to-[#002040] p-12 text-white">
        <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -right-24 bottom-16 h-96 w-96 rounded-full bg-[#ffcc00]/10" />

        <div className="relative z-10 max-w-md">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <span className="text-2xl font-bold tracking-tight">
              S<span className="text-[#ffcc00]">H</span>
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-bold leading-tight">SoftwareHub</h1>
          <p className="mb-8 text-base text-blue-100/90">
            Khám phá phần mềm, marketplace và cộng đồng developer Việt Nam.
          </p>

          <ul className="space-y-3.5">
            {[
              "Hàng nghìn phần mềm miễn phí",
              "Marketplace & thanh toán an toàn",
              "Đánh giá và chia sẻ từ cộng đồng",
            ].map((text) => (
              <li key={text} className="flex items-center gap-3 text-sm text-blue-50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffcc00]/20">
                  <Check className="h-3.5 w-3.5 text-[#ffcc00]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Auth card */}
      <div className="flex w-full flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-5 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#004080]"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </button>

          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
            {/* Mobile logo */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004080] text-sm font-bold text-white">
                SH
              </div>
              <div>
                <p className="font-semibold text-gray-900">SoftwareHub</p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Bảo mật bởi Supabase
                </p>
              </div>
            </div>

            {supabaseRequired && (
              <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                Thiếu <code className="rounded bg-white px-1">VITE_SUPABASE_URL</code> hoặc anon key khi build.
              </div>
            )}

            {view === "recovery" ? (
              <>
                <div className="mb-6 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004080]/10">
                    <KeyRound className="h-5 w-5 text-[#004080]" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Mật khẩu mới</h2>
                    <p className="mt-0.5 text-sm text-gray-500">Tạo mật khẩu mới cho tài khoản của bạn</p>
                  </div>
                </div>

                <form onSubmit={handleRecovery} className="space-y-4">
                  <div>
                    <FieldLabel icon={Lock}>Mật khẩu mới</FieldLabel>
                    <IconInput
                      icon={Lock}
                      type="password"
                      required
                      minLength={6}
                      value={recoveryData.password}
                      onChange={(e) => setRecoveryData({ ...recoveryData, password: e.target.value })}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                  <div>
                    <FieldLabel icon={Lock}>Xác nhận mật khẩu</FieldLabel>
                    <IconInput
                      icon={Lock}
                      type="password"
                      required
                      minLength={6}
                      value={recoveryData.confirmPassword}
                      onChange={(e) => setRecoveryData({ ...recoveryData, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={recoveryMutation.isPending}
                    className="h-11 w-full rounded-lg bg-[#004080] font-semibold hover:bg-[#003366]"
                  >
                    {recoveryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu mật khẩu"
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6 hidden lg:block">
                  <h2 className="text-xl font-bold text-gray-900">
                    {view === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Đăng nhập an toàn qua Supabase
                  </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setView(id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
                        view === id
                          ? "bg-white text-[#004080] shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Social first — compact */}
                <AuthSocialButtons
                  disabled={supabaseRequired}
                  pending={oauthPending}
                  onSelect={(p) => oauthLoginMutation.mutate(p)}
                />

                <AuthDivider label="hoặc dùng email" />

                {view === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <FieldLabel icon={Mail}>Email</FieldLabel>
                      <IconInput
                        icon={Mail}
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <FieldLabel icon={Lock}>Mật khẩu</FieldLabel>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          placeholder="••••••••"
                          className="h-11 rounded-lg border-gray-200 bg-gray-50/50 pl-10 pr-10 focus-visible:bg-white focus-visible:ring-[#004080]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#004080] focus:ring-[#004080]/30"
                        />
                        Ghi nhớ
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="font-medium text-[#004080] hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={loginMutation.isPending || supabaseRequired}
                      className="h-11 w-full rounded-lg bg-[#004080] font-semibold hover:bg-[#003366]"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang đăng nhập...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Đăng nhập
                        </>
                      )}
                    </Button>

                    <p className="pt-1 text-center text-sm text-gray-500">
                      Chưa có tài khoản?{" "}
                      <button
                        type="button"
                        onClick={() => setView("register")}
                        className="font-semibold text-[#004080] hover:underline"
                      >
                        Đăng ký ngay
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <FieldLabel icon={Mail}>Email</FieldLabel>
                      <IconInput
                        icon={Mail}
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <FieldLabel icon={Lock}>Mật khẩu</FieldLabel>
                      <IconInput
                        icon={Lock}
                        type="password"
                        required
                        minLength={6}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="Tối thiểu 6 ký tự"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={registerMutation.isPending || supabaseRequired}
                      className="h-11 w-full rounded-lg bg-[#004080] font-semibold hover:bg-[#003366]"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tạo tài khoản...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Tạo tài khoản
                        </>
                      )}
                    </Button>

                    <p className="pt-1 text-center text-sm text-gray-500">
                      Đã có tài khoản?{" "}
                      <button
                        type="button"
                        onClick={() => setView("login")}
                        className="font-semibold text-[#004080] hover:underline"
                      >
                        Đăng nhập
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}
          </div>

          {import.meta.env.DEV && AuthQuickLoginDev && (
            <Suspense fallback={null}>
              <AuthQuickLoginDev />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
