import { ReactNode, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { user, isLoading } = useAuth();
    const [, navigate] = useLocation();
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        if (!isLoading && user && !isAdmin) {
            navigate("/");
        }
    }, [user, isAdmin, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="border-b bg-background">
                        <div className="flex h-16 items-center px-4 gap-4">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex-1" />
                        </div>
                    </div>
                    <main className="flex-1 overflow-auto bg-background">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
