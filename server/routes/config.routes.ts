import { Router, Request, Response, NextFunction } from "express";
import { getGaMeasurementId } from "../lib/ga-settings.js";

const router = Router();

// Public runtime config (safe to expose)
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const gaMeasurementId = await getGaMeasurementId();
    res.json({
      gaMeasurementId: gaMeasurementId || null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

