/** Shared YouTube URL helpers (client + server scripts). */

export function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[?&]list=([^&]+)/);
  return match?.[1] ?? null;
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const videoInPlaylist = url.match(/[?&]v=([^&]{11})/);
  if (videoInPlaylist?.[1]) return videoInPlaylist[1];

  const youtubeRegex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = url.match(youtubeRegex);
  return match?.[1] ?? null;
}

export function getVideoThumbnailUrls(videoId: string): string[] {
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  ];
}

export function resolveCourseThumbnailUrls(
  videoUrl: string,
  options?: { playlistId?: string | null; thumbnailUrl?: string | null },
): string[] {
  const urls: string[] = [];
  if (options?.thumbnailUrl?.startsWith("http")) {
    urls.push(options.thumbnailUrl);
  }

  const videoId = extractYouTubeVideoId(videoUrl);
  if (videoId) {
    urls.push(...getVideoThumbnailUrls(videoId));
  }

  return [...new Set(urls)];
}

export function isPlaylistUrl(url: string, playlistId?: string | null): boolean {
  return Boolean(playlistId || extractPlaylistId(url));
}

export async function fetchYouTubeOEmbed(
  url: string,
): Promise<{ ok: boolean; thumbnailUrl?: string; title?: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { thumbnail_url?: string; title?: string };
    return { ok: true, thumbnailUrl: data.thumbnail_url, title: data.title };
  } catch {
    return { ok: false };
  }
}
