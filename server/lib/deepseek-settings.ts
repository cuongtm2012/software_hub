import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { appSettings } from "@shared/schema";

const SETTING_KEYS = {
  apiKey: "deepseek_api_key",
  baseUrl: "deepseek_base_url",
  model: "deepseek_model",
} as const;

export type DeepseekSettingsPublic = {
  configured: boolean;
  source: "database" | "env" | "none";
  apiKeyMasked: string | null;
  baseUrl: string;
  model: string;
  hasDatabaseKey: boolean;
  hasEnvKey: boolean;
};

type DeepseekRuntime = {
  apiKey?: string;
  baseUrl: string;
  model: string;
  source: "database" | "env" | "none";
};

let runtime: DeepseekRuntime = {
  baseUrl: "https://api.deepseek.com",
  model: "deepseek-chat",
  source: "none",
};

let tableReady = false;

export function maskApiKey(apiKey: string | null | undefined): string | null {
  if (!apiKey?.trim()) return null;
  const key = apiKey.trim();
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 3)}${"•".repeat(Math.min(12, key.length - 7))}${key.slice(-4)}`;
}

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

export async function refreshDeepseekRuntimeSettings(): Promise<void> {
  await ensureAppSettingsTable();

  const [dbApiKey, dbBaseUrl, dbModel] = await Promise.all([
    readSetting(SETTING_KEYS.apiKey),
    readSetting(SETTING_KEYS.baseUrl),
    readSetting(SETTING_KEYS.model),
  ]);

  const envApiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const envBaseUrl = process.env.DEEPSEEK_BASE_URL?.trim();
  const envModel = process.env.DEEPSEEK_MODEL?.trim();

  const apiKey = dbApiKey?.trim() || envApiKey;
  const baseUrl = dbBaseUrl?.trim() || envBaseUrl || "https://api.deepseek.com";
  const model = dbModel?.trim() || envModel || "deepseek-chat";

  runtime = {
    apiKey: apiKey || undefined,
    baseUrl,
    model,
    source: dbApiKey?.trim() ? "database" : envApiKey ? "env" : "none",
  };
}

export function isDeepseekConfigured(): boolean {
  return Boolean(runtime.apiKey?.trim() || process.env.DEEPSEEK_API_KEY?.trim());
}

export function getDeepseekRuntimeConfig() {
  const apiKey = runtime.apiKey?.trim() || process.env.DEEPSEEK_API_KEY?.trim();
  const baseUrl = runtime.baseUrl || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = runtime.model || process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY chưa được cấu hình. Thêm key trong Admin → Cài đặt hoặc file .env");
  }

  return { apiKey, baseUrl, model };
}

export async function getDeepseekSettingsPublic(): Promise<DeepseekSettingsPublic> {
  await refreshDeepseekRuntimeSettings();

  const [dbApiKey] = await Promise.all([readSetting(SETTING_KEYS.apiKey)]);
  const envApiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const activeKey = runtime.apiKey?.trim();

  return {
    configured: Boolean(activeKey),
    source: runtime.source,
    apiKeyMasked: maskApiKey(activeKey),
    baseUrl: runtime.baseUrl,
    model: runtime.model,
    hasDatabaseKey: Boolean(dbApiKey?.trim()),
    hasEnvKey: Boolean(envApiKey),
  };
}

export async function saveDeepseekSettings(input: {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  clearApiKey?: boolean;
}) {
  if (input.clearApiKey) {
    await deleteSetting(SETTING_KEYS.apiKey);
  } else if (input.apiKey?.trim()) {
    await writeSetting(SETTING_KEYS.apiKey, input.apiKey.trim());
  }

  if (input.baseUrl !== undefined) {
    const url = input.baseUrl.trim() || "https://api.deepseek.com";
    await writeSetting(SETTING_KEYS.baseUrl, url);
  }

  if (input.model?.trim()) {
    await writeSetting(SETTING_KEYS.model, input.model.trim());
  }

  await refreshDeepseekRuntimeSettings();
  return getDeepseekSettingsPublic();
}
