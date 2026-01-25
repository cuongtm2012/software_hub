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
