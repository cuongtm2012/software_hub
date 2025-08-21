#!/bin/bash

# Create all storage module files

# Software module - review storage
cat > server/storage/software/reviewStorage.ts << 'EOF'
import { db } from "../../db";
import { reviews, type Review, type InsertReview } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IReviewStorage {
  createReview(review: InsertReview, userId: number): Promise<Review>;
  getReviewsBySoftwareId(softwareId: number): Promise<Review[]>;
  getSoftwareReviews(softwareId: number): Promise<Review[]>;
  getUserReviewForSoftware(userId: number, softwareId: number): Promise<Review | undefined>;
  getReviewById(id: number): Promise<Review | undefined>;
  deleteReview(id: number, userId: number): Promise<boolean>;
  getUserReviews(userId: number): Promise<Review[]>;
  updateReview(id: number, userId: number, reviewData: Partial<InsertReview>): Promise<Review | undefined>;
}

export class ReviewStorage implements IReviewStorage {
  async createReview(review: InsertReview, userId: number): Promise<Review> {
    const [createdReview] = await db
      .insert(reviews)
      .values({
        ...review,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return createdReview;
  }

  async getReviewsBySoftwareId(softwareId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.software_id, softwareId));
  }

  async getSoftwareReviews(softwareId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.software_id, softwareId));
  }

  async getUserReviewForSoftware(userId: number, softwareId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.user_id, userId), eq(reviews.software_id, softwareId)));
    return review;
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async deleteReview(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.user_id, userId)));
    return result.rowCount > 0;
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, userId));
  }

  async updateReview(id: number, userId: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set(reviewData)
      .where(and(eq(reviews.id, id), eq(reviews.user_id, userId)))
      .returning();
    return updatedReview;
  }
}

export const reviewStorage = new ReviewStorage();
EOF

# Software module - category storage
cat > server/storage/software/categoryStorage.ts << 'EOF'
import { db } from "../../db";
import { categories, type Category, type InsertCategory } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface ICategoryStorage {
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
}

export class CategoryStorage implements ICategoryStorage {
  async createCategory(category: InsertCategory): Promise<Category> {
    const [createdCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return createdCategory;
  }

  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }
}

export const categoryStorage = new CategoryStorage();
EOF

# Software module - index
cat > server/storage/software/index.ts << 'EOF'
export * from './softwareStorage';
export * from './reviewStorage';
export * from './categoryStorage';
EOF

echo "✅ Software modules created"

# Chat module
cat > server/storage/chat/chatStorage.ts << 'EOF'
import { db } from "../../db";
import { chatRooms, chatRoomMembers, chatMessages, userPresence, users, type ChatRoom, type InsertChatRoom, type ChatMessage, type InsertChatMessage, type User } from "@shared/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface IChatStorage {
  getUserChatRooms(userId: number): Promise<ChatRoom[]>;
  getChatRoomById(roomId: number): Promise<ChatRoom | undefined>;
  createDirectChatRoom(userId: number, participantId: number): Promise<ChatRoom>;
  getDirectChatRoom(userId: number, participantId: number): Promise<ChatRoom | undefined>;
  createGroupChatRoom(name: string, creatorId: number, participantIds: number[]): Promise<ChatRoom>;
  isChatRoomMember(roomId: number, userId: number): Promise<boolean>;
  getChatMessages(roomId: number, limit?: number, before?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(roomId: number, userId: number): Promise<void>;
  updateUserPresence(userId: number, status: string): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
}

export class ChatStorage implements IChatStorage {
  async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    const rooms = await db
      .select({
        room: chatRooms,
      })
      .from(chatRoomMembers)
      .innerJoin(chatRooms, eq(chatRoomMembers.room_id, chatRooms.id))
      .where(eq(chatRoomMembers.user_id, userId))
      .orderBy(desc(chatRooms.updated_at));
    
