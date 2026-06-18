import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { appSettings } from "@shared/schema";

const SETTING_KEYS = {
  measurementId: "ga_measurement_id",
} as const;

export type GaSettingsPublic = {
  configured: boolean;
  source: "database" | "env" | "none";
  measurementIdMasked: string | null;
  hasDatabaseValue: boolean;
  hasEnvValue: boolean;
};

function maskMeasurementId(id: string | null | undefined): string | null {
  if (!id?.trim()) return null;
  const value = id.trim();
  if (value.length <= 6) return "••••••";
  return `${value.slice(0, 4)}${"•".repeat(Math.min(8, value.length - 6))}${value.slice(-2)}`;
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

export async function getGaMeasurementId(): Promise<string | null> {
  await ensureAppSettingsTable();
  const dbValue = (await readSetting(SETTING_KEYS.measurementId))?.trim();
  const envValue =
    process.env.GA_MEASUREMENT_ID?.trim() ||
    process.env.VITE_GA_MEASUREMENT_ID?.trim() ||
    null;
  return dbValue || envValue;
}

export async function getGaSettingsPublic(): Promise<GaSettingsPublic> {
  await ensureAppSettingsTable();
  const dbValue = (await readSetting(SETTING_KEYS.measurementId))?.trim() || null;
  const envValue =
    process.env.GA_MEASUREMENT_ID?.trim() ||
    process.env.VITE_GA_MEASUREMENT_ID?.trim() ||
    null;
  const active = dbValue || envValue;

  return {
    configured: Boolean(active),
    source: dbValue ? "database" : envValue ? "env" : "none",
    measurementIdMasked: maskMeasurementId(active),
    hasDatabaseValue: Boolean(dbValue),
    hasEnvValue: Boolean(envValue),
  };
}

export async function saveGaSettings(input: { measurementId?: string; clearMeasurementId?: boolean }) {
  if (input.clearMeasurementId) {
    await deleteSetting(SETTING_KEYS.measurementId);
  } else if (input.measurementId !== undefined) {
    const value = input.measurementId.trim();
    if (!value) throw new Error("GA Measurement ID không được để trống");
    if (!value.startsWith("G-")) throw new Error("GA Measurement ID phải có dạng G-XXXXXXXXXX");
    await writeSetting(SETTING_KEYS.measurementId, value);
  }

  return getGaSettingsPublic();
}

