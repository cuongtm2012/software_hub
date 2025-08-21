#!/bin/bash

# Project module - project storage
cat > server/storage/project/projectStorage.ts << 'EOF'
import { db } from "../../db";
import { externalRequests, type ExternalRequest, type InsertExternalRequest } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface IProjectStorage {
  createExternalRequest(request: InsertExternalRequest): Promise<ExternalRequest>;
  getExternalRequests(status?: string, limit?: number, offset?: number): Promise<{ requests: ExternalRequest[], total: number }>;
  getExternalRequestById(id: number): Promise<ExternalRequest | undefined>;
  updateExternalRequestStatus(id: number, status: string): Promise<ExternalRequest | undefined>;
  convertExternalRequestToProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest>;
  getAllExternalRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ExternalRequest[], total: number }>;
  assignDeveloperToExternalRequest(id: number, developerId: number): Promise<ExternalRequest | undefined>;
  getUserExternalRequests(email: string): Promise<ExternalRequest[]>;
  getAvailableProjects(status?: string): Promise<ExternalRequest[]>;
  getAllProjects(status?: string): Promise<ExternalRequest[]>;
  getClientProjects(clientId: number, status?: string): Promise<ExternalRequest[]>;
  getDeveloperProjects(developerId: number, status?: string): Promise<ExternalRequest[]>;
  getProjectsCount(status?: string): Promise<{ count: number }>;
  createProject(project: InsertExternalRequest, clientId?: number): Promise<ExternalRequest>;
  getProjectById(id: number): Promise<ExternalRequest | undefined>;
  getProjectsByClientId(clientId: number): Promise<ExternalRequest[]>;
  getProjectsForDevelopers(status?: string, limit?: number, offset?: number): Promise<{ projects: ExternalRequest[], total: number }>;
  updateProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest | undefined>;
  updateProjectStatus(id: number, status: string): Promise<ExternalRequest | undefined>;
}

export class ProjectStorage implements IProjectStorage {
  async createExternalRequest(request: InsertExternalRequest): Promise<ExternalRequest> {
    const [createdRequest] = await db
      .insert(externalRequests)
      .values({
        ...request,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdRequest;
  }

  async getExternalRequests(status?: string, limit?: number, offset?: number): Promise<{ requests: ExternalRequest[], total: number }> {
    let whereConditions = [];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(externalRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const requestsList = await db
      .select()
      .from(externalRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit || 10)
      .offset(offset || 0);

    return { requests: requestsList, total };
  }

  async getExternalRequestById(id: number): Promise<ExternalRequest | undefined> {
    const [request] = await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.id, id));
    return request;
  }

  async updateExternalRequestStatus(id: number, status: string): Promise<ExternalRequest | undefined> {
    const [updatedRequest] = await db
      .update(externalRequests)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async convertExternalRequestToProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest> {
    const [updatedRequest] = await db
      .update(externalRequests)
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getAllExternalRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ExternalRequest[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(externalRequests.status, params.status));
    }

    if (params?.search) {
      whereConditions.push(ilike(externalRequests.title, `%${params.search}%`));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(externalRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const requestsList = await db
      .select()
      .from(externalRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { requests: requestsList, total };
  }

  async assignDeveloperToExternalRequest(id: number, developerId: number): Promise<ExternalRequest | undefined> {
    const [updatedRequest] = await db
      .update(externalRequests)
      .set({
        developer_id: developerId,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getUserExternalRequests(email: string): Promise<ExternalRequest[]> {
    return await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.client_email, email));
  }

  async getAvailableProjects(status?: string): Promise<ExternalRequest[]> {
    let whereConditions = [eq(externalRequests.type, 'project')];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    return await db
      .select()
      .from(externalRequests)
      .where(and(...whereConditions));
  }

  async getAllProjects(status?: string): Promise<ExternalRequest[]> {
    let whereConditions = [eq(externalRequests.type, 'project')];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    return await db
      .select()
      .from(externalRequests)
      .where(and(...whereConditions));
  }

  async getClientProjects(clientId: number, status?: string): Promise<ExternalRequest[]> {
    let whereConditions = [eq(externalRequests.client_id, clientId)];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    return await db
      .select()
      .from(externalRequests)
      .where(and(...whereConditions));
  }

  async getDeveloperProjects(developerId: number, status?: string): Promise<ExternalRequest[]> {
    let whereConditions = [eq(externalRequests.developer_id, developerId)];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    return await db
      .select()
      .from(externalRequests)
      .where(and(...whereConditions));
  }

  async getProjectsCount(status?: string): Promise<{ count: number }> {
    let whereConditions = [eq(externalRequests.type, 'project')];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    const [result] = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(externalRequests)
      .where(and(...whereConditions));

    return result;
  }

  async createProject(project: InsertExternalRequest, clientId?: number): Promise<ExternalRequest> {
    const [createdProject] = await db
      .insert(externalRequests)
      .values({
        ...project,
        client_id: clientId,
        type: 'project',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdProject;
  }

  async getProjectById(id: number): Promise<ExternalRequest | undefined> {
    const [project] = await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.id, id));
    return project;
  }

  async getProjectsByClientId(clientId: number): Promise<ExternalRequest[]> {
    return await db
      .select()
      .from(externalRequests)
      .where(eq(externalRequests.client_id, clientId));
  }

  async getProjectsForDevelopers(status?: string, limit?: number, offset?: number): Promise<{ projects: ExternalRequest[], total: number }> {
    let whereConditions = [eq(externalRequests.type, 'project')];

    if (status) {
      whereConditions.push(eq(externalRequests.status, status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(externalRequests)
      .where(and(...whereConditions));

    const total = countResult?.count || 0;

    const projectsList = await db
      .select()
      .from(externalRequests)
      .where(and(...whereConditions))
      .limit(limit || 10)
      .offset(offset || 0);

    return { projects: projectsList, total };
  }

  async updateProject(id: number, updates: Partial<InsertExternalRequest>): Promise<ExternalRequest | undefined> {
    const [updatedProject] = await db
      .update(externalRequests)
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedProject;
  }

  async updateProjectStatus(id: number, status: string): Promise<ExternalRequest | undefined> {
    const [updatedProject] = await db
      .update(externalRequests)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(externalRequests.id, id))
      .returning();
    return updatedProject;
  }
}

export const projectStorage = new ProjectStorage();
EOF

# Project module - quote storage
cat > server/storage/project/quoteStorage.ts << 'EOF'
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
EOF

# Project module - message storage
cat > server/storage/project/messageStorage.ts << 'EOF'
import { db } from "../../db";
import { messages, type Message, type InsertMessage } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IMessageStorage {
  sendMessage(message: InsertMessage, senderId: number): Promise<Message>;
  getMessagesByProjectId(projectId: number): Promise<Message[]>;
}

export class MessageStorage implements IMessageStorage {
  async sendMessage(message: InsertMessage, senderId: number): Promise<Message> {
    const [createdMessage] = await db
      .insert(messages)
      .values({
        ...message,
        sender_id: senderId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdMessage;
  }

  async getMessagesByProjectId(projectId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.project_id, projectId));
  }
}

export const messageStorage = new MessageStorage();
EOF

# Project module index
cat > server/storage/project/index.ts << 'EOF'
export * from './projectStorage';
export * from './quoteStorage';
export * from './messageStorage';
EOF

echo "✅ Project modules created"

