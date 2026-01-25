import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

// Buyer Statistics
router.get("/stats", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await storage.getBuyerStatistics(req.user!.id);
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Buyer Purchase History
router.get("/purchases", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const purchases = await storage.getBuyerPurchases(req.user!.id);
        res.json({ purchases });
    } catch (error) {
        next(error);
    }
});

export default router;
