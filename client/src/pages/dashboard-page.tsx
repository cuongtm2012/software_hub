import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { AlertCircle, LayoutDashboard, Loader2, Package, Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NotificationBanner } from "@/components/NotificationBanner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductsTab } from "@/components/dashboard/products-tab";
import { ProjectsTab } from "@/components/dashboard/projects-tab";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { MainTabs } from "@/components/design-system/main-tabs";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const data = useDashboardData(user);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      navigate("/admin");
      return;
    }
    if (user.role === "buyer" || user.role === "user") {
      navigate("/buyer");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="w-full min-w-0 max-w-full px-[4%] py-8 max-w-md">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Cần đăng nhập</h2>
                <p className="text-muted-foreground mb-4">
                  Vui lòng đăng nhập để truy cập bảng điều khiển.
                </p>
                <Button onClick={() => navigate("/auth")} className="bg-[#004080] hover:bg-[#003366]">
                  Đăng nhập
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user.role === "admin" || user.role === "buyer" || user.role === "user") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080] mx-auto mb-4" />
            <p className="text-muted-foreground">Đang chuyển hướng…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSeller = data.isSeller;
  const primaryAction = isSeller ? (
    <Button onClick={() => navigate("/seller/products/new")} className="bg-[#004080] hover:bg-[#003366]">
      <Plus className="h-4 w-4 mr-2" />
      Thêm sản phẩm
    </Button>
  ) : (
    <Button onClick={() => navigate("/request-project")} className="bg-[#004080] hover:bg-[#003366]">
      <Plus className="h-4 w-4 mr-2" />
      Tạo dự án
    </Button>
  );

  const tabs = [
    ...(isSeller
      ? [
          {
            value: "products",
            label: "Sản phẩm",
            icon: <Package className="h-4 w-4 shrink-0" />,
            content: (
              <ProductsTab
                products={data.products}
                productStats={data.productStats}
                isLoading={data.productsLoading}
                page={data.productPage}
                totalPages={data.productTotalPages}
                totalItems={data.productStats.total}
                onPageChange={data.setProductPage}
                onDelete={data.deleteProduct}
                isDeleting={data.isDeletingProduct}
                deletingId={data.deletingProductId}
              />
            ),
          },
        ]
      : []),
    {
      value: "projects",
      label: "Dự án",
      icon: <Briefcase className="h-4 w-4 shrink-0" />,
      content: (
        <ProjectsTab
          projects={data.projects}
          projectStats={data.projectStats}
          projectCounts={data.projectCounts}
          status={data.projectStatus}
          onStatusChange={data.setProjectStatus}
          isLoading={data.projectsLoading}
          page={data.projectPage}
          totalPages={data.projectTotalPages}
          totalItems={data.projectsTotal}
          onPageChange={data.setProjectPage}
          showQuotesMetric={!isSeller}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="w-full min-w-0 max-w-full px-[4%] py-6 sm:py-8">
          <DashboardShell
            title={`Xin chào, ${user.name}`}
            subtitle={
              isSeller
                ? "Quản lý sản phẩm và dự án trên Software Hub"
                : "Theo dõi dự án và báo giá từ developer"
            }
            icon={LayoutDashboard}
            badge={isSeller ? "Seller" : "Client"}
            onRefresh={data.refetchAll}
            actions={primaryAction}
          >
            <MainTabs defaultValue={isSeller ? "products" : "projects"} tabs={tabs} />
          </DashboardShell>
        </div>
      </main>
      <Footer />
      <NotificationBanner userId={user.id} />
    </div>
  );
}
