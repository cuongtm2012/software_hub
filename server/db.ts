import { config } from "dotenv";
config();

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

function resolveDatabaseUrl(): string {
  const explicit = process.env.DATABASE_URL;
  if (explicit && !explicit.includes("[") && !explicit.includes("DB_PASSWORD")) {
    return explicit;
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (password && supabaseUrl) {
    const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!ref) throw new Error("Invalid SUPABASE_URL format");

    const region = process.env.SUPABASE_DB_REGION || "ap-southeast-1";
    const port = process.env.SUPABASE_DB_PORT || "6543";
    const user = process.env.SUPABASE_DB_USER || `postgres.${ref}`;
    const poolerGen = process.env.SUPABASE_DB_POOLER || "aws-1";
    const host =
      process.env.SUPABASE_DB_HOST ||
      `${poolerGen}-${region}.pooler.supabase.com`;

    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
  }

  throw new Error(
    "DATABASE_URL or SUPABASE_DB_PASSWORD must be set. " +
      "Get database password from Supabase Dashboard → Settings → Database.",
  );
}

const databaseUrl = resolveDatabaseUrl();
const isSupabase = databaseUrl.includes("supabase");

export const pool = new Pool({
  connectionString: databaseUrl,
  ...(isSupabase && { ssl: { rejectUnauthorized: false } }),
});
export const db = drizzle(pool, { schema });
