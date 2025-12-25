import type { Express } from "express";
import { userStorage } from "../storage/user";
import { isAuthenticated } from "../middleware/auth.middleware";

export function registerUserRoutes(app: Express) {
  // Get all users (for chat user list)
  // TEMPORARY: Remove auth middleware for debugging
  app.get("/api/users", async (req, res, next) => {
    try {
      console.log('📋 /api/users called - Session:', {
        sessionId: req.sessionID,
        userId: req.session?.userId,
        userEmail: req.session?.user?.email,
        hasReqUser: !!req.user
      });
      
      const result = await userStorage.getAllUsers();
      
      console.log('✅ Got all users:', result.users.length, 'total users');
      
      // Remove sensitive data and exclude current user
      const safeUsers = result.users
        .filter(u => u.id !== req.user?.id) // Exclude current user
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          createdAt: u.createdAt
        }));
      
      console.log('📤 Sending users:', safeUsers.length, 'users (excluding current user)');
      res.json({ users: safeUsers });
    } catch (error) {
      console.error('❌ Error in /api/users:', error);
      next(error);
    }
  });

  // User Profile Management Routes
  app.get("/api/auth/profile", isAuthenticated, async (req, res, next) => {
    try {
      const user = await userStorage.getUser(req.user?.id as number);
      res.json({ profile: user?.profile || {} });
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/auth/profile", isAuthenticated, async (req, res, next) => {
    try {
      const { profile } = req.body;
      const updatedUser = await userStorage.updateUserProfile(req.user?.id as number, profile);
      res.json({ profile: updatedUser?.profile || {} });
    } catch (error) {
      next(error);
    }
  });
  
  // User Downloads Management
  app.get("/api/user/downloads", isAuthenticated, async (req, res, next) => {
    try {
      const downloads = await userStorage.getUserDownloads(req.user?.id as number);
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
      
      const download = await userStorage.createUserDownload(
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
      const reviews = await userStorage.getUserReviews(req.user?.id as number);
      res.json({ reviews });
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/user/reviews/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const reviewData = req.body;
      
      const review = await userStorage.updateReview(
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
