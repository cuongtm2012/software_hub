import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth.middleware";

export function registerUserRoutes(app: Express) {
  // User Profile Management Routes
  app.get("/api/auth/profile", isAuthenticated, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.user?.id as number);
      res.json({ profile: user?.profile || {} });
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/auth/profile", isAuthenticated, async (req, res, next) => {
    try {
      const { profile } = req.body;
      const updatedUser = await storage.updateUserProfile(req.user?.id as number, profile);
      res.json({ profile: updatedUser?.profile || {} });
    } catch (error) {
      next(error);
    }
  });
  
  // User Downloads Management
  app.get("/api/user/downloads", isAuthenticated, async (req, res, next) => {
    try {
      const downloads = await storage.getUserDownloads(req.user?.id as number);
      res.json({ downloads });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/user/downloads", isAuthenticated, async (req, res, next) => {
    try {
      const { softwareId, version } = req.body;
      
      if (!softwareId || !version) {
        return res.status(400).json({ message: "Software ID and version are required" });
      }
      
      const download = await storage.createUserDownload(
        req.user?.id as number, 
        parseInt(softwareId), 
        version
      );
      
      res.status(201).json({ download });
    } catch (error) {
      next(error);
    }
  });
  
  // User Reviews Management
  app.get("/api/user/reviews", isAuthenticated, async (req, res, next) => {
    try {
      const reviews = await storage.getUserReviews(req.user?.id as number);
      res.json({ reviews });
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/user/reviews/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const reviewData = req.body;
      
      const review = await storage.updateReview(
        parseInt(id),
        req.user?.id as number,
        reviewData
      );
      
      if (!review) {
        return res.status(404).json({ message: "Review not found or not owned by user" });
      }
      
      res.json({ review });
    } catch (error) {
      next(error);
    }
  });
}
