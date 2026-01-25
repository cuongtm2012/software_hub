import { db } from "../../db";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface IProductStorage {
  createProduct(product: InsertProduct, sellerId: number): Promise<Product>;
  getProductById(id: number): Promise<Product | undefined>;
  getProducts(params?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<{ products: Product[], total: number }>;
  getProductsByCategory(category: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }>;
  getProductsBySellerId(sellerId: number): Promise<Product[]>;
  searchProducts(search: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }>;
  updateProduct(id: number, product: Partial<InsertProduct>, sellerId: number): Promise<Product | undefined>;
  deleteProduct(id: number, sellerId: number): Promise<boolean>;
}

export class ProductStorage implements IProductStorage {
  async createProduct(product: InsertProduct, sellerId: number): Promise<Product> {
    const [createdProduct] = await db
      .insert(products)
      .values({
        ...product,
        seller_id: sellerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdProduct;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async getProducts(params?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<{ products: Product[], total: number }> {
    let whereConditions = [];

    if (params?.category) {
      whereConditions.push(eq(products.category, params.category));
    }

    if (params?.search) {
      whereConditions.push(ilike(products.name, `%${params.search}%`));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const productsList = await db
      .select()
      .from(products)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { products: productsList, total };
  }

  async getProductsByCategory(category: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }> {
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.category, category));

    const total = countResult?.count || 0;

    const productsList = await db
      .select()
      .from(products)
      .where(eq(products.category, category))
      .limit(limit || 10)
      .offset(offset || 0);

    return { products: productsList, total };
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.seller_id, sellerId));
  }

  async searchProducts(search: string, limit?: number, offset?: number): Promise<{ products: Product[], total: number }> {
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(ilike(products.name, `%${search}%`));

    const total = countResult?.count || 0;

    const productsList = await db
      .select()
      .from(products)
      .where(ilike(products.name, `%${search}%`))
      .limit(limit || 10)
      .offset(offset || 0);

    return { products: productsList, total };
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, sellerId: number): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...product,
        updated_at: new Date()
      })
      .where(and(eq(products.id, id), eq(products.seller_id, sellerId)))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, sellerId: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.seller_id, sellerId)));
    return result.rowCount > 0;
  }
}

export const productStorage = new ProductStorage();
