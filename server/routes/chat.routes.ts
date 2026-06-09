import { Router } from "express";
import type { Request, Response } from "express";
import { eq, asc } from "drizzle-orm";
import { storage } from "../storage.js";
import { userStorage } from "../storage/user.js";
import { db } from "../db.js";
import { chatMessages, userPresence, users } from "@shared/schema";
import { isAuthenticated, adminMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Monolith chat routes (REST fallback for local monolith mode).
// Realtime WebSocket events live in server/socket/chat-socket.ts.

router.get("/health", async (_req: Request, res: Response) => {
  res.json({
    success: true,
    mode: "monolith",
    message: "Chat API is served by the main app",
  });
});

/** Admin chat panel — list users with online status */
router.get("/users", isAuthenticated, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { users: allUsers } = await userStorage.getAllUsers({ limit: 1000, offset: 0 });
    const presenceRows = await db.select().from(userPresence);
    const presenceByUserId = new Map(presenceRows.map((p) => [p.user_id, p]));

    const safeUsers = allUsers
      .filter((u) => u.id !== req.user?.id)
      .map((u) => {
        const presence = presenceByUserId.get(u.id);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          is_online: presence?.is_online ?? false,
          last_seen: presence?.last_seen?.toISOString() ?? null,
          created_at: u.created_at?.toISOString?.() ?? u.created_at,
        };
      });

    res.json({ users: safeUsers, total: safeUsers.length });
  } catch (error: unknown) {
    console.error("Error fetching chat users:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    res.status(500).json({ success: false, message });
  }
});

/** Create or return existing 1:1 room */
router.post("/rooms/direct", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.id as number;
    const participantId = Number(req.body.user_id);

    if (!Number.isFinite(participantId) || participantId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid user_id" });
    }

    if (participantId === currentUserId) {
      return res.status(400).json({ success: false, message: "Cannot chat with yourself" });
    }

    const participant = await userStorage.getUser(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let room = await storage.getDirectChatRoom(currentUserId, participantId);
    if (!room) {
      room = await storage.createDirectChatRoom(currentUserId, participantId);
    }

    res.json({ success: true, room });
  } catch (error: unknown) {
    console.error("Error creating direct chat room:", error);
    const message = error instanceof Error ? error.message : "Failed to create chat room";
    res.status(500).json({ success: false, message });
  }
});

async function getMessagesWithSenders(roomId: number) {
  return db
    .select({
      id: chatMessages.id,
      room_id: chatMessages.room_id,
      content: chatMessages.content,
      message_type: chatMessages.message_type,
      status: chatMessages.status,
      created_at: chatMessages.created_at,
      sender: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(chatMessages)
    .innerJoin(users, eq(chatMessages.sender_id, users.id))
    .where(eq(chatMessages.room_id, roomId))
    .orderBy(asc(chatMessages.created_at));
}

/** Messages for a room (admin chat UI path) */
router.get("/rooms/:roomId/messages", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);
    const userId = req.user!.id as number;

    if (!Number.isFinite(roomId)) {
      return res.status(400).json({ success: false, message: "Invalid roomId" });
    }

    const isMember = await storage.isChatRoomMember(roomId, userId);
    if (!isMember && req.user!.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not a room member" });
    }

    const messages = await getMessagesWithSenders(roomId);
    res.json({ success: true, messages });
  } catch (error: unknown) {
    console.error("Error fetching room messages:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch messages";
    res.status(500).json({ success: false, message });
  }
});

// Legacy paths (kept for backward compatibility)
router.get("/rooms/:userId", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid userId",
      });
    }

    const rooms = await storage.getUserChatRooms(userId);
    res.json({
      success: true,
      rooms,
      totalCount: rooms.length,
    });
  } catch (error: unknown) {
    console.error("Error fetching chat rooms:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch chat rooms";
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat rooms",
      message,
    });
  }
});

router.get("/messages/:roomId", async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);
    if (!Number.isFinite(roomId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid roomId",
      });
    }

    const limit = Number(req.query.limit) || 50;
    const before = req.query.before ? Number(req.query.before) : undefined;
    const messages = await storage.getChatMessages(roomId, limit, before);

    res.json({
      success: true,
      messages,
    });
  } catch (error: unknown) {
    console.error("Error fetching chat messages:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch chat messages";
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat messages",
      message,
    });
  }
});

export default router;
