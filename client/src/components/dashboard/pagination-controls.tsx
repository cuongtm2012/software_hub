import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemLabel: string;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  itemLabel,
  isLoading,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, i) => i + 1,
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
      <p className="text-sm text-muted-foreground">
        Trang {page}/{totalPages} · {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>
        {visiblePages.map((pageNum) => (
          <Button
            key={pageNum}
            variant={page === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            disabled={isLoading}
          >
            {pageNum}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || isLoading}
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </Button>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}
