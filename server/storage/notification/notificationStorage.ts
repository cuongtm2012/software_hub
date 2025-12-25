import { db } from "../../db";
import { notifications, type Notification, type InsertNotification } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface INotificationStorage {
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number, params?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<{ notifications: Notification[], total: number }>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  markNotificationAsRead(id: number, userId: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number, userId: number): Promise<boolean>;
}

export class NotificationStorage implements INotificationStorage {
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [createdNotification] = await db
      .insert(notifications)
      .values({
        ...notification,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdNotification;
  }

  async getUserNotifications(userId: number, params?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<{ notifications: Notification[], total: number }> {
    let whereConditions = [eq(notifications.user_id, userId)];

    if (params?.unreadOnly) {
      whereConditions.push(eq(notifications.is_read, false));
    }

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(...whereConditions));

    const total = countResult?.count || 0;

    const notificationsList = await db
      .select()
      .from(notifications)
      .where(and(...whereConditions))
      .limit(params?.limit || 10)
      .offset(params?.offset || 0);

    return { notifications: notificationsList, total };
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const [result] = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(notifications)
      .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)));
    return result.count;
  }

  async markNotificationAsRead(id: number, userId: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({
        is_read: true,
        updated_at: new Date()
      })
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)))
      .returning();
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({
        is_read: true,
        updated_at: new Date()
      })
      .where(eq(notifications.user_id, userId));
    return result.rowCount > 0;
  }

  async deleteNotification(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)));
    return result.rowCount > 0;
  }
}

export const notificationStorage = new NotificationStorage();
