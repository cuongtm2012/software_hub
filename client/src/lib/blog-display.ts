const SOURCE_LABELS: Record<string, string> = {
  devto: "DEV Community",
  freecodecamp: "freeCodeCamp",
  hashnode: "Hashnode",
  rss: "RSS",
};

export function getDisplayTags(tags: string[] | null | undefined): string[] {
  if (!tags?.length) return [];
  return tags.filter((tag) => !tag.startsWith("source:") && !tag.startsWith("lang:"));
}

export function getSourceLabel(tags: string[] | null | undefined): string | null {
  const sourceTag = tags?.find((tag) => tag.startsWith("source:"));
  if (!sourceTag) return null;
  const key = sourceTag.replace("source:", "").trim();
  return SOURCE_LABELS[key] ?? key;
}

export function estimateReadingTimeMinutes(content: string): number {
  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatBlogDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAuthorInitials(name: string | null | undefined): string {
  const safe = (name || "Software Hub").trim();
  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
