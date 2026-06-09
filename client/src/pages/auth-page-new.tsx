import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, ArrowLeft, Code, Users, Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { DEMO_ACCOUNTS, type DemoRole } from "@shared/demo-accounts";
import { PageMeta } from "@/components/seo/page-meta";

export default function AuthPageNew() {
    const { loginMutation, registerMutation, googleLoginMutation } = useAuth();
    const [, navigate] = useLocation();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { toast } = useToast();

    // Form states
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ email: '', password: '' });

    const quickLoginMutation = useMutation({
        mutationFn: async (role: DemoRole) => {
            const creds = DEMO_ACCOUNTS[role];
            if (supabase) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: creds.email,
                    password: creds.password,
                });
                if (error) throw new Error(error.message);
                const res = await fetch("/api/user", {
                    headers: {
                        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                    },
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
        onSuccess: async (data) => {
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginMutation.mutateAsync(loginData);
            toast({ title: "Login Successful", description: "Welcome back!" });
            navigate('/dashboard');
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid credentials",
                variant: "destructive",
            });
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerMutation.mutateAsync(registerData);
            toast({
                title: "Registration Successful",
                description: "Please check your email to set your password",
            });
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to register",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex">
            <PageMeta title="Đăng nhập / Đăng ký" description="" noindex />
            {/* Left Panel - Welcome Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white p-12 flex-col justify-center relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-20 left-20 w-40 h-40 bg-slate-600/30 rounded-full"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full"></div>

                <div className="relative z-10 max-w-md">
                    {/* Logo Circle */}
                    <div className="w-32 h-32 bg-slate-600/50 rounded-full mb-8 flex items-center justify-center">
                        <div className="text-4xl font-bold">
                            <span className="text-white">S</span>
                            <span className="text-amber-400">H</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold mb-4 text-white">
                        Welcome to SoftwareHub
                    </h1>
                    <p className="text-slate-300 text-lg mb-8">
                        Join our community to discover, download, and share free software with users from around the world.
                    </p>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-slate-200">Access thousands of free software applications</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-slate-200">Rate software and read honest user reviews</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-slate-200">Discover new tools for Windows, Mac, and Linux</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-slate-200">Share your favorite software with the community</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setActiveTab('register')}
                        className="px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                    >
                        Join 10,000+ developers and users
                    </button>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Back to Home Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-slate-800 mb-6 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-3 px-4 border-2 rounded-lg font-semibold transition-colors ${activeTab === 'login'
                                ? 'border-slate-700 text-slate-700 bg-white'
                                : 'border-gray-300 text-gray-500 hover:border-gray-400'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-3 px-4 border-2 rounded-lg font-semibold transition-colors ${activeTab === 'register'
                                ? 'border-slate-700 text-slate-700 bg-white'
                                : 'border-gray-300 text-gray-500 hover:border-gray-400'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Login Form */}
                    {activeTab === 'login' && (
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
                                        placeholder="admin@phimgg.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
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
                                        onClick={async () => {
                                            if (!loginData.email) {
                                                toast({ title: "Nhập email trước", variant: "destructive" });
                                                return;
                                            }
                                            const { supabase } = await import("@/lib/supabase");
                                            if (supabase) {
                                                const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
                                                    redirectTo: `${window.location.origin}/auth`,
                                                });
                                                toast({
                                                    title: error ? "Lỗi" : "Đã gửi email",
                                                    description: error?.message || "Kiểm tra email để đặt lại mật khẩu.",
                                                    variant: error ? "destructive" : "default",
                                                });
                                            }
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loginMutation.isPending}
                                    className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold"
                                    size="lg"
                                >
                                    {loginMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                                    <div className="relative flex justify-center text-sm"><span className="bg-gray-50 px-2 text-gray-500">hoặc</span></div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={googleLoginMutation.isPending}
                                    onClick={() => googleLoginMutation.mutate()}
                                >
                                    Đăng nhập với Google
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
                                <Button
                                    onClick={() => setActiveTab('register')}
                                    variant="outline"
                                    className="w-full border-2 border-slate-700 text-slate-700 hover:bg-slate-50 font-semibold"
                                    size="lg"
                                >
                                    Create Account
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Register Form */}
                    {activeTab === 'register' && (
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
                                    disabled={registerMutation.isPending}
                                    className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold"
                                    size="lg"
                                >
                                    {registerMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Continue with Email'
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
                                <Button
                                    onClick={() => setActiveTab('login')}
                                    variant="outline"
                                    className="w-full border-2 border-slate-700 text-slate-700 hover:bg-slate-50 font-semibold"
                                    size="lg"
                                >
                                    Sign In
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Quick Login Section */}
                    <div className="mt-8">
                        <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-wider">
                            Quick Login (Development)
                        </p>
                        <div className="mb-3 rounded-lg bg-slate-100 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
                            <p className="font-semibold text-slate-700 text-center mb-2">Tài khoản test — mật khẩu: <code className="bg-white px-1 rounded">testpassword</code></p>
                            {(Object.entries(DEMO_ACCOUNTS) as [DemoRole, typeof DEMO_ACCOUNTS.seller][]).map(([role, acc]) => (
                                <p key={role} className="flex justify-between gap-2">
                                    <span className="font-medium capitalize">{acc.label}</span>
                                    <span className="text-slate-500 truncate">{acc.email}</span>
                                </p>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => quickLoginMutation.mutate('seller')}
                                disabled={quickLoginMutation.isPending}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm disabled:opacity-50"
                            >
                                <Code className="w-4 h-4" />
                                Seller
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLoginMutation.mutate('buyer')}
                                disabled={quickLoginMutation.isPending}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm disabled:opacity-50"
                            >
                                <Users className="w-4 h-4" />
                                Buyer
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLoginMutation.mutate('admin')}
                                disabled={quickLoginMutation.isPending}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm disabled:opacity-50"
                            >
                                <Crown className="w-4 h-4" />
                                Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
