import { db } from "../../db";
import { categories, type Category, type InsertCategory } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface ICategoryStorage {
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
}

export class CategoryStorage implements ICategoryStorage {
  async createCategory(category: InsertCategory): Promise<Category> {
    const [createdCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return createdCategory;
  }

  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }
}

export const categoryStorage = new CategoryStorage();
