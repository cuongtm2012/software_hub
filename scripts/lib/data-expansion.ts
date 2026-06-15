import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../server/db";
import { categories, users } from "../../shared/schema";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = join(__dirname, "..", "data");

export type SoftwareSource =
  | "awesome-free-apps"
  | "awesome-selfhosted"
  | "download.com.vn";

export interface FreeSoftwareEntry {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  url: string;
  download_link?: string;
  platform: string[];
  license?: string;
  vendor?: string;
  version?: string;
  image_url?: string | null;
  source: SoftwareSource;
  essential?: boolean;
  documentation_link?: string;
}

export interface ParsedSoftwareBundle {
  source: SoftwareSource;
  entries: FreeSoftwareEntry[];
}

export interface CourseEntry {
  title: string;
  instructor: string;
  youtubeUrl: string;
  playlistId: string;
  thumbnailUrl: string;
  level: string;
}

export interface CourseTopicBundle {
  topic: string;
  source?: string;
  courses: CourseEntry[];
}

export function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

export function writeJson(filename: string, data: unknown) {
  ensureDataDir();
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved ${path}`);
  return path;
}

export function readJson<T>(filename: string): T {
  const path = join(DATA_DIR, filename);
  if (!existsSync(path)) {
    throw new Error(`Missing data file: ${path}. Run the parse script first.`);
  }
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export function normalizePlatforms(platforms: string[]): string[] {
  const out = new Set<string>();
  for (const raw of platforms) {
    const p = raw.toLowerCase().trim();
    if (p.includes("win")) out.add("windows");
    else if (p.includes("mac") || p === "osx") out.add("mac");
    else if (p.includes("linux")) out.add("linux");
    else if (p.includes("android")) out.add("android");
    else if (p.includes("ios") || p.includes("iphone")) out.add("ios");
    else if (p.includes("web") || p.includes("docker") || p.includes("nodejs")) out.add("web");
    else if (["windows", "mac", "linux", "android", "ios", "web"].includes(p)) out.add(p);
  }
  if (out.size === 0) out.add("web");
  return [...out];
}

export function inferLevel(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("nâng cao") || lower.includes("advanced")) return "advanced";
  if (lower.includes("trung cấp") || lower.includes("intermediate")) return "intermediate";
  return "beginner";
}

export function extractPlaylistId(url: string): string {
  const match = url.match(/[?&]list=([^&]+)/);
  return match?.[1] ?? "";
}

export function playlistThumbnail(playlistId: string): string {
  return playlistId ? `https://i.ytimg.com/vi/${playlistId}/hqdefault.jpg` : "";
}

export async function getOrCreateCategory(
  name: string,
  parentId: number | null,
): Promise<number> {
  const existing = parentId
    ? await db.query.categories.findFirst({
        where: and(eq(categories.name, name), eq(categories.parent_id, parentId)),
      })
    : await db.query.categories.findFirst({
        where: and(eq(categories.name, name), isNull(categories.parent_id)),
      });

  if (existing) return existing.id;

  try {
    const [created] = await db
      .insert(categories)
      .values({ name, parent_id: parentId })
      .returning();
    return created.id;
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      const again = parentId
        ? await db.query.categories.findFirst({
            where: and(eq(categories.name, name), eq(categories.parent_id, parentId)),
          })
        : await db.query.categories.findFirst({
            where: and(eq(categories.name, name), isNull(categories.parent_id)),
          });
      if (again) return again.id;
      const byName = await db.query.categories.findFirst({
        where: eq(categories.name, name),
      });
      if (byName) return byName.id;
    }
    throw err;
  }
}

export async function getSeedAdminUserId(): Promise<number> {
  let adminUser = await db.query.users.findFirst({
    where: eq(users.email, "admin@test.com"),
  });
  if (!adminUser) {
    adminUser = await db.query.users.findFirst({ where: eq(users.role, "admin") });
  }
  if (!adminUser) {
    adminUser = await db.query.users.findFirst();
  }
  if (!adminUser) {
    throw new Error("No user found for created_by. Create an admin user first.");
  }
  return adminUser.id;
}

export function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey = "";
  let list: string[] = [];

  for (const line of content.split("\n")) {
    if (line.match(/^\s+-\s+/)) {
      list.push(line.replace(/^\s+-\s+/, "").trim());
      continue;
    }
    if (currentKey && list.length) {
      result[currentKey] = list;
      list = [];
      currentKey = "";
    }
    const match = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (!match) continue;
    const [, key, value] = match;
    if (!value) {
      currentKey = key;
      list = [];
    } else {
      result[key] = value.replace(/^['"]|['"]$/g, "");
      currentKey = "";
    }
  }
  if (currentKey && list.length) result[currentKey] = list;
  return result;
}
