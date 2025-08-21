import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { user } = useAuth();
    const [, navigate] = useLocation();

    // Redirect if not admin
    if (user?.role !== "admin") {
        navigate("/");
        return null;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <div className="border-b bg-background">
                        <div className="flex h-16 items-center px-4 gap-4">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex-1" />
                        </div>
                    </div>
                    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
