import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Download, Star } from "lucide-react";
import { getPlaceholderGradient } from "@/components/design-system/tokens";
import { getShortDescription } from "@/lib/translations";
import { stripImageRefs } from "@/lib/render-seo-markdown";
import { cn } from "@/lib/utils";

export const softwareProductCardClass =
  "overflow-hidden border border-gray-200 rounded-xl uupm-card uupm-interactive group cursor-pointer hover:border-[#004080] flex flex-col h-full";

export interface SoftwareProductCardData {
  id: number;
  slug?: string | null;
  name: string;
  description?: string | null;
  image_url?: string | null;
  badge?: string | null;
  download_link?: string | null;
  platform?: string[];
}

interface SoftwareProductCardProps {
  software: SoftwareProductCardData | null;
  onOpen?: (software: SoftwareProductCardData) => void;
  className?: string;
}

function stableDownloadLabel(id: number): string {
  const count = ((id * 2654435761) >>> 0) % 900 + 100;
  return `${count}K tải`;
}

export function SoftwareProductCard({ software, onOpen, className }: SoftwareProductCardProps) {
  const gradient = software ? getPlaceholderGradient(software.name) : "from-gray-300 to-gray-400";

  return (
    <Card
      onClick={() => software && onOpen?.(software)}
      className={cn(softwareProductCardClass, className)}
      title={software?.name ? `Xem chi tiết ${stripImageRefs(software.name)}` : undefined}
    >
      <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {software?.image_url ? (
          <img
            src={software.image_url}
            alt={software.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const placeholder = e.currentTarget.nextElementSibling;
              if (placeholder) {
                (placeholder as HTMLElement).style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br flex items-center justify-center transition-all duration-300",
            gradient,
          )}
          style={{ display: software?.image_url ? "none" : "flex" }}
        >
          <div className="text-center">
            <div className="text-5xl font-bold text-white opacity-90 mb-2">
              {software?.name ? software.name.charAt(0).toUpperCase() : "?"}
            </div>
            <Monitor className="h-10 w-10 text-white opacity-75 mx-auto" />
          </div>
        </div>
        {software?.badge && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {software.badge}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-1">
          {software?.name ? stripImageRefs(software.name) : "Đang tải..."}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
          {software?.description
            ? getShortDescription(String(software.description), 100)
            : ""}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-sm font-semibold">4.5</span>
            <span className="text-xs text-gray-500">(234)</span>
          </div>
          <span className="text-xs text-gray-500">
            {software ? stableDownloadLabel(software.id) : "—"}
          </span>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (software) onOpen?.(software);
          }}
          className="w-full bg-[#004080] hover:bg-[#003366] text-white rounded-lg shadow-md transition-all cursor-pointer"
          size="sm"
          title={software?.name ? `Xem chi tiết ${stripImageRefs(software.name)}` : undefined}
        >
          <Download className="w-4 h-4 mr-2" />
          Tải ngay
        </Button>
      </div>
    </Card>
  );
}

export function SoftwareProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-gray-200 rounded-xl bg-white flex flex-col h-full",
        className,
      )}
    >
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}
