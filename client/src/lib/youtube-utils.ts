/**
 * Extract YouTube video ID or playlist ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
    if (!url) {
        console.log('[YouTube] Empty URL provided');
        return null;
    }

    console.log('[YouTube] Extracting ID from:', url);

    // Check if it's a playlist URL
    const playlistMatch = url.match(/[?&]list=([^&]+)/);
    if (playlistMatch && playlistMatch[1]) {
        console.log('[YouTube] ⚠️ Playlist URL detected, playlist ID:', playlistMatch[1]);
        // For playlists, we can't get a direct thumbnail without API
        // Return null to show placeholder, or we could try to extract first video if available
        const videoInPlaylist = url.match(/[?&]v=([^&]{11})/);
        if (videoInPlaylist && videoInPlaylist[1]) {
            console.log('[YouTube] ✅ Found video in playlist:', videoInPlaylist[1]);
            return videoInPlaylist[1];
        }
        console.warn('[YouTube] ❌ Playlist URL without video ID - cannot generate thumbnail');
        return null;
    }

    // Comprehensive regex covering all YouTube video formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

    const match = url.match(youtubeRegex);

    if (match && match[1]) {
        console.log('[YouTube] ✅ Extracted video ID:', match[1]);
        return match[1];
    }

    console.warn('[YouTube] ❌ Failed to extract video ID from URL:', url);
    return null;
}

/**
 * Get YouTube thumbnail URL with quality fallback
 * @param videoUrl - YouTube video or playlist URL
 * @param quality - 'maxres' | 'hq' | 'mq' | 'sd'
 */
export function getYouTubeThumbnail(videoUrl: string, quality: 'maxres' | 'hq' | 'mq' | 'sd' = 'maxres'): string | null {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) return null;

    const qualityMap = {
        maxres: 'maxresdefault',
        hq: 'hqdefault',
        mq: 'mqdefault',
        sd: 'sddefault',
    };

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
    console.log('[YouTube] Generated thumbnail URL:', thumbnailUrl);
    return thumbnailUrl;
}

/**
 * Get fallback thumbnail URLs in order of quality
 */
export function getYouTubeThumbnailFallbacks(videoUrl: string): string[] {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
        console.warn('[YouTube] Cannot generate fallbacks - no video ID');
        return [];
    }

    const fallbacks = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    ];

    console.log('[YouTube] Generated fallback URLs:', fallbacks);
    return fallbacks;
}
