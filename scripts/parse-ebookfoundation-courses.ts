/**
 * Parse EbookFoundation Vietnamese courses HTML → scripts/data/ebookfoundation-courses.json
 * Run: npm run parse:ebookfoundation
 */
import {
  type CourseEntry,
  type CourseTopicBundle,
  extractPlaylistId,
  inferLevel,
  playlistThumbnail,
  writeJson,
} from "./lib/data-expansion.js";

const SOURCE_URL =
  "https://ebookfoundation.github.io/free-programming-books/courses/free-courses-vi.html";

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parseHtml(html: string): CourseTopicBundle[] {
  const topics: CourseTopicBundle[] = [];
  const section = html.match(/<section>([\s\S]*?)<\/section>/i)?.[1] ?? html;
  const blocks = section.split(/<h3[^>]*id="([^"]+)"[^>]*>([^<]*)<\/h3>/gi);

  for (let i = 1; i < blocks.length; i += 3) {
    const topic = decodeHtml(blocks[i + 1] || blocks[i]).replace(/\s+/g, " ").trim();
    const body = blocks[i + 2] ?? "";
    if (!topic) continue;

    const courses: CourseEntry[] = [];
    const itemRegex =
      /<li>\s*<a href="(https?:\/\/[^"]+)">([^<]*)<\/a>(?:\s*-\s*([^<]*))?/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(body))) {
      const youtubeUrl = match[1].trim();
      if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) continue;

      const title = decodeHtml(match[2]);
      const instructor = decodeHtml(match[3] || "");
      const playlistId = extractPlaylistId(youtubeUrl);

      courses.push({
        title,
        instructor: instructor || "Unknown",
        youtubeUrl,
        playlistId,
        thumbnailUrl: playlistThumbnail(playlistId),
        level: inferLevel(title),
      });
    }

    if (courses.length > 0) {
      topics.push({ topic, source: "ebookfoundation", courses });
    }
  }

  return topics;
}

async function main() {
  console.log("Fetching EbookFoundation Vietnamese courses...");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const topics = parseHtml(await res.text());
  const total = topics.reduce((n, t) => n + t.courses.length, 0);
  console.log(`Parsed ${topics.length} topics, ${total} courses`);
  writeJson("ebookfoundation-courses.json", topics);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
