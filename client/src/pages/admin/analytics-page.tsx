import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest } from "@/lib/queryClient";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionPanel } from "@/components/design-system/section-panel";
import { formatVnd } from "@/components/dashboard/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  UserPlus,
  BookOpen,
  Newspaper,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalSoftware: number;
  totalOrders: number;
  totalRevenue: number;
}

const chartConfig = {
  count: { label: "Số lượng", color: "#004080" },
  revenue: { label: "Doanh thu", color: "#0066cc" },
  leads: { label: "Leads", color: "#059669" },
};

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading: statsLoading, refetch } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/stats");
      return res.json();
    },
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery<{ leads: unknown[]; total: number }>({
    queryKey: ["/api/leads", "analytics"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leads");
      return res.json();
    },
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{ courses: unknown[]; total: number }>({
    queryKey: ["/api/courses", "analytics"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/courses?limit=1");
      return res.json();
    },
  });

  const { data: blogData, isLoading: blogLoading } = useQuery<{ posts: unknown[]; total: number }>({
    queryKey: ["/api/blog", "analytics"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/blog/admin/all?limit=1");
        return res.json();
      } catch {
        const res = await apiRequest("GET", "/api/blog?limit=1");
        return res.json();
      }
    },
  });

  const { data: ordersTimelineData, isLoading: ordersTimelineLoading } = useQuery<{
    timeline: { month: string; count: number; revenue: number }[];
  }>({
    queryKey: ["/api/admin/analytics/orders-timeline"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/analytics/orders-timeline");
      return res.json();
    },
  });

  const { data: leadsTimelineData, isLoading: leadsTimelineLoading } = useQuery<{
    timeline: { month: string; count: number }[];
  }>({
    queryKey: ["/api/admin/analytics/leads-timeline"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/analytics/leads-timeline");
      return res.json();
    },
  });

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery<{ tickets: unknown[] }>({
    queryKey: ["/api/support/tickets", "analytics"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/support/tickets");
      return res.json();
    },
  });

  const isLoading = statsLoading || leadsLoading || coursesLoading || blogLoading || ticketsLoading;

  const gtmMetrics = useMemo(
    () => [
      { label: "Leads", value: leadsData?.total ?? leadsData?.leads?.length ?? 0 },
      { label: "Khóa học", value: coursesData?.total ?? coursesData?.courses?.length ?? 0 },
      { label: "Blog", value: blogData?.total ?? blogData?.posts?.length ?? 0 },
      { label: "Support", value: ticketsData?.tickets?.length ?? 0 },
    ],
    [leadsData, coursesData, blogData, ticketsData],
  );

  const platformChart = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Users", count: stats.totalUsers },
      { name: "Software", count: stats.totalSoftware },
      { name: "Orders", count: stats.totalOrders },
    ];
  }, [stats]);

  const ordersTimelineChart = useMemo(() => {
    return (ordersTimelineData?.timeline ?? []).map((row) => ({
      month: row.month,
      count: row.count,
      revenue: row.revenue,
    }));
  }, [ordersTimelineData]);

  const leadsTimelineChart = useMemo(() => {
    return leadsTimelineData?.timeline ?? [];
  }, [leadsTimelineData]);

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <DashboardShell
          title="Analytics"
          subtitle="Tổng quan nền tảng, GTM funnel và hiệu suất marketplace"
          icon={BarChart3}
          onRefresh={() => refetch()}
        >
          {/* Core platform metrics */}
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
                  hint="Tài khoản đã đăng ký"
                />
                <MetricCard
                  label="Phần mềm"
                  value={stats?.totalSoftware ?? 0}
                  icon={Package}
                  hint="Catalog phần mềm"
                />
                <MetricCard
                  label="Đơn hàng"
                  value={stats?.totalOrders ?? 0}
                  icon={ShoppingCart}
                  hint="Marketplace orders"
                />
                <MetricCard
                  label="Doanh thu"
                  value={formatVnd(stats?.totalRevenue ?? 0)}
                  icon={DollarSign}
                  hint="Tổng GMV đơn hàng"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <SectionPanel
              title="Đơn hàng theo tháng"
              subtitle="6 tháng — marketplace orders (nội bộ)"
            >
              {ordersTimelineLoading ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : ordersTimelineChart.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <BarChart data={ordersTimelineChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">Chưa có đơn hàng</p>
              )}
            </SectionPanel>

            <SectionPanel
              title="Leads theo tháng"
              subtitle="6 tháng — GTM lead capture (nội bộ)"
            >
              {leadsTimelineLoading ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : leadsTimelineChart.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <BarChart data={leadsTimelineChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-leads)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">Chưa có leads</p>
              )}
            </SectionPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Platform chart */}
            <SectionPanel title="Phân bổ nền tảng" subtitle="Users · Software · Orders">
              {statsLoading ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : platformChart.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <BarChart data={platformChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">Chưa có dữ liệu</p>
              )}
            </SectionPanel>

            {/* GTM funnel */}
            <SectionPanel title="GTM & Hỗ trợ" subtitle="Lead capture, nội dung, support">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-4 bg-emerald-50/50 border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-800 mb-1">
                      <UserPlus className="h-4 w-4" />
                      <span className="text-sm font-medium">Leads</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{gtmMetrics[0].value}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-blue-50/50 border-blue-100">
                    <div className="flex items-center gap-2 text-[#004080] mb-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm font-medium">Khóa học</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{gtmMetrics[1].value}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-amber-50/50 border-amber-100">
                    <div className="flex items-center gap-2 text-amber-800 mb-1">
                      <Newspaper className="h-4 w-4" />
                      <span className="text-sm font-medium">Blog posts</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{gtmMetrics[2].value}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-slate-50 border-slate-200">
                    <div className="flex items-center gap-2 text-slate-700 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm font-medium">Tickets</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{gtmMetrics[3].value}</p>
                  </div>
                </div>
              )}
            </SectionPanel>
          </div>

          {/* GA4 note */}
          <SectionPanel
            title="Google Analytics 4"
            subtitle="Traffic và hành vi người dùng trên production"
            className="mt-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {gaId ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {gaId}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Tracking đang bật qua gtag trên SPA
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa cấu hình <code className="text-xs">VITE_GA_MEASUREMENT_ID</code> — thêm vào env để bật GA4.
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Báo cáo chi tiết (sessions, bounce rate, top pages) xem trên Google Analytics dashboard.
                </p>
              </div>
              {gaId && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://analytics.google.com/analytics/web/#/p${gaId.replace("G-", "")}/reports/intelligenthome`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Mở GA4
                  </a>
                </Button>
              )}
            </div>
          </SectionPanel>
        </DashboardShell>
      </div>
    </AdminLayout>
  );
}
