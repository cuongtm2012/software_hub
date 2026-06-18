import type { BlogCrawlerSource } from "./types";

export const BLOG_CRAWLER_CONFIG: {
  maxPostsPerSource: number;
  sources: Record<BlogCrawlerSource, { enabled: boolean }>;
  devto: { tags: string[] };
  rss: { freecodecampUrl: string; hashnodeUrl: string };
} = {
  maxPostsPerSource: 15,
  sources: {
    devto: { enabled: true },
    freecodecamp: { enabled: true },
    hashnode: { enabled: true },
    juejin: { enabled: false },
    segmentfault: { enabled: false },
  },
  devto: {
    tags: ["webdev", "javascript", "react", "devops", "programming"],
  },
  rss: {
    freecodecampUrl: "https://www.freecodecamp.org/news/rss/",
    hashnodeUrl: "https://townhall.hashnode.com/rss",
  },
};

