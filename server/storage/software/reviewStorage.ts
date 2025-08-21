import { db } from "../../db";
import { reviews, type Review, type InsertReview } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IReviewStorage {
  createReview(review: InsertReview, userId: number): Promise<Review>;
  getReviewsBySoftwareId(softwareId: number): Promise<Review[]>;
  getSoftwareReviews(softwareId: number): Promise<Review[]>;
  getUserReviewForSoftware(userId: number, softwareId: number): Promise<Review | undefined>;
  getReviewById(id: number): Promise<Review | undefined>;
  deleteReview(id: number, userId: number): Promise<boolean>;
  getUserReviews(userId: number): Promise<Review[]>;
  updateReview(id: number, userId: number, reviewData: Partial<InsertReview>): Promise<Review | undefined>;
}

export class ReviewStorage implements IReviewStorage {
  async createReview(review: InsertReview, userId: number): Promise<Review> {
    const [createdReview] = await db
      .insert(reviews)
      .values({
        ...review,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdReview;
  }

  async getReviewsBySoftwareId(softwareId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.software_id, softwareId));
  }

  async getSoftwareReviews(softwareId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.software_id, softwareId));
  }

  async getUserReviewForSoftware(userId: number, softwareId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.user_id, userId), eq(reviews.software_id, softwareId)));
    return review;
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async deleteReview(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.user_id, userId)));
    return result.rowCount > 0;
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, userId));
  }

  async updateReview(id: number, userId: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set(reviewData)
      .where(and(eq(reviews.id, id), eq(reviews.user_id, userId)))
      .returning();
    return updatedReview;
  }
}

export const reviewStorage = new ReviewStorage();
