import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage.js";

const router = Router();

// Monolith chat routes (REST fallback for local monolith mode).
// NOTE: Realtime WebSocket events are still optional; these endpoints
// allow the chat UI to function without external chat microservice.

router.get('/health', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    mode: "monolith",
    message: "Chat API is served by the main app"
  });
});

// Get user's chat rooms
router.get('/rooms/:userId', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid userId"
      });
    }

    const rooms = await storage.getUserChatRooms(userId);
    res.json({
      success: true,
      rooms,
      totalCount: rooms.length
    });
  } catch (error: any) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat rooms',
      message: error.message
    });
  }
});

// Get room messages
router.get('/messages/:roomId', async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);
    if (!Number.isFinite(roomId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid roomId"
      });
    }

    const limit = Number(req.query.limit) || 50;
    const before = req.query.before ? Number(req.query.before) : undefined;
    const messages = await storage.getChatMessages(roomId, limit, before);

    res.json({
      success: true,
      messages
    });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat messages',
      message: error.message
    });
  }
});

export default router;
