import { db } from "../../db";
import { payments, type Payment, type InsertPayment } from "@shared/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export interface IPaymentStorage {
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPaymentsByOrderId(orderId: number): Promise<Payment[]>;
  getAllPayments(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ payments: Payment[], total: number }>;
  getClientPayments(clientId: number): Promise<Payment[]>;
  getDeveloperPayments(developerId: number): Promise<Payment[]>;
  getBuyerPayments(buyerId: number): Promise<Payment[]>;
  getSellerPayments(sellerId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  releaseEscrow(id: number, buyerId: number): Promise<Payment | undefined>;
}

export class PaymentStorage implements IPaymentStorage {
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [createdPayment] = await db
      .insert(payments)
      .values({
        ...payment,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdPayment;
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.order_id, orderId));
  }

  async getAllPayments(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ payments: Payment[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(payments.status, params.status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(payments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const paymentsList = await db
      .select()
      .from(payments)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { payments: paymentsList, total };
  }

  async getClientPayments(clientId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payer_id, clientId));
  }

  async getDeveloperPayments(developerId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payee_id, developerId));
  }

  async getBuyerPayments(buyerId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payer_id, buyerId));
  }

  async getSellerPayments(sellerId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.payee_id, sellerId));
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async releaseEscrow(id: number, buyerId: number): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status: 'released',
        updated_at: new Date()
      })
      .where(and(eq(payments.id, id), eq(payments.payer_id, buyerId)))
      .returning();
    return updatedPayment;
  }
}

export const paymentStorage = new PaymentStorage();
