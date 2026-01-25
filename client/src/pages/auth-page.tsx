import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, Eye, EyeOff, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema - Email only
const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// Forgot password form schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [tabValue, setTabValue] = useState<string>("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Quick Login mutations
  const quickLoginMutation = useMutation({
    mutationFn: async (role: 'seller' | 'buyer' | 'admin') => {
      const response = await fetch(`/api/auth/quick-login/${role}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to quick login as ${role}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quick Login Successful",
        description: `Logged in as demo ${data.role}`,
      });
      // Trigger a page reload to update auth state
      window.location.href = data.role === 'admin' ? '/admin' : '/dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Quick Login Failed",
        description: error.message || "Failed to login. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set active tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab === "register") {
      setTabValue("register");
    } else {
      setTabValue("login");
    }
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Admin users go to admin dashboard, others go to regular dashboard
      if (user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",  // Changed to 'onBlur' to trigger validation when the input loses focus
  });

  // Reset form when switching to forgot password
  useEffect(() => {
    if (showForgotPassword) {
      forgotPasswordForm.reset({ email: "" });
    }
  }, [showForgotPassword, forgotPasswordForm]);

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormValues) => {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset email");
      }

      return response.json();
    },
    onSuccess: () => {
      setResetEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "If the email exists in our system, you'll receive a password reset link.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  };

  // Handle registration form submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate({
      email: values.email,
    });
  };

  // Handle forgot password form submission
  const onForgotPasswordSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values);
  };

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setTabValue(value);
    navigate(`/auth${value === "register" ? "?tab=register" : ""}`);
  };

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row rounded-xl overflow-hidden shadow-xl">
            {/* Hero section */}
            <div className="relative gradient-slate text-white p-8 lg:p-12 lg:w-1/2 overflow-hidden">
              {/* Abstract shapes in background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#ffcc00]"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-[#ffcc00]"></div>
                <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white"></div>
              </div>

              <div className="relative h-full flex flex-col justify-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  Welcome to SoftwareHub
                </h1>
                <p className="text-lg text-gray-100 mb-8 max-w-md">
                  Join our community to discover, download, and share free software with users from around the world.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 p-1 bg-[#ffcc00]/20 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ffcc00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-100">Access thousands of free software applications</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 p-1 bg-[#ffcc00]/20 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ffcc00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-100">Rate software and read honest user reviews</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 p-1 bg-[#ffcc00]/20 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ffcc00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-100">Discover new tools for Windows, Mac, and Linux</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 p-1 bg-[#ffcc00]/20 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ffcc00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-100">Share your favorite software with the community</span>
                  </li>
                </ul>

                <div className="mt-10 inline-block">
                  <span className="px-4 py-1 bg-[#ffcc00]/20 rounded-full text-[#ffcc00] text-sm font-medium">
                    Join 10,000+ developers and users
                  </span>
                </div>
              </div>
            </div>

            {/* Forms section */}
            <div className="bg-white p-8 lg:p-12 lg:w-1/2">
              <Tabs value={tabValue} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#004080] data-[state=active]:shadow-sm font-medium"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#004080] data-[state=active]:shadow-sm font-medium"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                {/* Login tab content */}
                <TabsContent value="login">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="space-y-1 pb-2">
                      <CardTitle className="text-2xl font-bold text-[#004080]">
                        {showForgotPassword
                          ? (resetEmailSent ? "Check your email" : "Reset your password")
                          : "Login to your account"
                        }
                      </CardTitle>
                      <CardDescription>
                        {showForgotPassword
                          ? (resetEmailSent
                            ? "We've sent a password reset link to your email address"
                            : "Enter your email address and we'll send you a link to reset your password"
                          )
                          : "Enter your email and password to access your account"
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Forgot Password State - Email confirmation */}
                      {showForgotPassword && resetEmailSent ? (
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-gray-600">
                            If your email address exists in our system, you will receive a password reset link shortly.
                          </p>
                          <Button
                            onClick={() => {
                              setShowForgotPassword(false);
                              setResetEmailSent(false);
                              forgotPasswordForm.reset();
                            }}
                            variant="outline"
                            className="w-full border-[#004080] text-[#004080] hover:bg-[#004080]/5"
                          >
                            Back to Login
                          </Button>
                        </div>
                      ) : showForgotPassword ? (
                        /* Forgot Password State - Email input form */
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              className="focus-visible:ring-[#004080]"
                              value={forgotPasswordForm.watch("email") || ""}
                              onChange={(e) => forgotPasswordForm.setValue("email", e.target.value)}
                            />
                          </div>

                          <div className="space-y-3">
                            <Button
                              onClick={() => {
                                const email = forgotPasswordForm.getValues("email");
                                if (email && email.includes("@")) {
                                  forgotPasswordMutation.mutate({ email });
                                } else {
                                  toast({
                                    title: "Invalid Email",
                                    description: "Please enter a valid email address.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="w-full bg-gradient-to-r from-[#004080] to-[#003366] hover:from-[#003366] hover:to-[#002040] text-white"
                              disabled={forgotPasswordMutation.isPending}
                            >
                              {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Send Reset Link
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowForgotPassword(false);
                                forgotPasswordForm.reset({ email: "" });
                              }}
                              className="w-full border-[#004080] text-[#004080] hover:bg-[#004080]/5"
                            >
                              Back to Login
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Login Form */
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      placeholder="Enter your email"
                                      className="focus-visible:ring-[#004080]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        type={showLoginPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="focus-visible:ring-[#004080] pr-10"
                                        {...field}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                      >
                                        {showLoginPassword ? (
                                          <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                          <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex items-center justify-between">
                              <FormField
                                control={loginForm.control}
                                name="rememberMe"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="border-gray-300 data-[state=checked]:bg-[#004080] data-[state=checked]:border-[#004080]"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal text-gray-600">Remember me</FormLabel>
                                  </FormItem>
                                )}
                              />
                              <Button
                                variant="link"
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="p-0 h-auto text-[#004080] hover:text-[#003366]"
                              >
                                Forgot password?
                              </Button>
                            </div>

                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-[#004080] to-[#003366] hover:from-[#003366] hover:to-[#002040] text-white"
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Sign in
                            </Button>
                          </form>
                        </Form>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col items-center border-t pt-4">
                      <div className="text-sm text-gray-500 mb-3">
                        Don't have an account?
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleTabChange("register")}
                        className="w-full border-[#004080] text-[#004080] hover:bg-[#004080]/5"
                      >
                        Create Account
                      </Button>
                      <div className="mt-4 space-y-3 w-full">
                        <div className="text-xs text-gray-500 text-center font-medium uppercase tracking-wide">
                          Quick Login (Development)
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            onClick={() => quickLoginMutation.mutate('seller')}
                            disabled={quickLoginMutation.isPending}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          >
                            <Zap className="mr-1 h-3 w-3" />
                            Seller
                          </Button>
                          <Button
                            onClick={() => quickLoginMutation.mutate('buyer')}
                            disabled={quickLoginMutation.isPending}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          >
                            <Zap className="mr-1 h-3 w-3" />
                            Buyer
                          </Button>
                          <Button
                            onClick={() => quickLoginMutation.mutate('admin')}
                            disabled={quickLoginMutation.isPending}
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                          >
                            <Zap className="mr-1 h-3 w-3" />
                            Admin
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Register tab content */}
                <TabsContent value="register">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="space-y-1 pb-2">
                      <CardTitle className="text-2xl font-bold text-[#004080]">Create an account</CardTitle>
                      <CardDescription>
                        Fill out the form below to create your SoftwareHub account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Email Address</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="focus-visible:ring-[#004080]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="bg-blue-50 border-l-4 border-[#004080] p-4 rounded">
                            <p className="text-sm text-gray-700">
                              <strong>What happens next:</strong>
                            </p>
                            <ul className="text-sm text-gray-600 mt-2 space-y-1">
                              <li>• We'll send a verification email to your inbox</li>
                              <li>• Click the link to set your password</li>
                              <li>• Complete your registration and start using SoftwareHub</li>
                            </ul>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#004080] to-[#003366] hover:from-[#003366] hover:to-[#002040] text-white"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Continue with Email
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center border-t pt-4">
                      <div className="text-sm text-gray-500 mb-3">
                        Already have an account?
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleTabChange("login")}
                        className="w-full border-[#004080] text-[#004080] hover:bg-[#004080]/5"
                      >
                        Sign In
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
