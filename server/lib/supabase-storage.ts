import { randomUUID } from "crypto";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase.js";

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

export function isStorageConfigured(): boolean {
  return isSupabaseConfigured();
}

export async function createSignedUploadUrl(
  fileName: string,
  uploadType = "general",
): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string } | null> {
  if (!isStorageConfigured()) return null;

  const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
  const fileKey = `${uploadType}/${randomUUID()}.${ext}`;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage
    .from(DEFAULT_BUCKET)
    .createSignedUploadUrl(fileKey);

  if (error || !data?.signedUrl) {
    console.error("Supabase signed upload URL error:", error);
    return null;
  }

  const { data: publicData } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(fileKey);

  return {
    uploadUrl: data.signedUrl,
    fileKey,
    publicUrl: publicData.publicUrl,
  };
}

export async function createSignedDownloadUrl(
  fileKey: string,
  expiresIn = 3600,
): Promise<string | null> {
  if (!isStorageConfigured()) return null;

  const { data, error } = await getSupabaseAdmin().storage
    .from(DEFAULT_BUCKET)
    .createSignedUrl(fileKey, expiresIn);

  if (error || !data?.signedUrl) {
    console.error("Supabase signed download URL error:", error);
    return null;
  }

  return data.signedUrl;
}
