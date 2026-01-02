import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Auth user type based on Supabase user
type AuthUser = {
    id: string;
    email: string;
    name?: string;
    role?: string;
};

type AuthContextType = {
    user: AuthUser | null;
    session: Session | null;
    isLoading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
                    role: session.user.user_metadata?.role || 'user',
                });
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
                    role: session.user.user_metadata?.role || 'user',
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            toast({
                title: "Registration successful!",
                description: "Please check your email to verify your account.",
                duration: 6000,
            });
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message || "An error occurred during registration",
                variant: "destructive",
            });
            throw error;
        }
    };

    // Email-only signup - sends verification email with redirect to set password
    const signUpWithEmail = async (email: string) => {
        try {
            // Generate a temporary password
            const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);

            const { data, error } = await supabase.auth.signUp({
                email,
                password: tempPassword,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/set-password`,
                    data: {
                        needs_password_setup: true,
                    }
                },
            });

            if (error) throw error;

            toast({
                title: "Check your email!",
                description: "We've sent you a verification link. Click it to set your password and complete registration.",
                duration: 8000,
            });
        } catch (error: any) {
            toast({
                title: "Registration failed",
                description: error.message || "An error occurred during registration",
                variant: "destructive",
            });
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast({
                title: "Login successful",
                description: `Welcome back, ${data.user.email}!`,
            });

            // Redirect based on role
            setTimeout(() => {
                const role = data.user.user_metadata?.role || 'user';
                if (role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            }, 500);
        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.message || "Invalid email or password",
                variant: "destructive",
            });
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            toast({
                title: "Logged out",
                description: "You have been successfully logged out.",
            });
        } catch (error: any) {
            toast({
                title: "Logout failed",
                description: error.message,
                variant: "destructive",
            });
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast({
                title: "Google login failed",
                description: error.message,
                variant: "destructive",
            });
            throw error;
        }
    };

    const signInWithFacebook = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast({
                title: "Facebook login failed",
                description: error.message,
                variant: "destructive",
            });
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                signUp,
                signUpWithEmail,
                signIn,
                signOut,
                signInWithGoogle,
                signInWithFacebook,
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
