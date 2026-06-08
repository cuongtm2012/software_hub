import { useLocation } from "wouter";
import { Edit, Star, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DashboardProduct } from "@/components/dashboard/types";
import { formatVnd, getProductTitle } from "@/components/dashboard/format";

interface ProductRowProps {
  product: DashboardProduct;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function ProductRow({ product, onDelete, isDeleting }: ProductRowProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-foreground">{getProductTitle(product)}</h4>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {product.description?.substring(0, 100)}
          {(product.description?.length ?? 0) > 100 ? "…" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
          <span className="font-medium text-emerald-700">{formatVnd(parseFloat(product.price))}</span>
          <StatusBadge status={product.status} />
          <span className="text-muted-foreground">Kho: {product.stock_quantity}</span>
          {product.avg_rating != null && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              {product.avg_rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/seller/products/${product.id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Sửa
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={isDeleting}
          onClick={() => {
            if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
              onDelete(product.id);
            }
          }}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
