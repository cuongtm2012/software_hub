import { db } from "../../db";
import { serviceQuotations, type ServiceQuotation, type InsertServiceQuotation } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IServiceQuotationStorage {
  createServiceQuotation(quotation: InsertServiceQuotation, providerId: number): Promise<ServiceQuotation>;
  getServiceQuotationById(id: number): Promise<ServiceQuotation | undefined>;
  getQuotationsByServiceRequestId(serviceRequestId: number): Promise<ServiceQuotation[]>;
  getProviderQuotations(providerId: number): Promise<ServiceQuotation[]>;
  updateQuotationStatus(id: number, status: string): Promise<ServiceQuotation | undefined>;
}

export class ServiceQuotationStorage implements IServiceQuotationStorage {
  async createServiceQuotation(quotation: InsertServiceQuotation, providerId: number): Promise<ServiceQuotation> {
    const [createdQuotation] = await db
      .insert(serviceQuotations)
      .values({
        ...quotation,
        provider_id: providerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdQuotation;
  }

  async getServiceQuotationById(id: number): Promise<ServiceQuotation | undefined> {
    const [quotation] = await db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.id, id));
    return quotation;
  }

  async getQuotationsByServiceRequestId(serviceRequestId: number): Promise<ServiceQuotation[]> {
    return await db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.service_request_id, serviceRequestId));
  }

  async getProviderQuotations(providerId: number): Promise<ServiceQuotation[]> {
    return await db
      .select()
      .from(serviceQuotations)
      .where(eq(serviceQuotations.provider_id, providerId));
  }

  async updateQuotationStatus(id: number, status: string): Promise<ServiceQuotation | undefined> {
    const [updatedQuotation] = await db
      .update(serviceQuotations)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(serviceQuotations.id, id))
      .returning();
    return updatedQuotation;
  }
}

export const serviceQuotationStorage = new ServiceQuotationStorage();
