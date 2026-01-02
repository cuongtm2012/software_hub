import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

// Password setup schema
const setPasswordSchema = z.object({
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
    name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

export default function SupabaseSetPasswordPage() {
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [email, setEmail] = useState<string>("");
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordSet, setPasswordSet] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SetPasswordFormValues>({
        resolver: zodResolver(setPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
            name: "",
        },
    });

    // Handle email verification on mount
    useEffect(() => {
        const handleEmailVerification = async () => {
            try {
                // Get the code from URL
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get("code");

                if (!code) {
                    setError("No verification code provided");
                    setVerifying(false);
                    return;
                }

                // Exchange code for session
                const { data, error: verifyError } = await supabase.auth.exchangeCodeForSession(code);

                if (verifyError) {
                    console.error("Verification error:", verifyError);
                    setError(verifyError.message || "Verification failed");
                    setVerifying(false);
                    return;
                }

                if (data.user) {
                    setEmail(data.user.email || "");
                    setVerified(true);

                    // Pre-fill name if available
                    if (data.user.user_metadata?.name) {
                        form.setValue("name", data.user.user_metadata.name);
                    }
                }

                setVerifying(false);
            } catch (err: any) {
                console.error("Verification error:", err);
                setError(err.message || "An error occurred during verification");
                setVerifying(false);
            }
        };

        handleEmailVerification();
    }, [form]);

    const onSubmit = async (values: SetPasswordFormValues) => {
        setIsSubmitting(true);
        try {
            // Update password in Supabase
            const { error: updateError } = await supabase.auth.updateUser({
                password: values.password,
                data: {
                    name: values.name || email.split('@')[0],
                }
            });

            if (updateError) {
                throw updateError;
            }

            setPasswordSet(true);
            toast({
                title: "Success!",
                description: "Your password has been set. You can now login.",
            });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/auth");
            }, 3000);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to set password. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-[#004080] mx-auto mb-4" />
                        <p className="text-gray-600">Verifying your email...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow bg-gray-50">
                    <div className="max-w-md mx-auto px-4 py-16">
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-600">Verification Failed</CardTitle>
                                <CardDescription>{error}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">
                                    The verification link may have expired or is invalid.
                                </p>
                                <Button
                                    onClick={() => navigate("/auth?tab=register")}
                                    className="w-full bg-gradient-to-r from-[#004080] to-[#003366] hover:from-[#003366] hover:to-[#002040] text-white"
                                >
                                    Back to Registration
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (passwordSet) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow bg-gray-50">
                    <div className="max-w-md mx-auto px-4 py-16">
                        <Card className="border-green-200">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <CardTitle className="text-green-600">Password Set Successfully!</CardTitle>
                                <CardDescription>
                                    Your account is now active. Redirecting to login...
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow bg-gray-50">
                <div className="max-w-md mx-auto px-4 py-16">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[#004080]">
                                Set Your Password
                            </CardTitle>
                            <CardDescription>
                                Create a password for your account: <strong>{email}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700">Full Name (Optional)</FormLabel>
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
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Create a strong password"
                                                            className="focus-visible:ring-[#004080] pr-10"
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
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
                                        control={form.control}
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

                                    <div className="bg-blue-50 border-l-4 border-[#004080] p-4 rounded">
                                        <p className="text-sm text-gray-700">
                                            <strong>Password requirements:</strong>
                                        </p>
                                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                            <li>• At least 8 characters</li>
                                            <li>• One uppercase letter</li>
                                            <li>• One lowercase letter</li>
                                            <li>• One number</li>
                                        </ul>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-[#004080] to-[#003366] hover:from-[#003366] hover:to-[#002040] text-white"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Set Password & Activate Account
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
