#!/bin/bash

# Portfolio module
cat > server/storage/portfolio/portfolioStorage.ts << 'EOF'
import { db } from "../../db";
import { portfolios, portfolioReviews, type Portfolio, type InsertPortfolio, type PortfolioReview, type InsertPortfolioReview } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IPortfolioStorage {
  createPortfolio(portfolio: InsertPortfolio, developerId: number): Promise<Portfolio>;
  getPortfolioById(id: number): Promise<Portfolio | undefined>;
  getPortfoliosByDeveloperId(developerId: number): Promise<Portfolio[]>;
  getDeveloperPortfolio(developerId: number): Promise<Portfolio[]>;
  getAllPortfolios(limit?: number, offset?: number): Promise<{ portfolios: Portfolio[], total: number }>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: number, developerId: number): Promise<boolean>;
  
  // Portfolio Reviews
  createPortfolioReview(review: InsertPortfolioReview, userId: number): Promise<PortfolioReview>;
  getPortfolioReviewsByPortfolioId(portfolioId: number): Promise<PortfolioReview[]>;
  getPortfolioReviews(portfolioId: number): Promise<PortfolioReview[]>;
  getClientReviewForPortfolio(clientId: number, portfolioId: number): Promise<PortfolioReview | undefined>;
  deletePortfolioReview(id: number, userId: number): Promise<boolean>;
}

export class PortfolioStorage implements IPortfolioStorage {
  async createPortfolio(portfolio: InsertPortfolio, developerId: number): Promise<Portfolio> {
    const [createdPortfolio] = await db
      .insert(portfolios)
      .values({
        ...portfolio,
        developer_id: developerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdPortfolio;
  }

  async getPortfolioById(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, id));
    return portfolio;
  }

  async getPortfoliosByDeveloperId(developerId: number): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.developer_id, developerId));
  }

  async getDeveloperPortfolio(developerId: number): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.developer_id, developerId));
  }

  async getAllPortfolios(limit?: number, offset?: number): Promise<{ portfolios: Portfolio[], total: number }> {
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(portfolios);

    const total = countResult?.count || 0;

    const portfoliosList = await db
      .select()
      .from(portfolios)
      .limit(limit || 10)
      .offset(offset || 0);

    return { portfolios: portfoliosList, total };
  }

  async updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set({
        ...portfolio,
        updated_at: new Date()
      })
      .where(eq(portfolios.id, id))
      .returning();
    return updatedPortfolio;
  }

  async deletePortfolio(id: number, developerId: number): Promise<boolean> {
    const result = await db
      .delete(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.developer_id, developerId)));
    return result.rowCount > 0;
  }

  async createPortfolioReview(review: InsertPortfolioReview, userId: number): Promise<PortfolioReview> {
    const [createdReview] = await db
      .insert(portfolioReviews)
      .values({
        ...review,
        client_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdReview;
  }

  async getPortfolioReviewsByPortfolioId(portfolioId: number): Promise<PortfolioReview[]> {
    return await db
      .select()
      .from(portfolioReviews)
      .where(eq(portfolioReviews.portfolio_id, portfolioId));
  }

  async getPortfolioReviews(portfolioId: number): Promise<PortfolioReview[]> {
    return await db
      .select()
      .from(portfolioReviews)
      .where(eq(portfolioReviews.portfolio_id, portfolioId));
  }

  async getClientReviewForPortfolio(clientId: number, portfolioId: number): Promise<PortfolioReview | undefined> {
    const [review] = await db
      .select()
      .from(portfolioReviews)
      .where(and(eq(portfolioReviews.client_id, clientId), eq(portfolioReviews.portfolio_id, portfolioId)));
    return review;
  }

  async deletePortfolioReview(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(portfolioReviews)
      .where(and(eq(portfolioReviews.id, id), eq(portfolioReviews.client_id, userId)));
    return result.rowCount > 0;
  }
}

export const portfolioStorage = new PortfolioStorage();
EOF

cat > server/storage/portfolio/index.ts << 'EOF'
export * from './portfolioStorage';
EOF

echo "✅ Portfolio modules created"

