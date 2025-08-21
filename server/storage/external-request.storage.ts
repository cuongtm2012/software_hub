import { db } from '../db';
import { externalRequests, quotes, type ExternalRequest, type InsertExternalRequest, type Quote, type InsertQuote } from '@shared/schema';
import { eq, and, desc, sql, ilike, gte } from 'drizzle-orm';

/**
 * External Request Storage - Admin Methods
 * 
 * This module contains admin-specific methods for managing external requests.
 * Client-side methods remain in the main storage.ts file.
 */

export class ExternalRequestStorage {
    /**
     * Get all external requests with filters (Admin only)
     */
    async getAllExternalRequestsForAdmin(params?: {
        status?: string;
        priority?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{ requests: ExternalRequest[], total: number }> {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const offset = (page - 1) * limit;

        let whereConditions = [];

        // Status filter
        if (params?.status && params.status !== 'all') {
            whereConditions.push(eq(externalRequests.status, params.status as any));
        }

        // Priority filter
        if (params?.priority && params.priority !== 'all') {
            whereConditions.push(eq(externalRequests.priority, params.priority));
        }

        // Search by name or email
        if (params?.search) {
            whereConditions.push(
                sql`(${externalRequests.name} ILIKE ${`%${params.search}%`} OR ${externalRequests.email} ILIKE ${`%${params.search}%`})`
            );
        }

        // Get total count
        const [countResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(externalRequests)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

        const total = Number(countResult?.count) || 0;

        // Get requests list
        const requestsList = await db
            .select()
            .from(externalRequests)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(desc(externalRequests.created_at))
            .limit(limit)
            .offset(offset);

        return { requests: requestsList, total };
    }

    /**
     * Update external request (Admin only)
     * Can update status, priority, and admin_notes
     */
    async updateExternalRequest(
        id: number,
        data: {
            status?: string;
            priority?: string;
            admin_notes?: string;
        }
    ): Promise<ExternalRequest | undefined> {
        const [updatedRequest] = await db
            .update(externalRequests)
            .set({
                ...data,
                updated_at: new Date()
            })
            .where(eq(externalRequests.id, id))
            .returning();

        return updatedRequest;
    }

    /**
     * Add admin notes to external request
     */
    async addAdminNotes(id: number, notes: string): Promise<ExternalRequest | undefined> {
        // Get current notes
        const [currentRequest] = await db
            .select()
            .from(externalRequests)
            .where(eq(externalRequests.id, id));

        if (!currentRequest) {
            return undefined;
        }

        // Append new notes with timestamp
        const timestamp = new Date().toISOString();
        const newNotes = currentRequest.admin_notes
            ? `${currentRequest.admin_notes}\n\n[${timestamp}]\n${notes}`
            : `[${timestamp}]\n${notes}`;

        const [updatedRequest] = await db
            .update(externalRequests)
            .set({
                admin_notes: newNotes,
                updated_at: new Date()
            })
            .where(eq(externalRequests.id, id))
            .returning();

        return updatedRequest;
    }

    /**
     * Get statistics for admin dashboard
     */
    async getRequestStatistics(): Promise<{
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
    }> {
        // Total count
        const [totalResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(externalRequests);

        // Pending count
        const [pendingResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(externalRequests)
            .where(eq(externalRequests.status, 'pending'));

        // In progress count
        const [inProgressResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(externalRequests)
            .where(eq(externalRequests.status, 'in_progress'));

        // Completed count
        const [completedResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(externalRequests)
            .where(eq(externalRequests.status, 'completed'));

        return {
            total: Number(totalResult?.count) || 0,
            pending: Number(pendingResult?.count) || 0,
            in_progress: Number(inProgressResult?.count) || 0,
            completed: Number(completedResult?.count) || 0
        };
    }

    /**
     * Create quote for external request (Admin only)
     */
    async createQuoteForRequest(
        requestId: number,
        quote: {
            title: string;
            description: string;
            deliverables: string[];
            total_price: number;
            deposit_amount: number;
            timeline_days: number;
            terms_conditions?: string;
            admin_id: number;
        }
    ): Promise<Quote> {
        const [createdQuote] = await db
            .insert(quotes)
            .values({
                project_id: requestId,
                developer_id: quote.admin_id,
                title: quote.title,
                description: quote.description,
                price: quote.total_price.toString(),
                timeline: `${quote.timeline_days} days`, // Legacy field
                timeline_days: quote.timeline_days,
                deliverables: quote.deliverables,
                deposit_amount: quote.deposit_amount.toString(),
                terms_conditions: quote.terms_conditions,
                status: 'pending',
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning();

        return createdQuote;
    }

    /**
     * Get quotes for a specific external request
     */
    async getQuotesByRequestId(requestId: number): Promise<Quote[]> {
        const quotesList = await db
            .select()
            .from(quotes)
            .where(eq(quotes.project_id, requestId))
            .orderBy(desc(quotes.created_at));

        return quotesList;
    }
}

// Export singleton instance
export const externalRequestStorage = new ExternalRequestStorage();
