import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, ArrowLeft, Loader2, DollarSign, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface SalesAnalyticsRow {
  id: number;
  seller_id: number;
  product_id: number | null;
  date: string;
  revenue: string;
  units_sold: number;
  commission_paid: string;
  created_at: string;
}

export default function SellerAnalyticsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<{ analytics: SalesAnalyticsRow[] }>({
    queryKey: ["/api/seller/analytics"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/seller/analytics");
      return res.json();
    },
    enabled: !!user && user.role === "seller",
  });

  const analytics = data?.analytics ?? [];
  const totalRevenue = analytics.reduce((sum, row) => sum + Number(row.revenue), 0);
  const totalUnits = analytics.reduce((sum, row) => sum + row.units_sold, 0);
  const totalCommission = analytics.reduce((sum, row) => sum + Number(row.commission_paid), 0);

  if (!user) {
    return (
      <Layout>
        <div className="w-full min-w-0 max-w-full px-[4%] py-8 text-center">
          <p className="text-muted-foreground mb-4">Vui lòng đăng nhập để xem analytics.</p>
          <Button onClick={() => navigate("/auth")}>Đăng nhập</Button>
        </div>
      </Layout>
    );
  }

  if (user.role !== "seller" && user.role !== "admin") {
    return (
      <Layout>
        <div className="w-full min-w-0 max-w-full px-[4%] py-8 text-center">
          <p className="text-muted-foreground">Chỉ seller mới có thể truy cập trang này.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/seller")}>
            Về Seller Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full min-w-0 max-w-full px-[4%] py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate("/seller")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Seller Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#004080]" />
              Sales Analytics
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Doanh thu và đơn hàng theo sản phẩm
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Tổng doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {totalRevenue.toLocaleString("vi-VN")} ₫
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Đã bán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalUnits}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoa hồng đã trả
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {totalCommission.toLocaleString("vi-VN")} ₫
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử bán hàng</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
              </div>
            ) : analytics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>Chưa có dữ liệu analytics. Dữ liệu sẽ xuất hiện sau khi có đơn hàng.</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Doanh thu</TableHead>
                      <TableHead>Hoa hồng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {format(new Date(row.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {row.product_id ? (
                            <Badge variant="outline">#{row.product_id}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{row.units_sold}</TableCell>
                        <TableCell>
                          {Number(row.revenue).toLocaleString("vi-VN")} ₫
                        </TableCell>
                        <TableCell>
                          {Number(row.commission_paid).toLocaleString("vi-VN")} ₫
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
