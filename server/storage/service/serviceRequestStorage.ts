import { db } from "../../db";
import { serviceRequests, type ServiceRequest, type InsertServiceRequest } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface IServiceRequestStorage {
  createServiceRequest(request: InsertServiceRequest, clientId: number): Promise<ServiceRequest>;
  getServiceRequestById(id: number): Promise<ServiceRequest | undefined>;
  getAllServiceRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ServiceRequest[], total: number }>;
  getClientServiceRequests(clientId: number, status?: string): Promise<ServiceRequest[]>;
  getProviderServiceRequests(providerId: number, status?: string): Promise<ServiceRequest[]>;
  updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined>;
  assignProviderToServiceRequest(id: number, providerId: number): Promise<ServiceRequest | undefined>;
}

export class ServiceRequestStorage implements IServiceRequestStorage {
  async createServiceRequest(request: InsertServiceRequest, clientId: number): Promise<ServiceRequest> {
    const [createdRequest] = await db
      .insert(serviceRequests)
      .values({
        ...request,
        client_id: clientId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdRequest;
  }

  async getServiceRequestById(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));
    return request;
  }

  async getAllServiceRequests(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ requests: ServiceRequest[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(serviceRequests.status, params.status));
    }

    if (params?.search) {
      whereConditions.push(ilike(serviceRequests.title, `%${params.search}%`));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(serviceRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const requestsList = await db
      .select()
      .from(serviceRequests)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { requests: requestsList, total };
  }

  async getClientServiceRequests(clientId: number, status?: string): Promise<ServiceRequest[]> {
    let whereConditions = [eq(serviceRequests.client_id, clientId)];

    if (status) {
      whereConditions.push(eq(serviceRequests.status, status));
    }

    return await db
      .select()
      .from(serviceRequests)
      .where(and(...whereConditions));
  }

  async getProviderServiceRequests(providerId: number, status?: string): Promise<ServiceRequest[]> {
    let whereConditions = [eq(serviceRequests.provider_id, providerId)];

    if (status) {
      whereConditions.push(eq(serviceRequests.status, status));
    }

    return await db
      .select()
      .from(serviceRequests)
      .where(and(...whereConditions));
  }

  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined> {
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async assignProviderToServiceRequest(id: number, providerId: number): Promise<ServiceRequest | undefined> {
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        provider_id: providerId,
        updated_at: new Date()
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updatedRequest;
  }
}

export const serviceRequestStorage = new ServiceRequestStorage();
