import { db } from "../../db";
import { sellerProfiles, type SellerProfile, type InsertSellerProfile } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface ISellerStorage {
  createSellerProfile(profile: InsertSellerProfile, sellerId: number): Promise<SellerProfile>;
  getSellerProfileById(id: number): Promise<SellerProfile | undefined>;
  getSellerProfileByUserId(userId: number): Promise<SellerProfile | undefined>;
  getAllSellerProfiles(limit?: number, offset?: number): Promise<{ sellers: SellerProfile[], total: number }>;
  updateSellerProfile(id: number, profile: Partial<InsertSellerProfile>): Promise<SellerProfile | undefined>;
}

export class SellerStorage implements ISellerStorage {
  async createSellerProfile(profile: InsertSellerProfile, sellerId: number): Promise<SellerProfile> {
    const [createdProfile] = await db
      .insert(sellerProfiles)
      .values({
        ...profile,
        user_id: sellerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdProfile;
  }

  async getSellerProfileById(id: number): Promise<SellerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.id, id));
    return profile;
  }

  async getSellerProfileByUserId(userId: number): Promise<SellerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(sellerProfiles)
      .where(eq(sellerProfiles.user_id, userId));
    return profile;
  }

  async getAllSellerProfiles(limit?: number, offset?: number): Promise<{ sellers: SellerProfile[], total: number }> {
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sellerProfiles);

    const total = countResult?.count || 0;

    const sellersList = await db
      .select()
      .from(sellerProfiles)
      .limit(limit || 10)
      .offset(offset || 0);

    return { sellers: sellersList, total };
  }

  async updateSellerProfile(id: number, profile: Partial<InsertSellerProfile>): Promise<SellerProfile | undefined> {
    const [updatedProfile] = await db
      .update(sellerProfiles)
      .set({
        ...profile,
        updated_at: new Date()
      })
      .where(eq(sellerProfiles.id, id))
      .returning();
    return updatedProfile;
  }
}

export const sellerStorage = new SellerStorage();
