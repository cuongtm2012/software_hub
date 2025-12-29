import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

const router = Router();

// ==========================================
// CHAT ROUTES REMOVED - USE WEBSOCKET ONLY
// ==========================================
// Chat functionality is now handled entirely via WebSocket
// Client should connect directly to Chat Service at ws://localhost:3002
// 
// No REST API proxy needed - Chat Service is WebSocket-only
// ==========================================

// Health check endpoint to verify chat service is accessible
router.get('/health', async (req: Request, res: Response) => {
  try {
    const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3002';
    const response = await fetch(`${CHAT_SERVICE_URL}/health`);
    const data = await response.json();

    res.json({
      success: true,
      chatService: data,
      message: 'Chat service is reachable. Use WebSocket for chat functionality.'
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      error: 'Chat service unavailable',
      message: error.message
    });
  }
});

// Get user's chat rooms
router.get('/rooms/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3002';

    const response = await fetch(`${CHAT_SERVICE_URL}/api/chat/rooms/${userId}`);

    if (!response.ok) {
      throw new Error(`Chat service returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat rooms',
      message: error.message
    });
  }
});

export default router;
