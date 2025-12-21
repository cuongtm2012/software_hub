import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

// ============ Chat Rooms ============

// Get user's chat rooms
router.get("/rooms", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await storage.getUserChatRooms(req.user!.id);
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
});

// Create direct chat room
router.post("/rooms/direct", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { participant_id } = req.body;
    
    if (!participant_id) {
      return res.status(400).json({ message: "Participant ID is required" });
    }
    
    // Check if direct chat already exists
    const existingRoom = await storage.getDirectChatRoom(req.user!.id, participant_id);
    
    if (existingRoom) {
      return res.json({ room: existingRoom });
    }
    
    // Create new direct chat room
    const room = await storage.createDirectChatRoom(req.user!.id, participant_id);
    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
});

// Create group chat room
router.post("/rooms/group", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, participant_ids } = req.body;
    
    if (!name || !participant_ids || !Array.isArray(participant_ids)) {
      return res.status(400).json({ message: "Name and participant IDs are required" });
    }
    
    const room = await storage.createGroupChatRoom(name, req.user!.id, participant_ids);
    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
});

// Get chat room details
router.get("/rooms/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const room = await storage.getChatRoomById(parseInt(id));
    
    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }
    
    // Check if user is a member
    const isMember = await storage.isChatRoomMember(parseInt(id), req.user!.id);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this chat room" });
    }
    
    res.json({ room });
  } catch (error) {
    next(error);
  }
});

// ============ Chat Messages ============

// Get messages for a chat room
router.get("/rooms/:id/messages", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { limit = "50", before } = req.query;
    
    // Check if user is a member
    const isMember = await storage.isChatRoomMember(parseInt(id), req.user!.id);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this chat room" });
    }
    
    const messages = await storage.getChatMessages(
      parseInt(id),
      parseInt(limit as string),
      before ? parseInt(before as string) : undefined
    );
    
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

// Send message to chat room
router.post("/rooms/:id/messages", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content, message_type = "text" } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    // Check if user is a member
    const isMember = await storage.isChatRoomMember(parseInt(id), req.user!.id);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this chat room" });
    }
    
    const message = await storage.createChatMessage({
      room_id: parseInt(id),
      sender_id: req.user!.id,
      content,
      message_type
    });
    
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

// Mark messages as read
router.post("/rooms/:id/read", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await storage.markMessagesAsRead(parseInt(id), req.user!.id);
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    next(error);
  }
});

// ============ User Presence ============

// Update user presence
router.post("/presence", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status = "online" } = req.body;
    
    await storage.updateUserPresence(req.user!.id, status);
    res.json({ message: "Presence updated" });
  } catch (error) {
    next(error);
  }
});

// Get online users
router.get("/online-users", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await storage.getOnlineUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

export default router;
