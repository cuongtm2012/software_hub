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
