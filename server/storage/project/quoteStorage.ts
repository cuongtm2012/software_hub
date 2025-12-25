import { db } from "../../db";
import { quotes, type Quote, type InsertQuote } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IQuoteStorage {
  createQuote(quote: InsertQuote, developerId: number): Promise<Quote>;
  getQuotesByProjectId(projectId: number): Promise<Quote[]>;
  getQuotesByDeveloperId(developerId: number): Promise<Quote[]>;
  getDeveloperQuoteForProject(developerId: number, projectId: number): Promise<Quote | undefined>;
  getQuoteById(id: number): Promise<Quote | undefined>;
  updateQuoteStatus(id: number, status: string): Promise<Quote | undefined>;
  rejectOtherQuotes(projectId: number, acceptedQuoteId: number): Promise<void>;
}

export class QuoteStorage implements IQuoteStorage {
  async createQuote(quote: InsertQuote, developerId: number): Promise<Quote> {
    const [createdQuote] = await db
      .insert(quotes)
      .values({
        ...quote,
        developer_id: developerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdQuote;
  }

  async getQuotesByProjectId(projectId: number): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.project_id, projectId));
  }

  async getQuotesByDeveloperId(developerId: number): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.developer_id, developerId));
  }

  async getDeveloperQuoteForProject(developerId: number, projectId: number): Promise<Quote | undefined> {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.developer_id, developerId), eq(quotes.project_id, projectId)));
    return quote;
  }

  async getQuoteById(id: number): Promise<Quote | undefined> {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));
    return quote;
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }

  async rejectOtherQuotes(projectId: number, acceptedQuoteId: number): Promise<void> {
    await db
      .update(quotes)
      .set({
        status: 'rejected',
        updated_at: new Date()
      })
      .where(and(eq(quotes.project_id, projectId), sql`${quotes.id} != ${acceptedQuoteId}`));
  }
}

export const quoteStorage = new QuoteStorage();
