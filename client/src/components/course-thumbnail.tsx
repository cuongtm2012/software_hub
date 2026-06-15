import { useState, useEffect } from "react";
import { extractYouTubeVideoId } from "@/lib/youtube-utils";
import { cn } from "@/lib/utils";

interface CourseThumbnailProps {
  videoUrl: string;
  title: string;
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
 * YouTube thumbnail with fallback chain. Must sit inside a sized parent
 * (e.g. `relative aspect-video` or `relative pt-[56%]`).
 */
export function CourseThumbnail({
  videoUrl,
  title,
  fallbackGradient = "from-[#004080] to-[#003366]",
  className,
}: CourseThumbnailProps) {
  const [currentSrc, setCurrentSrc] = useState("");
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const videoId = extractYouTubeVideoId(videoUrl);

  const thumbnailUrls = videoId
    ? [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      ]
    : [];

  useEffect(() => {
    if (thumbnailUrls.length > 0) {
      setCurrentSrc(thumbnailUrls[0]);
      setFallbackIndex(0);
      setShowPlaceholder(false);
      setIsLoading(true);
    } else {
      setShowPlaceholder(true);
      setIsLoading(false);
    }
  }, [videoUrl, title]);

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < thumbnailUrls.length) {
      setCurrentSrc(thumbnailUrls[nextIndex]);
      setFallbackIndex(nextIndex);
    } else {
      setShowPlaceholder(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
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
            onLoad={handleLoad}
          />
          {isLoading && <Placeholder title={title} fallbackGradient={fallbackGradient} />}
        </>
      )}
    </div>
  );
}
