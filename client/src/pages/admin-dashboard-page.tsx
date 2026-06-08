import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { QuickLinkCard } from "@/components/dashboard/quick-link-card";
import { SectionPanel } from "@/components/design-system/section-panel";
import { formatVnd } from "@/components/dashboard/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Bell,
  Briefcase,
  LayoutDashboard,
  RefreshCw,
  FileText,
  UserCheck,
  Mail,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalSoftware: number;
  totalOrders: number;
  totalRevenue: number;
  usersTrend?: { value: number; isPositive: boolean };
  softwareTrend?: { value: number; isPositive: boolean };
  ordersTrend?: { value: number; isPositive: boolean };
  revenueTrend?: { value: number; isPositive: boolean };
}

type QueueName = "email:verification" | "email:password-reset" | "push:notification" | string;

interface QueueCounters {
  pending: number;
  failed: number;
  delayed: number;
}

interface QueueStatsResponse {
  queues: QueueName[];
  stats: Record<string, QueueCounters>;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === "admin",
    initialData: {
      totalUsers: 0,
      totalSoftware: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },
  });

  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = useQuery<QueueStatsResponse>({
    queryKey: ["/api/admin/queue/stats"],
    enabled: user?.role === "admin",
    refetchInterval: user?.role === "admin" ? 10000 : false,
  });

  const retryFailedMutation = useMutation({
    mutationFn: async ({ queueName, limit }: { queueName: string; limit?: number }) => {
      const response = await apiRequest("POST", `/api/admin/queue/${encodeURIComponent(queueName)}/retry-failed`, {
        limit: limit ?? 50,
      });
      return response.json();
    },
    onSuccess: (data: { message?: string }) => {
      toast({
        title: "Đã thử lại",
        description: data?.message || "Các job lỗi đã được đưa vào hàng đợi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/queue/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Thử lại thất bại",
        description: error?.message || "Không thể thử lại job lỗi",
        variant: "destructive",
      });
    },
  });

  const clearFailedMutation = useMutation({
    mutationFn: async (queueName: string) => {
      const response = await apiRequest("DELETE", `/api/admin/queue/${encodeURIComponent(queueName)}/failed`);
      return response.json();
    },
    onSuccess: (data: { message?: string }) => {
      toast({
        title: "Đã xóa job lỗi",
        description: data?.message || "Đã xóa các job thất bại",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/queue/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Xóa thất bại",
        description: error?.message || "Không thể xóa job lỗi",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refetchStats();
    refetchQueue();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <DashboardShell
          title="Bảng điều khiển Admin"
          subtitle="Tổng quan hệ thống — người dùng, phần mềm, đơn hàng và hàng đợi"
          icon={LayoutDashboard}
          onRefresh={handleRefresh}
        >
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))
            ) : (
              <>
                <MetricCard
                  label="Người dùng"
                  value={stats?.totalUsers ?? 0}
                  icon={Users}
                  trend={stats?.usersTrend}
                  hint="Tài khoản đã đăng ký"
                />
                <MetricCard
                  label="Phần mềm"
                  value={stats?.totalSoftware ?? 0}
                  icon={Package}
                  trend={stats?.softwareTrend}
                  hint="Sản phẩm trên marketplace"
                />
                <MetricCard
                  label="Đơn hàng"
                  value={stats?.totalOrders ?? 0}
                  icon={ShoppingCart}
                  trend={stats?.ordersTrend}
                  hint="Đơn hoàn tất"
                />
                <MetricCard
                  label="Doanh thu"
                  value={formatVnd(stats?.totalRevenue ?? 0)}
                  icon={DollarSign}
                  trend={stats?.revenueTrend}
                  hint="Tổng tích lũy"
                />
              </>
            )}
          </div>

          <SectionPanel title="Thao tác nhanh" subtitle="Truy cập nhanh các khu vực quản trị">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <QuickLinkCard
                href="/admin/users"
                title="Quản lý người dùng"
                description="Xem, chỉnh sửa vai trò và trạng thái"
                icon={Users}
                accent="blue"
              />
              <QuickLinkCard
                href="/admin/leads"
                title="Leads GTM"
                description="Khách hàng tiềm năng từ landing & ebook"
                icon={Mail}
                accent="green"
              />
              <QuickLinkCard
                href="/admin/software"
                title="Phần mềm"
                description="Duyệt và quản lý danh sách sản phẩm"
                icon={Package}
                accent="green"
              />
              <QuickLinkCard
                href="/admin/projects"
                title="Dự án"
                description="Theo dõi dự án khách hàng"
                icon={Briefcase}
                accent="orange"
              />
              <QuickLinkCard
                href="/admin/blog"
                title="Blog & SEO"
                description="Bài viết và nội dung marketing"
                icon={FileText}
                accent="slate"
              />
              <QuickLinkCard
                href="/admin/seller-approvals"
                title="Duyệt seller"
                description="Xác minh tài khoản người bán"
                icon={UserCheck}
                accent="blue"
              />
              <QuickLinkCard
                href="/admin/push-notifications"
                title="Thông báo đẩy"
                description="Gửi push tới người dùng"
                icon={Bell}
                accent="slate"
              />
              <QuickLinkCard
                href="/admin/queues"
                title="Hàng đợi"
                description="Retry và xóa job thất bại"
                icon={RefreshCw}
                accent="slate"
              />
            </div>
          </SectionPanel>

          <SectionPanel
            title="Hàng đợi xử lý"
            subtitle="Email xác thực, reset mật khẩu, push notification"
            action={
              <Button variant="outline" size="sm" onClick={() => refetchQueue()}>
                Làm mới
              </Button>
            }
          >
              {queueLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : (queueData?.queues?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Chưa có processor. Khởi động server để khởi tạo hàng đợi.
                </p>
              ) : (
                <div className="space-y-2">
                  {(queueData?.queues || []).map((queueName) => {
                    const q = queueData?.stats?.[queueName] || { pending: 0, failed: 0, delayed: 0 };
                    const hasIssue = q.failed > 0;
                    return (
                      <div
                        key={queueName}
                        className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
                          hasIssue ? "border-red-200 bg-red-50/50" : ""
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <p className="font-medium text-sm truncate">{queueName}</p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <Badge variant="secondary">Chờ: {q.pending}</Badge>
                            <Badge variant="outline">Trễ: {q.delayed}</Badge>
                            <Badge variant={q.failed > 0 ? "destructive" : "secondary"}>
                              Lỗi: {q.failed}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={q.failed === 0 || retryFailedMutation.isPending}
                            onClick={() => retryFailedMutation.mutate({ queueName })}
                          >
                            Thử lại
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={q.failed === 0 || clearFailedMutation.isPending}
                            onClick={() => clearFailedMutation.mutate(queueName)}
                          >
                            Xóa lỗi
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </SectionPanel>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Cập nhật lúc {new Date().toLocaleTimeString("vi-VN")}
          </p>
        </DashboardShell>
      </div>
    </AdminLayout>
  );
}
