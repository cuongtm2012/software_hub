import { useLocation } from "wouter";
import { Plus, Package, CheckCircle2, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProductRow } from "@/components/dashboard/product-row";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { ListSkeleton } from "@/components/dashboard/list-skeleton";
import { SectionPanel } from "@/components/design-system/section-panel";
import { DashboardProduct } from "@/components/dashboard/types";

interface ProductsTabProps {
  products: DashboardProduct[];
  productStats: {
    total: number;
    active: number;
    avgRating: number;
    totalSales: number;
  };
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  deletingId?: number;
}

export function ProductsTab({
  products,
  productStats,
  isLoading,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onDelete,
  isDeleting,
  deletingId,
}: ProductsTabProps) {
  const [, navigate] = useLocation();

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Tổng sản phẩm" value={productStats.total} icon={Package} />
        <MetricCard label="Đang bán" value={productStats.active} icon={CheckCircle2} />
        <MetricCard label="Đánh giá TB" value={productStats.avgRating.toFixed(1)} icon={Star} />
        <MetricCard label="Đã bán" value={productStats.totalSales} icon={TrendingUp} />
      </div>

      <SectionPanel
        title="Sản phẩm của bạn"
        subtitle={
          isLoading
            ? "Đang tải…"
            : `${totalItems} sản phẩm trên marketplace`
        }
        action={
          <Button
            size="sm"
            onClick={() => navigate("/seller/products/new")}
            className="bg-[#004080] hover:bg-[#003366] w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm sản phẩm
          </Button>
        }
        headerClassName="!p-4 sm:!px-5"
        className="!shadow-none border-0 rounded-none"
      >
        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Chưa có sản phẩm"
            description="Thêm sản phẩm đầu tiên để bắt đầu bán trên marketplace"
            actionLabel="Thêm sản phẩm"
            onAction={() => navigate("/seller/products/new")}
          />
        ) : (
          <div className="space-y-2.5">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onDelete={onDelete}
                isDeleting={isDeleting && deletingId === product.id}
              />
            ))}
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemLabel="sản phẩm"
              isLoading={isLoading}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
