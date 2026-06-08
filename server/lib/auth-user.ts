import { Request } from "express";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db } from "../db.js";
import { users } from "@shared/schema";
import { verifySupabaseToken, isSupabaseConfigured } from "./supabase.js";

export type AuthUserPayload = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

export async function resolveUserFromToken(
  token: string,
): Promise<AuthUserPayload | null> {
  if (!isSupabaseConfigured()) return null;

  const supabaseUser = await verifySupabaseToken(token);
  if (!supabaseUser?.email) return null;

  let [localUser] = await db
    .select()
    .from(users)
    .where(eq(users.supabase_id, supabaseUser.id))
    .limit(1);

  if (!localUser) {
    [localUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, supabaseUser.email))
      .limit(1);

    if (localUser) {
      await db
        .update(users)
        .set({ supabase_id: supabaseUser.id, email_verified: true })
        .where(eq(users.id, localUser.id));
    }
  }

  if (!localUser) {
    const name =
      supabaseUser.email.split("@")[0] ||
      (supabaseUser as { user_metadata?: { name?: string } }).user_metadata?.name ||
      "User";

    [localUser] = await db
      .insert(users)
      .values({
        name,
        email: supabaseUser.email,
        password: crypto.randomBytes(32).toString("hex"),
        supabase_id: supabaseUser.id,
        role: "user",
        email_verified: true,
      })
      .returning();
  }

  return toAuthPayload(localUser);
}

export async function resolveUserFromRequest(
  req: Request,
): Promise<AuthUserPayload | null> {
  if (process.env.DISABLE_AUTH === "true") {
    const mockRole = process.env.MOCK_USER_ROLE || "seller";
    const mockUsers: Record<string, AuthUserPayload> = {
      seller: { id: 2, name: "Test Seller", email: "seller@test.com", role: "seller" },
      buyer: { id: 3, name: "Test Buyer", email: "buyer@test.com", role: "buyer" },
      admin: { id: 1, name: "Admin User", email: "admin@test.com", role: "admin" },
    };
    return mockUsers[mockRole] || mockUsers.seller;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return resolveUserFromToken(authHeader.slice(7));
  }

  return null;
}

function toAuthPayload(user: typeof users.$inferSelect): AuthUserPayload {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: (user.profile_data as { avatar?: string } | null)?.avatar,
  };
}
