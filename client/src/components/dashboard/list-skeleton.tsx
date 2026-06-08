import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Đang tải">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex justify-between gap-3">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
