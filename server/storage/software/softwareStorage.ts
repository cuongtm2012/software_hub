import { db } from "../../db";
import { softwares, type Software, type InsertSoftware } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface ISoftwareStorage {
  createSoftware(software: InsertSoftware, userId: number): Promise<Software>;
  getSoftwareById(id: number): Promise<Software | undefined>;
  updateSoftware(id: number, software: Partial<InsertSoftware>): Promise<Software | undefined>;
  updateSoftwareAdmin(id: number, software: Partial<InsertSoftware>): Promise<Software | undefined>;
  deleteSoftware(id: number): Promise<boolean>;
  updateSoftwareStatus(id: number, status: 'approved' | 'rejected'): Promise<Software | undefined>;
  incrementSoftwareDownloads(id: number): Promise<void>;
  getSoftwareList(params: {
    category?: number;
    platform?: string;
    search?: string;
    type?: 'software' | 'api';
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<{ softwares: Software[], total: number }>;
  getAdminSoftwareList(filters: any, limit?: number, offset?: number): Promise<{ softwares: Software[], total: number }>;
}

export class SoftwareStorage implements ISoftwareStorage {
  async createSoftware(software: InsertSoftware, userId: number): Promise<Software> {
    const [createdSoftware] = await db
      .insert(softwares)
      .values({
        ...software,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdSoftware;
  }

  async getSoftwareById(id: number): Promise<Software | undefined> {
    const [software] = await db
      .select()
      .from(softwares)
      .where(eq(softwares.id, id));
    return software;
  }

  async updateSoftware(id: number, software: Partial<InsertSoftware>): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set({
        ...software,
        updated_at: new Date()
      })
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async updateSoftwareAdmin(id: number, software: Partial<InsertSoftware>): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set({
        ...software,
        updated_at: new Date()
      })
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async deleteSoftware(id: number): Promise<boolean> {
    const result = await db
      .delete(softwares)
      .where(eq(softwares.id, id));
    return result.rowCount > 0;
  }

  async updateSoftwareStatus(id: number, status: 'approved' | 'rejected'): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async incrementSoftwareDownloads(id: number): Promise<void> {
    await db
      .update(softwares)
      .set({
        downloads: sql`${softwares.downloads} + 1`
      })
      .where(eq(softwares.id, id));
  }

  async getSoftwareList(params: {
    category?: number;
    platform?: string;
    search?: string;
    type?: 'software' | 'api';
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<{ softwares: Software[], total: number }> {
    let whereConditions = [];

    if (params.category) {
      whereConditions.push(eq(softwares.category_id, params.category));
    }

    if (params.platform) {
      whereConditions.push(eq(softwares.platform, params.platform));
    }

    if (params.search) {
      whereConditions.push(ilike(softwares.name, `%${params.search}%`));
    }

    if (params.type) {
      whereConditions.push(eq(softwares.type, params.type));
    }

    if (params.status) {
      whereConditions.push(eq(softwares.status, params.status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(softwares)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const softwaresList = await db
      .select()
      .from(softwares)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params.limit || 10)
      .offset(params.offset || 0);

    return { softwares: softwaresList, total };
  }

  async getAdminSoftwareList(filters: any, limit?: number, offset?: number): Promise<{ softwares: Software[], total: number }> {
    let whereConditions = [];

    if (filters.category) {
      whereConditions.push(eq(softwares.category_id, filters.category));
    }

    if (filters.platform) {
      whereConditions.push(eq(softwares.platform, filters.platform));
    }

    if (filters.search) {
      whereConditions.push(ilike(softwares.name, `%${filters.search}%`));
    }

    if (filters.status) {
      whereConditions.push(eq(softwares.status, filters.status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(softwares)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const softwaresList = await db
      .select()
      .from(softwares)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit || 10)
      .offset(offset || 0);

    return { softwares: softwaresList, total };
  }
}

export const softwareStorage = new SoftwareStorage();
