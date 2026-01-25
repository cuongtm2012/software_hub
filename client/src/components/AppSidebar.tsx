import {
    Home,
    Users,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    BarChart3,
    Bell,
    MessageSquare,
    FileText,
    Heart,
    Download,
    Star,
    DollarSign,
    Briefcase,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

// Menu items for different roles
const adminMenuItems = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: Home,
    },
    {
        title: "Users",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "Projects",
        url: "/admin/projects",
        icon: Briefcase,
    },
    {
        title: "Software",
        url: "/admin/software",
        icon: Package,
    },
    {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
    },
    {
        title: "Notifications",
        url: "/admin/push-notifications",
        icon: Bell,
    },
];

const sellerMenuItems = [
    {
        title: "Dashboard",
        url: "/seller",
        icon: Home,
    },
    {
        title: "My Products",
        url: "/marketplace/seller",
        icon: Package,
    },
    {
        title: "Orders",
        url: "/seller/orders",
        icon: ShoppingCart,
    },
    {
        title: "Analytics",
        url: "/seller/analytics",
        icon: BarChart3,
    },
    {
        title: "Messages",
        url: "/chat",
        icon: MessageSquare,
    },
];

const buyerMenuItems = [
    {
        title: "Dashboard",
        url: "/buyer",
        icon: Home,
    },
    {
        title: "Marketplace",
        url: "/marketplace",
        icon: Package,
    },
    {
        title: "My Orders",
        url: "/buyer/orders",
        icon: ShoppingCart,
    },
    {
        title: "Favorites",
        url: "/buyer/favorites",
        icon: Heart,
    },
    {
        title: "Downloads",
        url: "/buyer/downloads",
        icon: Download,
    },
    {
        title: "Reviews",
        url: "/buyer/reviews",
        icon: Star,
    },
];

const commonMenuItems = [
    {
        title: "Profile",
        url: "/profile",
        icon: Settings,
    },
];

export function AppSidebar() {
    const [location] = useLocation();
    const { user } = useAuth();

    // Determine menu items based on user role
    const getMenuItems = () => {
        if (!user) return [];

        switch (user.role) {
            case "admin":
                return [...adminMenuItems, ...commonMenuItems];
            case "seller":
                return [...sellerMenuItems, ...commonMenuItems];
            case "buyer":
            case "user":
                return [...buyerMenuItems, ...commonMenuItems];
            default:
                return commonMenuItems;
        }
    };

    const menuItems = getMenuItems();

    // Get role display name
    const getRoleDisplay = () => {
        if (!user) return "User";
        switch (user.role) {
            case "admin":
                return "Administrator";
            case "seller":
                return "Seller";
            case "buyer":
            case "user":
                return "Buyer";
            default:
                return "User";
        }
    };

    return (
        <Sidebar>
            <SidebarContent>
                {/* Logo */}
                <div className="px-6 py-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">SoftwareHub</h2>
                            <p className="text-xs text-muted-foreground">{getRoleDisplay()}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location === item.url}
                                        data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                    >
                                        <a href={item.url}>
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Quick Stats (for sellers and buyers) */}
                {user && (user.role === "seller" || user.role === "buyer" || user.role === "user") && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <div className="px-4 py-2 space-y-2">
                                {user.role === "seller" && (
                                    <>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Products</span>
                                            <span className="font-medium">-</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Revenue</span>
                                            <span className="font-medium">$-</span>
                                        </div>
                                    </>
                                )}
                                {(user.role === "buyer" || user.role === "user") && (
                                    <>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Purchases</span>
                                            <span className="font-medium">-</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Favorites</span>
                                            <span className="font-medium">-</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* User Footer */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-4 py-3 border-t">
                            <Avatar className="w-9 h-9">
                                <AvatarImage src={undefined} alt={user?.name || "User"} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                    {user?.name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user?.name || user?.email || "User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email || ""}
                                </p>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild data-testid="button-logout">
                            <a href="/api/logout">
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
