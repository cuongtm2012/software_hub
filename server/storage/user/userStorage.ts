import { db } from "../../db";
import { users, userDownloads, type User, type InsertUser, type UserDownload, type InsertUserDownload } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface IUserStorage {
  // User CRUD
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserProfile(userId: number, profileData: any): Promise<User | undefined>;
  
  // Admin User Management
  getAllUsers(params?: { role?: string; search?: string; limit?: number; offset?: number }): Promise<{ users: any[], total: number }>;
  deleteUser(id: number): Promise<boolean>;
  resetUserPassword(id: number, newPassword: string): Promise<boolean>;
  
  // User Downloads
  createUserDownload(userId: number, softwareId: number, version: string): Promise<UserDownload>;
  getUserDownloads(userId: number): Promise<UserDownload[]>;
}

export class UserStorage implements IUserStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return createdUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserProfile(userId: number, profileData: any): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getAllUsers(params?: { role?: string; search?: string; limit?: number; offset?: number }): Promise<{ users: any[], total: number }> {
    let whereConditions = [];

    if (params?.role) {
      whereConditions.push(eq(users.role, params.role));
    }

    if (params?.search) {
      whereConditions.push(ilike(users.name, `%${params.search}%`));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const usersList = await db
      .select()
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { users: usersList, total };
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async resetUserPassword(id: number, newPassword: string): Promise<boolean> {
    const [updatedUser] = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id))
      .returning();
    return !!updatedUser;
  }

  async createUserDownload(userId: number, softwareId: number, version: string): Promise<UserDownload> {
    const [download] = await db
      .insert(userDownloads)
      .values({
        user_id: userId,
        software_id: softwareId,
        version,
        downloaded_at: new Date()
      })
      .returning();
    return download;
  }

  async getUserDownloads(userId: number): Promise<UserDownload[]> {
    const downloads = await db
      .select()
      .from(userDownloads)
      .where(eq(userDownloads.user_id, userId));
    return downloads;
  }
}

export const userStorage = new UserStorage();
