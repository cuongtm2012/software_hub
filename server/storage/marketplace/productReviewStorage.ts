import { db } from "../../db";
import { productReviews, type ProductReview, type InsertProductReview } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IProductReviewStorage {
  createProductReview(review: InsertProductReview, buyerId: number): Promise<ProductReview>;
  getProductReviewsByProductId(productId: number): Promise<ProductReview[]>;
  getBuyerReviewForProduct(buyerId: number, productId: number): Promise<ProductReview | undefined>;
  updateProductReview(id: number, buyerId: number, reviewData: Partial<InsertProductReview>): Promise<ProductReview | undefined>;
  deleteProductReview(id: number, buyerId: number): Promise<boolean>;
}

export class ProductReviewStorage implements IProductReviewStorage {
  async createProductReview(review: InsertProductReview, buyerId: number): Promise<ProductReview> {
    const [createdReview] = await db
      .insert(productReviews)
      .values({
        ...review,
        buyer_id: buyerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdReview;
  }

  async getProductReviewsByProductId(productId: number): Promise<ProductReview[]> {
    return await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.product_id, productId));
  }

  async getBuyerReviewForProduct(buyerId: number, productId: number): Promise<ProductReview | undefined> {
    const [review] = await db
      .select()
      .from(productReviews)
      .where(and(eq(productReviews.buyer_id, buyerId), eq(productReviews.product_id, productId)));
    return review;
  }

  async updateProductReview(id: number, buyerId: number, reviewData: Partial<InsertProductReview>): Promise<ProductReview | undefined> {
    const [updatedReview] = await db
      .update(productReviews)
      .set({
        ...reviewData,
        updated_at: new Date()
      })
      .where(and(eq(productReviews.id, id), eq(productReviews.buyer_id, buyerId)))
      .returning();
    return updatedReview;
  }

  async deleteProductReview(id: number, buyerId: number): Promise<boolean> {
    const result = await db
      .delete(productReviews)
      .where(and(eq(productReviews.id, id), eq(productReviews.buyer_id, buyerId)));
    return result.rowCount > 0;
  }
}

export const productReviewStorage = new ProductReviewStorage();
