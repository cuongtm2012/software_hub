import { db } from "../../db";
import { reviews, users, type Review, type InsertReview } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IReviewStorage {
  createReview(review: InsertReview, userId: number): Promise<Review>;
  getReviewsBySoftwareId(softwareId: number): Promise<(Review & { user_name: string })[]>;
  getSoftwareReviews(softwareId: number): Promise<(Review & { user_name: string })[]>;
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
      })
      .returning();
    return createdReview;
  }

  async getReviewsBySoftwareId(softwareId: number): Promise<(Review & { user_name: string })[]> {
    return this.getSoftwareReviews(softwareId);
  }

  async getSoftwareReviews(softwareId: number): Promise<(Review & { user_name: string })[]> {
    return await db
      .select({
        id: reviews.id,
        user_id: reviews.user_id,
        target_type: reviews.target_type,
        target_id: reviews.target_id,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.created_at,
        user_name: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.user_id, users.id))
      .where(and(eq(reviews.target_type, "software"), eq(reviews.target_id, softwareId)))
      .orderBy(desc(reviews.created_at));
  }

  async getUserReviewForSoftware(userId: number, softwareId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.user_id, userId),
          eq(reviews.target_type, "software"),
          eq(reviews.target_id, softwareId),
        ),
      );
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