    return rooms.map(r => r.room);
  }

  async getChatRoomById(roomId: number): Promise<ChatRoom | undefined> {
    const [room] = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.id, roomId));
    return room;
  }

  async createDirectChatRoom(userId: number, participantId: number): Promise<ChatRoom> {
    return await db.transaction(async (tx) => {
      const [room] = await tx
        .insert(chatRooms)
        .values({
          type: 'direct',
          created_by: userId,
        })
        .returning();

      await tx.insert(chatRoomMembers).values([
        { room_id: room.id, user_id: userId },
        { room_id: room.id, user_id: participantId }
      ]);

      return room;
    });
  }

  async getDirectChatRoom(userId: number, participantId: number): Promise<ChatRoom | undefined> {
    const rooms = await db
      .select({
        room: chatRooms,
        memberCount: sql<number>`COUNT(DISTINCT ${chatRoomMembers.user_id})`.as('member_count')
      })
      .from(chatRooms)
      .innerJoin(chatRoomMembers, eq(chatRooms.id, chatRoomMembers.room_id))
      .where(
        and(
          eq(chatRooms.type, 'direct'),
          inArray(chatRoomMembers.user_id, [userId, participantId])
        )
      )
      .groupBy(chatRooms.id)
      .having(sql`COUNT(DISTINCT ${chatRoomMembers.user_id}) = 2`);

    return rooms[0]?.room;
  }

  async createGroupChatRoom(name: string, creatorId: number, participantIds: number[]): Promise<ChatRoom> {
    return await db.transaction(async (tx) => {
      const [room] = await tx
        .insert(chatRooms)
        .values({
          type: 'group',
          name,
          created_by: creatorId,
        })
        .returning();

      const allMembers = [creatorId, ...participantIds];
      const uniqueMembers = Array.from(new Set(allMembers));
      
      await tx.insert(chatRoomMembers).values(
        uniqueMembers.map(userId => ({
          room_id: room.id,
          user_id: userId
        }))
      );

      return room;
    });
  }

  async isChatRoomMember(roomId: number, userId: number): Promise<boolean> {
    const [member] = await db
      .select()
      .from(chatRoomMembers)
      .where(
        and(
          eq(chatRoomMembers.room_id, roomId),
          eq(chatRoomMembers.user_id, userId)
        )
      );
    return !!member;
  }

  async getChatMessages(roomId: number, limit: number = 50, before?: number): Promise<ChatMessage[]> {
    let query = db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.room_id, roomId));

    if (before) {
      query = db
        .select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.room_id, roomId),
            sql`${chatMessages.id} < ${before}`
          )
        );
    }

    const messages = await query
      .orderBy(desc(chatMessages.created_at))
      .limit(limit);

    return messages.reverse();
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [createdMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();

    await db
      .update(chatRooms)
      .set({ updated_at: new Date() })
      .where(eq(chatRooms.id, message.room_id));

    return createdMessage;
  }

  async markMessagesAsRead(roomId: number, userId: number): Promise<void> {
    await db
      .update(chatMessages)
      .set({ status: 'read' })
      .where(
        and(
          eq(chatMessages.room_id, roomId),
          sql`${chatMessages.sender_id} != ${userId}`,
          sql`${chatMessages.status} != 'read'`
        )
      );
  }

  async updateUserPresence(userId: number, status: string): Promise<void> {
    const isOnline = status === 'online';
    
    const [existing] = await db
      .select()
      .from(userPresence)
      .where(eq(userPresence.user_id, userId));

    if (existing) {
      await db
        .update(userPresence)
        .set({
          is_online: isOnline,
          last_seen: new Date()
        })
        .where(eq(userPresence.user_id, userId));
    } else {
      await db
        .insert(userPresence)
        .values({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date()
        });
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    const onlineUsers = await db
      .select({
        user: users
      })
      .from(users)
      .innerJoin(userPresence, eq(users.id, userPresence.user_id))
      .where(eq(userPresence.is_online, true));

    return onlineUsers.map(u => u.user);
  }
}

export const chatStorage = new ChatStorage();
EOF

cat > server/storage/chat/index.ts << 'EOF'
export * from './chatStorage';
EOF

echo "✅ Chat modules created"

# Notification module
cat > server/storage/notification/notificationStorage.ts << 'EOF'
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
EOF

cat > server/storage/notification/index.ts << 'EOF'
export * from './notificationStorage';
EOF

echo "✅ Notification modules created"
echo "✅ All core modules created successfully!"

