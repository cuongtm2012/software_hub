import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { adminMiddleware } from "../middleware/auth.middleware.js";
import { leadRateLimiter } from "../middleware/rate-limit.js";

const router = Router();

router.get("/", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit = "50", offset = "0" } = req.query;
    const result = await storage.getLeads({
      status: status as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;
    const lead = await storage.updateLead(id, { status, notes });
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

router.post("/", leadRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, source, source_id } = req.body;

    if (!email || !phone || !source) {
      return res.status(400).json({ error: "email, phone, and source are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const phoneClean = phone.replace(/\s/g, "");
    if (!/^[0-9+\-()]{8,15}$/.test(phoneClean)) {
      return res.status(400).json({ error: "Invalid phone format" });
    }

    const lead = await storage.createLead({
      name,
      email: email.trim(),
      phone: phoneClean,
      source,
      source_id,
    });

    res.status(201).json({ success: true, id: lead.id });
  } catch (error) {
    next(error);
  }
});

export default router;
