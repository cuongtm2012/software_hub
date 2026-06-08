import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SectionPanel } from "@/components/design-system/section-panel";
import { formatVnd } from "@/components/dashboard/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Heart,
  Download,
  Star,
  Search,
  Eye,
  Package,
  LayoutDashboard,
} from "lucide-react";

interface BuyerStats {
  totalPurchases: number;
  totalFavorites: number;
  totalDownloads: number;
  reviewsWritten: number;
  purchasesTrend?: { value: number; isPositive: boolean };
  favoritesTrend?: { value: number; isPositive: boolean };
  downloadsTrend?: { value: number; isPositive: boolean };
  reviewsTrend?: { value: number; isPositive: boolean };
}

interface Purchase {
  id: number;
  product_title: string;
  seller_name: string;
  price: number;
  status: string;
  purchased_at: string;
  download_url?: string;
}

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const isBuyer = !!user && (user.role === "buyer" || user.role === "user");

  useEffect(() => {
    if (user && !isBuyer) {
      navigate("/");
    }
  }, [user, isBuyer, navigate]);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<BuyerStats>({
    queryKey: ["/api/buyer/stats"],
    enabled: isBuyer,
    initialData: {
      totalPurchases: 0,
      totalFavorites: 0,
      totalDownloads: 0,
      reviewsWritten: 0,
    },
  });

  const { data: purchasesData, isLoading: purchasesLoading, refetch: refetchPurchases } = useQuery<{
    purchases: Purchase[];
  }>({
    queryKey: ["/api/buyer/purchases"],
    enabled: isBuyer,
    initialData: { purchases: [] },
  });

  const purchases = purchasesData?.purchases || [];
  const filteredPurchases = purchases.filter((p) =>
    p.product_title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRefresh = () => {
    refetchStats();
    refetchPurchases();
  };

  if (!isBuyer) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <DashboardShell
            title="Bảng điều khiển người mua"
            subtitle="Theo dõi đơn hàng, yêu thích và tải xuống phần mềm"
            icon={LayoutDashboard}
            onRefresh={handleRefresh}
            actions={
              <Button
                onClick={() => navigate("/marketplace")}
                className="bg-[#004080] hover:bg-[#003366]"
              >
                <Package className="w-4 h-4 mr-2" />
                Khám phá marketplace
              </Button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))
              ) : (
                <>
                  <MetricCard
                    label="Đã mua"
                    value={stats?.totalPurchases ?? 0}
                    icon={ShoppingCart}
                    trend={stats?.purchasesTrend}
                    hint="Sản phẩm đã thanh toán"
                  />
                  <MetricCard
                    label="Yêu thích"
                    value={stats?.totalFavorites ?? 0}
                    icon={Heart}
                    trend={stats?.favoritesTrend}
                    hint="Đã lưu để xem sau"
                  />
                  <MetricCard
                    label="Tải xuống"
                    value={stats?.totalDownloads ?? 0}
                    icon={Download}
                    trend={stats?.downloadsTrend}
                    hint="File đã tải"
                  />
                  <MetricCard
                    label="Đánh giá"
                    value={stats?.reviewsWritten ?? 0}
                    icon={Star}
                    trend={stats?.reviewsTrend}
                    hint="Review đã viết"
                  />
                </>
              )}
            </div>

            <SectionPanel
              title="Lịch sử mua hàng"
              subtitle={`${filteredPurchases.length} đơn hàng`}
            >
              <div className="relative max-w-md mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm theo tên sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 uupm-focus"
                />
              </div>

              <div className="rounded-lg border border-[#004080]/10 overflow-hidden">
                {purchasesLoading ? (
                  <div className="p-8 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : filteredPurchases.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Người bán</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">{purchase.product_title}</TableCell>
                          <TableCell className="text-muted-foreground">{purchase.seller_name}</TableCell>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {formatVnd(purchase.price)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={purchase.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(purchase.purchased_at).toLocaleDateString("vi-VN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" aria-label="Xem chi tiết">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {purchase.download_url && (
                                <Button variant="ghost" size="sm" aria-label="Tải xuống">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={ShoppingCart}
                    title={searchQuery ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
                    description={
                      searchQuery
                        ? "Thử từ khóa khác hoặc xóa bộ lọc"
                        : "Khám phá marketplace để mua phần mềm phù hợp"
                    }
                    actionLabel={!searchQuery ? "Đi tới marketplace" : undefined}
                    onAction={!searchQuery ? () => navigate("/marketplace") : undefined}
                  />
                )}
              </div>
            </SectionPanel>
          </DashboardShell>
        </div>
      </div>
      <Footer />
    </>
  );
}
