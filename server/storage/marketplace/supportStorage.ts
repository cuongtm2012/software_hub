import { db } from "../../db";
import { supportTickets, type SupportTicket, type InsertSupportTicket } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface ISupportStorage {
  createSupportTicket(ticket: InsertSupportTicket, userId: number): Promise<SupportTicket>;
  getSupportTicketById(id: number): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(params?: { status?: string; limit?: number; offset?: number }): Promise<{ tickets: SupportTicket[], total: number }>;
  updateSupportTicketStatus(id: number, status: string): Promise<SupportTicket | undefined>;
  assignSupportTicket(id: number, assignedTo: number): Promise<SupportTicket | undefined>;
}

export class SupportStorage implements ISupportStorage {
  async createSupportTicket(ticket: InsertSupportTicket, userId: number): Promise<SupportTicket> {
    const [createdTicket] = await db
      .insert(supportTickets)
      .values({
        ...ticket,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdTicket;
  }

  async getSupportTicketById(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));
    return ticket;
  }

  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.user_id, userId));
  }

  async getAllSupportTickets(params?: { status?: string; limit?: number; offset?: number }): Promise<{ tickets: SupportTicket[], total: number }> {
    let whereConditions = [];

    if (params?.status) {
      whereConditions.push(eq(supportTickets.status, params.status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(supportTickets)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult?.count || 0;

    const ticketsList = await db
      .select()
      .from(supportTickets)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { tickets: ticketsList, total };
  }

  async updateSupportTicketStatus(id: number, status: string): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  async assignSupportTicket(id: number, assignedTo: number): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        assigned_to: assignedTo,
        updated_at: new Date()
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }
}

export const supportStorage = new SupportStorage();
