import type { ComponentType } from "react";
import {
    Home,
    Users,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    BarChart3,
    Bell,
    ListChecks,
    MessageSquare,
    FileText,
    Heart,
    Download,
    Star,
    DollarSign,
    Briefcase,
    BookOpen,
    UserCheck,
    Mail,
    FlaskConical,
    Wrench,
    Headphones,
    Store,
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

type MenuItem = {
    title: string;
    url: string;
    icon: ComponentType<{ className?: string }>;
};

type MenuGroup = { label: string; items: MenuItem[] };

const adminMenuGroups: MenuGroup[] = [
    {
        label: "Tổng quan",
        items: [
            { title: "Bảng điều khiển", url: "/admin", icon: Home },
            { title: "Phân tích", url: "/admin/analytics", icon: BarChart3 },
        ],
    },
    {
        label: "Người dùng",
        items: [
            { title: "Người dùng", url: "/admin/users", icon: Users },
            { title: "Duyệt Seller", url: "/admin/seller-approvals", icon: UserCheck },
        ],
    },
    {
        label: "Marketplace",
        items: [
            { title: "Phần mềm (catalog)", url: "/admin/software", icon: Package },
            { title: "Sản phẩm MP", url: "/admin/products", icon: Store },
            { title: "Đơn hàng", url: "/admin/orders", icon: ShoppingCart },
        ],
    },
    {
        label: "Nội dung & GTM",
        items: [
            { title: "Blog", url: "/admin/blog", icon: FileText },
            { title: "Khóa học (SEO)", url: "/admin/courses", icon: BookOpen },
            { title: "Leads", url: "/admin/leads", icon: Mail },
        ],
    },
    {
        label: "Vận hành",
        items: [
            { title: "Yêu cầu dự án", url: "/admin/projects", icon: Briefcase },
            { title: "Dịch vụ IT", url: "/admin/service-requests", icon: Wrench },
            { title: "Support", url: "/admin/support-tickets", icon: Headphones },
        ],
    },
];

const adminDevGroup: MenuGroup = {
    label: "Dev Tools",
    items: [
        { title: "Email Tests", url: "/admin/email-tests", icon: Mail },
        { title: "E2E Tests", url: "/admin/end-to-end-tests", icon: FlaskConical },
        { title: "Push Tests", url: "/admin/push-notifications", icon: Bell },
        { title: "Hàng đợi", url: "/admin/queues", icon: ListChecks },
    ],
};

const sellerMenuItems: MenuItem[] = [
    { title: "Dashboard", url: "/seller", icon: Home },
    { title: "Sản phẩm", url: "/marketplace/seller", icon: Package },
    { title: "Đơn hàng", url: "/seller/orders", icon: ShoppingCart },
    { title: "Phân tích", url: "/seller/analytics", icon: BarChart3 },
];

const buyerMenuItems: MenuItem[] = [
    { title: "Dashboard", url: "/buyer", icon: Home },
    { title: "Marketplace", url: "/marketplace", icon: Package },
    { title: "Đơn hàng", url: "/buyer/orders", icon: ShoppingCart },
    { title: "Yêu thích", url: "/buyer/favorites", icon: Heart },
    { title: "Tải xuống", url: "/buyer/downloads", icon: Download },
    { title: "Đánh giá", url: "/buyer/reviews", icon: Star },
];

const commonMenuItems: MenuItem[] = [
    { title: "Hồ sơ", url: "/profile", icon: Settings },
];

function isMenuActive(location: string, url: string): boolean {
    if (url === "/admin" || url === "/seller" || url === "/buyer") {
        return location === url;
    }
    return location === url || location.startsWith(url + "/");
}

function MenuGroupSection({ group, location }: { group: MenuGroup; location: string }) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {group.items.map((item) => (
                        <SidebarMenuItem key={item.url}>
                            <SidebarMenuButton
                                asChild
                                isActive={isMenuActive(location, item.url)}
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
    );
}

export function AppSidebar() {
    const [location] = useLocation();
    const { user } = useAuth();

    const getRoleDisplay = () => {
        if (!user) return "User";
        switch (user.role) {
            case "admin": return "Quản trị viên";
            case "seller": return "Seller";
            case "buyer":
            case "user": return "Buyer";
            default: return "User";
        }
    };

    if (!user) return null;

    return (
        <Sidebar>
            <SidebarContent>
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

                {user.role === "admin" ? (
                    <>
                        {adminMenuGroups.map((g) => (
                            <MenuGroupSection key={g.label} group={g} location={location} />
                        ))}
                        <MenuGroupSection group={adminDevGroup} location={location} />
                        <MenuGroupSection
                            group={{ label: "Tài khoản", items: commonMenuItems }}
                            location={location}
                        />
                    </>
                ) : (
                    <SidebarGroup>
                        <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {(user.role === "seller"
                                    ? [...sellerMenuItems, ...commonMenuItems]
                                    : user.role === "buyer" || user.role === "user"
                                      ? [...buyerMenuItems, ...commonMenuItems]
                                      : commonMenuItems
                                ).map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton asChild isActive={isMenuActive(location, item.url)}>
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
                )}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-4 py-3 border-t">
                            <Avatar className="w-9 h-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                    {user?.name?.substring(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="/api/logout">
                                <LogOut className="w-4 h-4" />
                                <span>Đăng xuất</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
