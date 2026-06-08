import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DashboardOrder,
  DashboardProduct,
  DashboardProject,
  DashboardQuote,
  ProjectStatusFilter,
} from "@/components/dashboard/types";

type AuthUser = Omit<User, "password">;

const PRODUCTS_PER_PAGE = 10;
const PROJECTS_PER_PAGE = 10;

export function useDashboardData(user: AuthUser | null | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isSeller = user?.role === "seller";
  const isBuyer = user?.role === "buyer" || user?.role === "user";

  const [productPage, setProductPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [projectStatus, setProjectStatus] = useState<ProjectStatusFilter>("all");

  const productsQuery = useQuery<{ products: DashboardProduct[]; total: number }>({
    queryKey: ["/api/seller/products", { page: productPage, limit: PRODUCTS_PER_PAGE }],
    enabled: isSeller,
    staleTime: 30_000,
  });

  const ordersQuery = useQuery<{ orders: DashboardOrder[] }>({
    queryKey: ["/api/seller/orders"],
    enabled: isSeller,
    staleTime: 3 * 60 * 1000,
  });

  const projectsQuery = useQuery<{ projects: DashboardProject[]; total: number }>({
    queryKey: [
      "/api/my-projects",
      {
        page: projectPage,
        limit: PROJECTS_PER_PAGE,
        status: projectStatus === "all" ? undefined : projectStatus,
      },
    ],
    enabled: !!user,
    staleTime: 60_000,
  });

  const projectsStatsQuery = useQuery<{ projects: DashboardProject[]; total: number }>({
    queryKey: ["/api/my-projects", { limit: 200 }],
    enabled: !!user,
    staleTime: 60_000,
  });

  const quotesQuery = useQuery<DashboardQuote[]>({
    queryKey: ["/api/quotes"],
    enabled: !!user && !isSeller,
    staleTime: 5 * 60 * 1000,
  });

  const products = productsQuery.data?.products ?? [];
  const orders = ordersQuery.data?.orders ?? [];
  const projects = projectsQuery.data?.projects ?? [];
  const allProjectsForStats = projectsStatsQuery.data?.projects ?? [];
  const quotes = quotesQuery.data ?? [];

  const productStats = {
    total: productsQuery.data?.total ?? products.length,
    active: products.filter((p) => p.status === "approved").length,
    pending: products.filter((p) => p.status === "pending").length,
    totalSales: products.reduce((sum, p) => sum + (p.total_sales ?? 0), 0),
    avgRating:
      products.length > 0
        ? products.reduce((sum, p) => sum + (p.avg_rating ?? 0), 0) / products.length
        : 0,
    totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || "0"), 0),
  };

  const projectStats = {
    total: projectsStatsQuery.data?.total ?? allProjectsForStats.length,
    active: allProjectsForStats.filter(
      (p) => p.status === "in_progress" || p.status === "in-progress",
    ).length,
    completed: allProjectsForStats.filter((p) => p.status === "completed").length,
    pending: allProjectsForStats.filter((p) => p.status === "pending").length,
    cancelled: allProjectsForStats.filter((p) => p.status === "cancelled").length,
    quotes: quotes.length,
  };

  const projectCounts: Record<ProjectStatusFilter, number> = {
    all: projectStats.total,
    pending: projectStats.pending,
    in_progress: projectStats.active,
    completed: projectStats.completed,
    cancelled: projectStats.cancelled,
  };

  const productTotalPages = Math.max(
    1,
    Math.ceil((productsQuery.data?.total ?? 0) / PRODUCTS_PER_PAGE),
  );
  const projectTotalPages = Math.max(
    1,
    Math.ceil((projectsQuery.data?.total ?? 0) / PROJECTS_PER_PAGE),
  );

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/seller/products/${productId}`);
    },
    onSuccess: () => {
      toast({ title: "Đã xóa", description: "Sản phẩm đã được xóa thành công" });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa sản phẩm",
        variant: "destructive",
      });
    },
  });

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
    queryClient.invalidateQueries({ queryKey: ["/api/seller/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/my-projects"] });
    queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
  };

  const handleProjectStatusChange = (status: ProjectStatusFilter) => {
    setProjectStatus(status);
    setProjectPage(1);
  };

  return {
    isSeller,
    isBuyer,
    productPage,
    setProductPage,
    productTotalPages,
    productsPerPage: PRODUCTS_PER_PAGE,
    products,
    productStats,
    productsLoading: productsQuery.isLoading,
    ordersLoading: ordersQuery.isLoading,

    projectPage,
    setProjectPage,
    projectStatus,
    setProjectStatus: handleProjectStatusChange,
    projectTotalPages,
    projectsPerPage: PROJECTS_PER_PAGE,
    projects,
    projectStats,
    projectCounts,
    projectsLoading: projectsQuery.isLoading,
    projectsTotal: projectsQuery.data?.total ?? 0,

    deleteProduct: deleteProductMutation.mutate,
    isDeletingProduct: deleteProductMutation.isPending,
    deletingProductId: deleteProductMutation.variables,

    refetchAll,
  };
}
