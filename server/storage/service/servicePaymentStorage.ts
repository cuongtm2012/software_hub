import { db } from "../../db";
import { servicePayments, type ServicePayment, type InsertServicePayment } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IServicePaymentStorage {
  createServicePayment(payment: InsertServicePayment): Promise<ServicePayment>;
  getServicePaymentById(id: number): Promise<ServicePayment | undefined>;
  getPaymentsByServiceProjectId(serviceProjectId: number): Promise<ServicePayment[]>;
  updateServicePaymentStatus(id: number, status: string): Promise<ServicePayment | undefined>;
}

export class ServicePaymentStorage implements IServicePaymentStorage {
  async createServicePayment(payment: InsertServicePayment): Promise<ServicePayment> {
    const [createdPayment] = await db
      .insert(servicePayments)
      .values({
        ...payment,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdPayment;
  }

  async getServicePaymentById(id: number): Promise<ServicePayment | undefined> {
    const [payment] = await db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.id, id));
    return payment;
  }

  async getPaymentsByServiceProjectId(serviceProjectId: number): Promise<ServicePayment[]> {
    return await db
      .select()
      .from(servicePayments)
      .where(eq(servicePayments.service_project_id, serviceProjectId));
  }

  async updateServicePaymentStatus(id: number, status: string): Promise<ServicePayment | undefined> {
    const [updatedPayment] = await db
      .update(servicePayments)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(servicePayments.id, id))
      .returning();
    return updatedPayment;
  }
}

export const servicePaymentStorage = new ServicePaymentStorage();
