import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth.middleware";
import { insertSupportTicketSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const router = Router();

// List tickets — buyer sees own tickets, seller sees assigned tickets
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    let tickets;

    if (user.role === "seller") {
      tickets = await storage.getSellerSupportTickets(user.id);
    } else if (user.role === "admin") {
      tickets = await storage.getAllSupportTickets();
    } else {
      tickets = await storage.getSupportTickets(user.id);
    }

    res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

// Create ticket (buyer)
router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    if (user.role === "seller") {
      return res.status(403).json({ message: "Seller không thể tạo ticket mua hàng" });
    }

    const data = insertSupportTicketSchema.parse(req.body);
    const ticket = await storage.createSupportTicket(data, user.id);
    res.status(201).json(ticket);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      res.status(400).json({ message: validationError.message });
    } else {
      next(error);
    }
  }
});

// Get single ticket
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const ticket = await storage.getSupportTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }

    const user = req.user!;
    const canView =
      user.role === "admin" ||
      ticket.buyer_id === user.id ||
      ticket.seller_id === user.id;

    if (!canView) {
      return res.status(403).json({ message: "Không có quyền xem ticket này" });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// Update ticket status (seller/admin) or buyer can close own ticket
router.patch("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const ticket = await storage.getSupportTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy ticket" });
    }

    const user = req.user!;
    const { status, priority } = req.body as { status?: string; priority?: string };

    const isBuyer = ticket.buyer_id === user.id;
    const isSeller = ticket.seller_id === user.id;
    const isAdmin = user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: "Không có quyền cập nhật ticket" });
    }

    if (isBuyer && !isAdmin && status && !["closed"].includes(status)) {
      return res.status(403).json({ message: "Buyer chỉ có thể đóng ticket" });
    }

    const updates: Record<string, string> = {};
    if (status) updates.status = status;
    if (priority && (isSeller || isAdmin)) updates.priority = priority;

    const updated = await storage.updateSupportTicket(id, updates);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
