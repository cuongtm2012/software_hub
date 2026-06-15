import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertSoftwareSchema } from "@shared/schema";
import { isAuthenticated, optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Get user-need software categories with counts (public)
router.get("/categories", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoriesWithCounts = await storage.getSoftwareUseCategories("approved");
    res.json(categoriesWithCounts);
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
      platform,
      type // 'software', 'api', or undefined for all
    } = req.query;

    // Debug logging
    console.log(`📥 GET /api/softwares - type: ${type}, limit: ${limit}`);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const result = await storage.getSoftwareList({
      category: category ? parseInt(category as string) : undefined,
      platform: platform as string,
      search: search as string,
      type: type as 'software' | 'api' | undefined,
      status: 'approved', // Only show approved software publicly
      sort: sort as string,
      limit: limitNum,
      offset: offset
    });

    console.log(`📤 Returning ${result.softwares?.length || 0} items (type filter: ${type || 'none'})`);
    if (result.softwares?.length > 0) {
      console.log(`   First item: ${result.softwares[0].name} (type: ${result.softwares[0].type})`);
    }

    // Prevent caching for filtered requests
    if (type) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get software by ID or slug (public)
router.get("/:idOrSlug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrSlug } = req.params;
    const numericId = parseInt(idOrSlug, 10);

    const software =
      !isNaN(numericId) && String(numericId) === idOrSlug
        ? await storage.getSoftwareById(numericId)
        : await storage.getSoftwareBySlug(idOrSlug);

    if (!software) {
      return res.status(404).json({ message: "Software not found" });
    }

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
router.post("/:id/download", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const software = await storage.getSoftwareById(parseInt(id));

    if (!software) {
      return res.status(404).json({ message: "Software not found" });
    }

    if (software.status !== 'approved') {
      return res.status(403).json({ message: "Software is not available for download" });
    }

    await storage.incrementSoftwareDownloads(parseInt(id));

    if (req.user?.id) {
      await storage.createUserDownload(
        req.user.id as number,
        parseInt(id),
        software.version || '1.0.0'
      );
    }

    res.json({
      download_url: software.download_link,
      message: "Download started successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;
