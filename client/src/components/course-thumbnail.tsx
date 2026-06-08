import { useState, useEffect } from 'react';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';

interface CourseThumbnailProps {
    videoUrl: string;
    title: string;
    fallbackGradient?: string;
}

/**
 * Smart YouTube thumbnail component with multi-level fallback and lazy loading
 */
export function CourseThumbnail({ videoUrl, title, fallbackGradient = 'from-[#004080] to-[#003366]' }: CourseThumbnailProps) {
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const [fallbackIndex, setFallbackIndex] = useState(0);
    const [showPlaceholder, setShowPlaceholder] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Use centralized video ID extraction
    const videoId = extractYouTubeVideoId(videoUrl);

    // Fallback URLs in order of quality
    const thumbnailUrls = videoId ? [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    ] : [];

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

    if (showPlaceholder || !currentSrc) {
        return (
            <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="text-6xl font-bold text-white mb-2 opacity-90">
                        {title.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <img
                src={currentSrc}
                alt={title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={handleError}
                onLoad={handleLoad}
            />
            {isLoading && (
                <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}>
                    <div className="text-center">
                        <div className="text-6xl font-bold text-white mb-2 opacity-90">
                            {title.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
