import { 
  users, softwares, categories, reviews,
  type User, type InsertUser, 
  type Software, type InsertSoftware,
  type Category, type InsertCategory,
  type Review, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, ilike, inArray, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Categories
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  
  // Software
  createSoftware(software: InsertSoftware, userId: number): Promise<Software>;
  getSoftwareById(id: number): Promise<Software | undefined>;
  updateSoftwareStatus(id: number, status: 'approved' | 'rejected'): Promise<Software | undefined>;
  getSoftwareList(params: {
    category?: number;
    platform?: string;
    search?: string;
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<{ softwares: Software[], total: number }>;
  
  // Reviews
  createReview(review: InsertReview, userId: number): Promise<Review>;
  getReviewsBySoftwareId(softwareId: number): Promise<Review[]>;
  deleteReview(id: number, userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Categories
  async createCategory(category: InsertCategory): Promise<Category> {
    const [createdCategory] = await db.insert(categories).values(category).returning();
    return createdCategory;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  // Software
  async createSoftware(softwareData: InsertSoftware, userId: number): Promise<Software> {
    const [software] = await db
      .insert(softwares)
      .values({
        ...softwareData,
        created_by: userId
      })
      .returning();
    return software;
  }

  async getSoftwareById(id: number): Promise<Software | undefined> {
    const [software] = await db
      .select()
      .from(softwares)
      .where(eq(softwares.id, id));
    return software;
  }

  async updateSoftwareStatus(id: number, status: 'approved' | 'rejected'): Promise<Software | undefined> {
    const [updatedSoftware] = await db
      .update(softwares)
      .set({ status })
      .where(eq(softwares.id, id))
      .returning();
    return updatedSoftware;
  }

  async getSoftwareList(params: {
    category?: number;
    platform?: string;
    search?: string;
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<{ softwares: Software[], total: number }> {
    let query = db.select().from(softwares);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(softwares);
    
    // Build conditions
    const conditions = [];
    
    if (params.category) {
      conditions.push(eq(softwares.category_id, params.category));
    }
    
    if (params.platform) {
      conditions.push(sql`${params.platform} = ANY(${softwares.platform})`);
    }
    
    if (params.search) {
      conditions.push(
        or(
          ilike(softwares.name, `%${params.search}%`),
          ilike(softwares.description, `%${params.search}%`)
        )
      );
    }
    
    // By default, only show approved software unless specified
    conditions.push(eq(softwares.status, params.status || 'approved'));
    
    // Apply conditions
    if (conditions.length > 0) {
      const whereCondition = conditions.reduce((acc, condition) => and(acc, condition));
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    
    // Get total count
    const [countResult] = await countQuery;
    const total = countResult?.count || 0;
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
      
      if (params.offset) {
        query = query.offset(params.offset);
      }
    }
    
    // Order by creation date, newest first
    query = query.orderBy(desc(softwares.created_at));
    
    const softwareList = await query;
    
    return {
      softwares: softwareList,
      total
    };
  }

  // Reviews
  async createReview(reviewData: InsertReview, userId: number): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...reviewData,
        user_id: userId
      })
      .returning();
    return review;
  }

  async getReviewsBySoftwareId(softwareId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.target_type, 'software'),
          eq(reviews.target_id, softwareId)
        )
      )
      .orderBy(desc(reviews.created_at));
  }

  async deleteReview(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(reviews)
      .where(
        and(
          eq(reviews.id, id),
          eq(reviews.user_id, userId)
        )
      )
      .returning({ id: reviews.id });
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
