/**
 * External Request Storage Module
 * Handles external project requests from clients
 */

import { db, eq, and, desc, sql, ilike, externalRequests, type ExternalRequest, type InsertExternalRequest } from "../base";

export interface IExternalRequestStorage {
    createExternalRequest(request: InsertExternalRequest): Promise<ExternalRequest>;
    getExternalRequestsByClient(clientId: number, params?: { page?: number; limit?: number; status?: string }): Promise<{ requests: ExternalRequest[], total: number }>;
    getAllExternalRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ExternalRequest[], total: number }>;
    updateExternalRequestStatus(id: number, status: string): Promise<ExternalRequest | undefined>;
    assignDeveloperToExternalRequest(id: number, developerId: number): Promise<ExternalRequest | undefined>;
}

export class ExternalRequestStorage implements IExternalRequestStorage {
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

    async getExternalRequestsByClient(
        clientId: number,
        params?: { page?: number; limit?: number; status?: string }
    ): Promise<{ requests: ExternalRequest[], total: number }> {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const offset = (page - 1) * limit;

        let whereConditions = [eq(externalRequests.client_id, clientId)];

        // Only add status filter if it's not 'all'
        if (params?.status && params.status !== 'all') {
            whereConditions.push(eq(externalRequests.status, params.status as any));
        }

        // Get total count
        const [countResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(externalRequests)
            .where(and(...whereConditions));

        const total = countResult?.count || 0;

        // Get requests list
        const requestsList = await db
            .select()
            .from(externalRequests)
            .where(and(...whereConditions))
            .orderBy(desc(externalRequests.created_at))
            .limit(limit)
            .offset(offset);

        return { requests: requestsList, total };
    }

    async getAllExternalRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ExternalRequest[], total: number }> {
        let whereConditions = [];

        if (params?.status) {
            whereConditions.push(eq(externalRequests.status, params.status as any));
        }

        if (params?.search) {
            whereConditions.push(ilike(externalRequests.name, `%${params.search}%`));
        }

        // Get total count
        const [countResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(externalRequests)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

        const total = countResult?.count || 0;

        // Get requests list
        const requestsList = await db
            .select()
            .from(externalRequests)
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(desc(externalRequests.created_at))
            .limit(params?.limit || 10)
            .offset(params?.offset || 0);

        return { requests: requestsList, total };
    }

    async updateExternalRequestStatus(id: number, status: string): Promise<ExternalRequest | undefined> {
        const [updatedRequest] = await db
            .update(externalRequests)
            .set({
                status: status as any,
                updated_at: new Date()
            })
            .where(eq(externalRequests.id, id))
            .returning();
        return updatedRequest;
    }

    async assignDeveloperToExternalRequest(id: number, developerId: number): Promise<ExternalRequest | undefined> {
        const [updatedRequest] = await db
            .update(externalRequests)
            .set({
                assigned_developer_id: developerId,
                updated_at: new Date()
            })
            .where(eq(externalRequests.id, id))
            .returning();
        return updatedRequest;
    }
}

export const externalRequestStorage = new ExternalRequestStorage();
