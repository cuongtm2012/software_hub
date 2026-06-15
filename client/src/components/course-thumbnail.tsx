import { useState, useEffect, useMemo } from "react";
import { resolveCourseThumbnailUrls } from "@/lib/youtube-utils";
import { cn } from "@/lib/utils";

interface CourseThumbnailProps {
  videoUrl: string;
  title: string;
  playlistId?: string | null;
  thumbnailUrl?: string | null;
  fallbackGradient?: string;
  className?: string;
}

function Placeholder({
  title,
  fallbackGradient,
}: {
  title: string;
  fallbackGradient: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-br flex items-center justify-center",
        fallbackGradient,
      )}
    >
      <span className="text-xl font-bold text-white/90 select-none">
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

/**
 * YouTube thumbnail with fallback chain. Parent must be `relative` with defined size.
 */
export function CourseThumbnail({
  videoUrl,
  title,
  playlistId,
  thumbnailUrl,
  fallbackGradient = "from-[#004080] to-[#003366]",
  className,
}: CourseThumbnailProps) {
  const candidates = useMemo(
    () => resolveCourseThumbnailUrls(videoUrl, { playlistId, thumbnailUrl }),
    [videoUrl, playlistId, thumbnailUrl],
  );

  const [srcIndex, setSrcIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(candidates.length === 0);
  const [isLoading, setIsLoading] = useState(candidates.length > 0);

  useEffect(() => {
    setSrcIndex(0);
    setShowPlaceholder(candidates.length === 0);
    setIsLoading(candidates.length > 0);
  }, [videoUrl, playlistId, thumbnailUrl, candidates.length]);

  const currentSrc = candidates[srcIndex];

  const handleError = () => {
    const next = srcIndex + 1;
    if (next < candidates.length) {
      setSrcIndex(next);
    } else {
      setShowPlaceholder(true);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {showPlaceholder || !currentSrc ? (
        <Placeholder title={title} fallbackGradient={fallbackGradient} />
      ) : (
        <>
          <img
            src={currentSrc}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleError}
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && <Placeholder title={title} fallbackGradient={fallbackGradient} />}
        </>
      )}
    </div>
  );
}
