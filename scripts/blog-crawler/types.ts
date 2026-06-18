export type BlogCrawlerSource =
  | "devto"
  | "freecodecamp"
  | "hashnode"
  | "juejin"
  | "segmentfault";

export type CrawledPost = {
  source: BlogCrawlerSource;
  sourceUrl: string;
  title: string;
  excerpt?: string;
  /** Markdown-ish content. Should include attribution and original link. */
  content: string;
  coverImage?: string;
  tags: string[];
  publishedAt?: string; // ISO string
};

export type BlogPostInsert = {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  seo_description?: string;
  cover_image?: string;
  author_name?: string;
  tags?: string[];
  status: "draft" | "published" | "archived";
  published_at?: Date | null;
};

