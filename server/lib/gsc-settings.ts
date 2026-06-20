import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { appSettings } from "@shared/schema";

const SETTING_KEY = "google_site_verification";

export type GscSettingsPublic = {
  configured: boolean;
  source: "database" | "env" | "none";
  tokenMasked: string | null;
  hasDatabaseValue: boolean;
  hasEnvValue: boolean;
  sitemapUrl: string;
};

function maskToken(token: string | null | undefined): string | null {
  if (!token?.trim()) return null;
  const value = token.trim();
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}${"•".repeat(Math.min(12, value.length - 8))}${value.slice(-4)}`;
}

let tableReady = false;

async function ensureAppSettingsTable() {
  if (tableReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  tableReady = true;
}

async function readSetting(key: string): Promise<string | null> {
  await ensureAppSettingsTable();
  const rows = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);
  return rows[0]?.value ?? null;
}

async function writeSetting(key: string, value: string) {
  await ensureAppSettingsTable();
  await db
    .insert(appSettings)
    .values({ key, value, updated_at: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updated_at: new Date() },
    });
}

async function deleteSetting(key: string) {
  await ensureAppSettingsTable();
  await db.delete(appSettings).where(eq(appSettings.key, key));
}

function siteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.APP_URL ||
    process.env.PUBLIC_URL ||
    "https://swhubco.com"
  ).replace(/\/$/, "");
}

export async function getGoogleSiteVerificationToken(): Promise<string | null> {
  await ensureAppSettingsTable();
  const dbValue = (await readSetting(SETTING_KEY))?.trim();
  const envValue = process.env.GOOGLE_SITE_VERIFICATION?.trim() || null;
  return dbValue || envValue;
}

export async function getGscSettingsPublic(): Promise<GscSettingsPublic> {
  await ensureAppSettingsTable();
  const dbValue = (await readSetting(SETTING_KEY))?.trim() || null;
  const envValue = process.env.GOOGLE_SITE_VERIFICATION?.trim() || null;
  const active = dbValue || envValue;

  return {
    configured: Boolean(active),
    source: dbValue ? "database" : envValue ? "env" : "none",
    tokenMasked: maskToken(active),
    hasDatabaseValue: Boolean(dbValue),
    hasEnvValue: Boolean(envValue),
    sitemapUrl: `${siteUrl()}/sitemap.xml`,
  };
}

export async function saveGscSettings(input: {
  verificationToken?: string;
  clearVerificationToken?: boolean;
}) {
  if (input.clearVerificationToken) {
    await deleteSetting(SETTING_KEY);
  } else if (input.verificationToken !== undefined) {
    const value = input.verificationToken.trim();
    if (!value) throw new Error("Verification token không được để trống");
    if (value.length < 10 || value.length > 200) {
      throw new Error("Verification token không hợp lệ (độ dài 10–200 ký tự)");
    }
    if (!/^[a-zA-Z0-9_\-+=/.]+$/.test(value)) {
      throw new Error("Verification token chứa ký tự không hợp lệ");
    }
    await writeSetting(SETTING_KEY, value);
  }

  return getGscSettingsPublic();
}
