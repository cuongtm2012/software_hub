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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.acceptTerms === true, {
  message: "You must accept the terms and conditions",
  path: ["acceptTerms"],
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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

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
      name: values.name,
      email: values.email,
      password: values.password,
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
            <div className="relative bg-gradient-to-br from-[#004080] to-[#002040] text-white p-8 lg:p-12 lg:w-1/2 overflow-hidden">
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
                        <Form {...forgotPasswordForm}>
                          <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                            <FormField
                              control={forgotPasswordForm.control}
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
                            
                            <div className="space-y-3">
                              <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-[#004080] to-[#003366] hover:from-[#003366] hover:to-[#002040] text-white"
                                disabled={forgotPasswordMutation.isPending}
                              >
                                {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                              </Button>
                              
                              <Button 
                                type="button"
                                variant="outline"
                                onClick={() => setShowForgotPassword(false)}
                                className="w-full border-[#004080] text-[#004080] hover:bg-[#004080]/5"
                              >
                                Back to Login
                              </Button>
                            </div>
                          </form>
                        </Form>
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
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Full Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your full name" 
                                    className="focus-visible:ring-[#004080]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
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
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type={showRegisterPassword ? "text" : "password"}
                                      placeholder="Create a password" 
                                      className="focus-visible:ring-[#004080] pr-10"
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                    >
                                      {showRegisterPassword ? (
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
                          
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type={showConfirmPassword ? "text" : "password"}
                                      placeholder="Confirm your password" 
                                      className="focus-visible:ring-[#004080] pr-10"
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                      {showConfirmPassword ? (
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
                          
                          <FormField
                            control={registerForm.control}
                            name="acceptTerms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-gray-300 data-[state=checked]:bg-[#004080] data-[state=checked]:border-[#004080] mt-1"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal text-gray-600">
                                    I agree to the{" "}
                                    <Button variant="link" className="p-0 h-auto text-[#004080] hover:text-[#003366]">
                                      Terms of Service
                                    </Button>{" "}
                                    and{" "}
                                    <Button variant="link" className="p-0 h-auto text-[#004080] hover:text-[#003366]">
                                      Privacy Policy
                                    </Button>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-[#004080] to-[#003366] hover:from-[#003366] hover:to-[#002040] text-white"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
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
