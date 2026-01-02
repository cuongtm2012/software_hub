import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const [, setLocation] = useLocation();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Handle the OAuth callback
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Auth callback error:", error);
                setError(error.message);
                setTimeout(() => setLocation("/auth"), 3000);
                return;
            }

            if (session) {
                // Successfully authenticated, redirect to dashboard
                setTimeout(() => {
                    const role = session.user.user_metadata?.role || 'user';
                    if (role === 'admin') {
                        setLocation("/admin");
                    } else {
                        setLocation("/dashboard");
                    }
                }, 1000);
            } else {
                // No session, redirect to auth page
                setTimeout(() => setLocation("/auth"), 2000);
            }
        });
    }, [setLocation]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Completing authentication...</p>
        </div>
    );
}
