/** User-centric software categories (need-based, not platform/source). */

export type SoftwareUseCategory = {
  slug: string;
  name: string;
  aliases: string[];
};

export const SOFTWARE_USE_CATEGORIES: SoftwareUseCategory[] = [
  { slug: "van-phong", name: "Văn phòng & Năng suất", aliases: ["office", "productivity", "note-taking", "note taking", "editors", "calendar", "contacts", "groupware", "office suites"] },
  { slug: "lap-trinh", name: "Lập trình & DevOps", aliases: ["development", "developer tools", "devtools", "software development", "programming", "terminal", "text editors", "tools", "api", "apis"] },
  { slug: "bao-mat", name: "Bảo mật", aliases: ["security", "password", "vpn", "identity", "federated identity", "authentication"] },
  { slug: "do-hoa", name: "Đồ họa & Thiết kế", aliases: ["graphics", "customization", "desktop customization", "photo", "image"] },
  { slug: "am-thanh-video", name: "Âm thanh & Video", aliases: ["audio", "video", "media streaming", "music", "multimedia"] },
  { slug: "internet", name: "Internet & Trình duyệt", aliases: ["internet", "browsers", "browser", "downloaders", "network", "network utilities", "dns", "feed readers"] },
  { slug: "lien-lac", name: "Chat & Liên lạc", aliases: ["communication", "chat", "chat clients", "email", "irc", "sip", "xmpp", "social"] },
  { slug: "game", name: "Game & Giải trí", aliases: ["games", "game", "gaming", "emulator"] },
  { slug: "giao-duc", name: "Giáo dục", aliases: ["education", "learning", "courses"] },
  { slug: "tien-ich", name: "Tiện ích hệ thống", aliases: ["utilities", "utility", "file management", "backup", "archiving", "automation", "monitoring", "status pages"] },
  { slug: "tu-host", name: "Tự host & Server", aliases: ["self-hosting", "self hosted", "web servers", "database", "database management", "cms", "content management", "wiki", "wikis", "blogging", "e-commerce", "analytics", "crm", "document management", "file sharing", "file sync", "pastebin", "ticketing", "project management", "knowledge management", "human resources", "hrm", "iot", "manufacturing", "maps", "gps", "genai", "generative artificial intelligence", "ai tools", "ai"] },
  { slug: "quan-tri", name: "Quản trị hệ thống", aliases: ["sysadmin", "administrative", "control panels", "monitoring & status pages"] },
  { slug: "khac", name: "Khác", aliases: ["miscellaneous", "misc", "contents", "other", "general"] },
];

export function extractLegacySubcategory(categoryName: string): string {
  const trimmed = categoryName.trim();
  const paren = trimmed.match(/^(.+?)\s*\([^)]+\)\s*$/);
  return (paren ? paren[1] : trimmed).trim();
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolveUseCategorySlug(subcategoryLabel: string): string {
  const key = normalizeKey(subcategoryLabel);
  if (!key) return "khac";

  for (const cat of SOFTWARE_USE_CATEGORIES) {
    if (normalizeKey(cat.name) === key || cat.slug === key) return cat.slug;
    for (const alias of cat.aliases) {
      if (key === normalizeKey(alias) || key.includes(normalizeKey(alias)) || normalizeKey(alias).includes(key)) {
        return cat.slug;
      }
    }
  }

  for (const cat of SOFTWARE_USE_CATEGORIES) {
    for (const alias of cat.aliases) {
      const aliasKey = normalizeKey(alias);
      if (aliasKey.length >= 4 && key.includes(aliasKey)) return cat.slug;
    }
  }

  return "khac";
}
