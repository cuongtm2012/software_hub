import { useEffect, useState, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageMeta } from "@/components/seo/page-meta";

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

  useEffect(() => {
    if (isSupabaseRecoveryRedirect()) {
      setView("recovery");
    }
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
      toast({
        title: "Không thể đặt mật khẩu",
        description: error.message,
        variant: "destructive",
      });
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
      // Handled by loginMutation.onError
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
      // Handled by registerMutation.onError
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryData.password.length < 6) {
      toast({
        title: "Mật khẩu quá ngắn",
        description: "Mật khẩu cần ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }
    if (recoveryData.password !== recoveryData.confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        description: "Vui lòng nhập lại mật khẩu xác nhận.",
        variant: "destructive",
      });
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
      toast({
        title: "Không khả dụng",
        description: "Quên mật khẩu yêu cầu Supabase Auth.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    toast({
      title: error ? "Lỗi" : "Đã gửi email",
      description: error?.message || "Kiểm tra email để đặt lại mật khẩu.",
      variant: error ? "destructive" : "default",
    });
  };

  const socialLoginButtons = (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={oauthLoginMutation.isPending || supabaseRequired}
        onClick={() => oauthLoginMutation.mutate("google")}
      >
        Đăng nhập với Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={oauthLoginMutation.isPending || supabaseRequired}
        onClick={() => oauthLoginMutation.mutate("github")}
      >
        Đăng nhập với GitHub
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <PageMeta title="Đăng nhập / Đăng ký" description="" noindex />
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-20 left-20 w-40 h-40 bg-slate-600/30 rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full" />

        <div className="relative z-10 max-w-md">
          <div className="w-32 h-32 bg-slate-600/50 rounded-full mb-8 flex items-center justify-center">
            <div className="text-4xl font-bold">
              <span className="text-white">S</span>
              <span className="text-amber-400">H</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-white">Welcome to SoftwareHub</h1>
          <p className="text-slate-300 text-lg mb-8">
            Join our community to discover, download, and share free software with users from around the world.
          </p>

          <div className="space-y-4 mb-8">
            {[
              "Access thousands of free software applications",
              "Rate software and read honest user reviews",
              "Discover new tools for Windows, Mac, and Linux",
              "Share your favorite software with the community",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-slate-200">{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setView("register")}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
          >
            Join 10,000+ developers and users
          </button>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-slate-800 mb-6 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {supabaseRequired && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Supabase chưa được cấu hình. Cần{" "}
              <code className="rounded bg-white px-1">VITE_SUPABASE_URL</code> và{" "}
              <code className="rounded bg-white px-1">VITE_SUPABASE_ANON_KEY</code> khi build production.
            </div>
          )}

          {view === "recovery" ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Đặt mật khẩu mới</h2>
                <p className="text-gray-600">Nhập mật khẩu mới cho tài khoản của bạn</p>
              </div>

              <form onSubmit={handleRecovery} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={recoveryData.password}
                    onChange={(e) => setRecoveryData({ ...recoveryData, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu</label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={recoveryData.confirmPassword}
                    onChange={(e) => setRecoveryData({ ...recoveryData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={recoveryMutation.isPending}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold"
                  size="lg"
                >
                  {recoveryMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu mật khẩu"
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setView("login")}
                  className={`flex-1 py-3 px-4 border-2 rounded-lg font-semibold transition-colors ${
                    view === "login"
                      ? "border-slate-700 text-slate-700 bg-white"
                      : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setView("register")}
                  className={`flex-1 py-3 px-4 border-2 rounded-lg font-semibold transition-colors ${
                    view === "register"
                      ? "border-slate-700 text-slate-700 bg-white"
                      : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  Register
                </button>
              </div>

              {view === "login" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Login to your account</h2>
                    <p className="text-gray-600">Enter your email and password to access your account</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          placeholder="••••••••••"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-slate-700 border-gray-300 rounded focus:ring-2 focus:ring-slate-500"
                        />
                        <span className="text-sm text-gray-700">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-sm text-slate-700 hover:text-slate-900 font-semibold"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={loginMutation.isPending || supabaseRequired}
                      className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold"
                      size="lg"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-50 px-2 text-gray-500">hoặc</span>
                      </div>
                    </div>

                    {socialLoginButtons}
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-3">Don&apos;t have an account?</p>
                    <Button
                      onClick={() => setView("register")}
                      variant="outline"
                      className="w-full border-2 border-slate-700 text-slate-700 hover:bg-slate-50 font-semibold"
                      size="lg"
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}

              {view === "register" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Create an account</h2>
                    <p className="text-gray-600">Fill out the form below to create your SoftwareHub account</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <Input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <Input
                        type="password"
                        required
                        minLength={6}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={registerMutation.isPending || supabaseRequired}
                      className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold"
                      size="lg"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Continue with Email"
                      )}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-50 px-2 text-gray-500">hoặc</span>
                      </div>
                    </div>

                    {socialLoginButtons}
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
                    <Button
                      onClick={() => setView("login")}
                      variant="outline"
                      className="w-full border-2 border-slate-700 text-slate-700 hover:bg-slate-50 font-semibold"
                      size="lg"
                    >
                      Sign In
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

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
