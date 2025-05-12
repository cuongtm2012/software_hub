import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertSoftwareSchema, insertReviewSchema, insertCategorySchema } from "@shared/schema";

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Categories Routes
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/categories", isAdmin, async (req, res, next) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  // Software Routes
  app.get("/api/softwares", async (req, res, next) => {
    try {
      const { category, platform, search, page = "1", limit = "12" } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getSoftwareList({
        category: category ? parseInt(category as string, 10) : undefined,
        platform: platform as string | undefined,
        search: search as string | undefined,
        limit: limitNum,
        offset
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/softwares/:id", async (req, res, next) => {
    try {
      const softwareId = parseInt(req.params.id, 10);
      const software = await storage.getSoftwareById(softwareId);
      
      if (!software) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      res.json(software);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/softwares", isAuthenticated, async (req, res, next) => {
    try {
      const softwareData = insertSoftwareSchema.parse(req.body);
      const userId = req.user!.id;
      
      const software = await storage.createSoftware(softwareData, userId);
      res.status(201).json(software);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  // Admin route to approve/reject software
  app.put("/api/softwares/:id/status", isAdmin, async (req, res, next) => {
    try {
      const softwareId = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      
      const software = await storage.updateSoftwareStatus(softwareId, status);
      
      if (!software) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      res.json(software);
    } catch (error) {
      next(error);
    }
  });

  // Reviews Routes
  app.get("/api/reviews/:software_id", async (req, res, next) => {
    try {
      const softwareId = parseInt(req.params.software_id, 10);
      const reviews = await storage.getReviewsBySoftwareId(softwareId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res, next) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const userId = req.user!.id;
      
      const review = await storage.createReview(reviewData, userId);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.delete("/api/reviews/:id", isAuthenticated, async (req, res, next) => {
    try {
      const reviewId = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      
      const success = await storage.deleteReview(reviewId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Review not found or you don't have permission to delete it" });
      }
      
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
