import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertSoftwareSchema } from "@shared/schema";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

// Get all categories (public) - only parent categories
router.get("/categories", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allCategories = await storage.getCategories();
    // Filter to only parent categories (parent_id is null)
    const parentCategories = allCategories.filter((cat: any) => cat.parent_id === null);
    res.json(parentCategories);
  } catch (error) {
    next(error);
  }
});

// Get all approved software (public)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = "1",
      limit = "12",
      category,
      search,
      sort = "newest",
      platform
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const result = await storage.getSoftwareList({
      category: category ? parseInt(category as string) : undefined,
      platform: platform as string,
      search: search as string,
      status: 'approved', // Only show approved software publicly
      limit: limitNum,
      offset: offset
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get software by ID (public)
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const software = await storage.getSoftwareById(parseInt(id));

    if (!software) {
      return res.status(404).json({ message: "Software not found" });
    }

    // Only show approved software to non-admins
    if (software.status !== 'approved') {
      return res.status(403).json({ message: "Software is not available" });
    }

    res.json(software);
  } catch (error) {
    next(error);
  }
});

// Create software (authenticated users)
router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = insertSoftwareSchema.parse(req.body);
    const software = await storage.createSoftware(validatedData, req.user?.id as number);

    res.status(201).json({
      software,
      message: "Software submitted successfully. It will be reviewed by an admin."
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      res.status(400).json({ message: validationError.message });
    } else {
      next(error);
    }
  }
});

// Update software (owner only)
router.put("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const software = await storage.getSoftwareById(parseInt(id));

    if (!software) {
      return res.status(404).json({ message: "Software not found" });
    }

    // Check if user owns the software
    if (software.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to update this software" });
    }

    const updatedSoftware = await storage.updateSoftware(parseInt(id), req.body);
    res.json(updatedSoftware);
  } catch (error) {
    next(error);
  }
});

// Download software
router.post("/:id/download", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const software = await storage.getSoftwareById(parseInt(id));

    if (!software) {
      return res.status(404).json({ message: "Software not found" });
    }

    if (software.status !== 'approved') {
      return res.status(403).json({ message: "Software is not available for download" });
    }

    // Increment download count
    await storage.incrementSoftwareDownloads(parseInt(id));

    // Track download if user is authenticated
    if (req.session?.userId) {
      await storage.createUserDownload(
        req.session.userId,
        parseInt(id),
        software.version || '1.0.0'
      );
    }

    res.json({
      download_url: software.download_url,
      message: "Download started successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
