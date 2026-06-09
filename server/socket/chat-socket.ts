import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { storage } from "../storage.js";

type AuthPayload = {
  userId: number | string;
  userName?: string;
  userRole?: string;
};

type CreateRoomPayload = {
  participants?: Array<number | string>;
  type?: "direct" | "group";
  name?: string;
};

type SendMessagePayload = {
  roomId: number | string;
  message: string;
  type?: "text" | "file" | "system";
};

const connectedUsers = new Map<string, string>(); // socketId -> userId

function toNumber(value: number | string | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapRoom(room: any) {
  return {
    _id: String(room.id),
    type: room.type,
    name: room.name || "Chat Room",
    description: room.description || "",
    participants: [],
    createdAt: room.created_at,
  };
}

function mapMessage(message: any, senderName = "User") {
  return {
    _id: String(message.id),
    roomId: String(message.room_id),
    senderId: String(message.sender_id),
    senderName,
    message: message.content || "",
    type: message.type || "text",
    timestamp: message.created_at,
  };
}

async function mapMessageForAdminUi(message: any) {
  const sender = await storage.getUser(message.sender_id);
  const fallback = {
    id: message.sender_id,
    name: "User",
    email: "",
    role: "user",
  };
  return {
    id: message.id,
    room_id: message.room_id,
    content: message.content,
    message_type: message.message_type || message.type || "text",
    status: message.status || "sent",
    created_at: message.created_at,
    sender: sender
      ? { id: sender.id, name: sender.name, email: sender.email, role: sender.role }
      : fallback,
  };
}

function broadcastOnlineUsers(io: SocketIOServer) {
  const users = Array.from(new Set(connectedUsers.values()));
  io.emit("online-users-list", { users });
}

export function initializeChatSocket(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    socket.on("authenticate", async (payload: AuthPayload) => {
      const userId = toNumber(payload?.userId);
      if (!userId) {
        socket.emit("auth_error", { message: "Invalid userId" });
        socket.emit("authentication-failed", { message: "Invalid userId" });
        return;
      }

      connectedUsers.set(socket.id, String(userId));
      socket.data.userId = userId;

      await storage.updateUserPresence(userId, "online");
      socket.emit("authenticated", { userId: String(userId), success: true });
      io.emit("user-online", { userId: String(userId) });
      broadcastOnlineUsers(io);
    });

    const handleJoinRoom = async (
      socket: Socket,
      roomId: number | string,
      emitJoinedRoom = false,
    ) => {
      const userId = toNumber(socket.data.userId);
      const parsedRoomId = toNumber(roomId);
      if (!userId || !parsedRoomId) return;

      const isMember = await storage.isChatRoomMember(parsedRoomId, userId);
      if (!isMember) {
        socket.emit("error", { message: "Not a room member" });
        return;
      }

      socket.join(`room:${parsedRoomId}`);
      const room = await storage.getChatRoomById(parsedRoomId);
      const messages = await storage.getChatMessages(parsedRoomId, 50);

      socket.emit("room-joined", {
        room: room ? mapRoom(room) : null,
        messages: messages.map((m) => mapMessage(m, String(m.sender_id))),
      });
      socket.emit("chat-history", {
        roomId: String(parsedRoomId),
        messages: messages.map((m) => mapMessage(m, String(m.sender_id))),
      });

      if (emitJoinedRoom) {
        socket.emit("joined_room", { roomId: parsedRoomId });
      }
    };

    const handleSendMessage = async (
      socket: Socket,
      io: SocketIOServer,
      payload: { roomId: number | string; message?: string; content?: string; messageType?: string; type?: string },
      emitAdminShape = false,
    ) => {
      const userId = toNumber(socket.data.userId);
      const roomId = toNumber(payload.roomId);
      const text = (payload.message || payload.content || "").trim();
      if (!userId || !roomId || !text) return;

      const isMember = await storage.isChatRoomMember(roomId, userId);
      if (!isMember) {
        socket.emit("error", { message: "Not a room member" });
        return;
      }

      const saved = await storage.createChatMessage({
        room_id: roomId,
        sender_id: userId,
        content: text,
        message_type: payload.messageType || payload.type || "text",
        status: "sent",
      } as any);

      const outbound = mapMessage(saved, String(userId));
      io.to(`room:${roomId}`).emit("new-message", outbound);

      if (emitAdminShape) {
        const adminMessage = await mapMessageForAdminUi(saved);
        io.to(`room:${roomId}`).emit("new_message", adminMessage);
      }

      socket.emit("message-sent", { id: outbound._id });
    };

    socket.on("create-room", async (payload: CreateRoomPayload) => {
      try {
        const userId = toNumber(socket.data.userId);
        if (!userId) return socket.emit("error", { message: "Unauthenticated" });

        const participantIds = (payload.participants || [])
          .map((id) => toNumber(id))
          .filter((id): id is number => id !== null && id !== userId);

        let room;
        if ((payload.type || "direct") === "direct" && participantIds.length > 0) {
          room = await storage.getDirectChatRoom(userId, participantIds[0]);
          if (!room) {
            room = await storage.createDirectChatRoom(userId, participantIds[0]);
          }
        } else {
          room = await storage.createGroupChatRoom(
            payload.name || "Chat Room",
            userId,
            participantIds,
          );
        }

        socket.emit("room-create-success", { room: mapRoom(room) });
      } catch (error: any) {
        socket.emit("error", { message: error?.message || "Failed to create room" });
      }
    });

    socket.on("join-room", async ({ roomId }: { roomId: number | string }) => {
      await handleJoinRoom(socket, roomId, false);
    });

    socket.on("join_room", async ({ roomId }: { roomId: number | string }) => {
      await handleJoinRoom(socket, roomId, true);
    });

    socket.on("leave-room", ({ roomId }: { roomId: number | string }) => {
      const parsedRoomId = toNumber(roomId);
      if (!parsedRoomId) return;
      socket.leave(`room:${parsedRoomId}`);
    });

    socket.on("send-message", async (payload: SendMessagePayload) => {
      try {
        await handleSendMessage(socket, io, payload, false);
      } catch (error: any) {
        socket.emit("error", { message: error?.message || "Failed to send message" });
      }
    });

    socket.on("send_message", async (payload: {
      roomId: number | string;
      content?: string;
      message?: string;
      messageType?: string;
    }) => {
      try {
        await handleSendMessage(socket, io, payload, true);
      } catch (error: any) {
        socket.emit("error", { message: error?.message || "Failed to send message" });
      }
    });

    socket.on("typing", ({ roomId, isTyping }: { roomId: number | string; isTyping: boolean }) => {
      const userId = toNumber(socket.data.userId);
      const parsedRoomId = toNumber(roomId);
      if (!userId || !parsedRoomId) return;

      socket.to(`room:${parsedRoomId}`).emit("user_typing", { userId, isTyping });

      if (isTyping) {
        socket.to(`room:${parsedRoomId}`).emit("typing-start", {
          userId: String(userId),
          roomId: String(parsedRoomId),
        });
      } else {
        socket.to(`room:${parsedRoomId}`).emit("typing-stop", {
          userId: String(userId),
          roomId: String(parsedRoomId),
        });
      }
    });

    socket.on("typing-start", ({ roomId }: { roomId: number | string }) => {
      const userId = toNumber(socket.data.userId);
      const parsedRoomId = toNumber(roomId);
      if (!userId || !parsedRoomId) return;
      socket.to(`room:${parsedRoomId}`).emit("typing-start", {
        userId: String(userId),
        roomId: String(parsedRoomId),
      });
    });

    socket.on("typing-stop", ({ roomId }: { roomId: number | string }) => {
      const userId = toNumber(socket.data.userId);
      const parsedRoomId = toNumber(roomId);
      if (!userId || !parsedRoomId) return;
      socket.to(`room:${parsedRoomId}`).emit("typing-stop", {
        userId: String(userId),
        roomId: String(parsedRoomId),
      });
    });

    socket.on("mark-as-read", async ({ roomId }: { roomId: number | string }) => {
      const userId = toNumber(socket.data.userId);
      const parsedRoomId = toNumber(roomId);
      if (!userId || !parsedRoomId) return;
      await storage.markMessagesAsRead(parsedRoomId, userId);
    });

    socket.on("disconnect", async () => {
      const userId = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);
      if (userId) {
        await storage.updateUserPresence(Number(userId), "offline");
        io.emit("user-offline", { userId: String(userId) });
        broadcastOnlineUsers(io);
      }
    });
  });

  return io;
}
