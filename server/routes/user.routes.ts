import type { Express } from "express";
import { userStorage } from "../storage/user";
import { isAuthenticated, optionalAuth } from "../middleware/auth.middleware";
import { storage } from "../storage";

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

  // External Project Requests (Public endpoint - no auth required)
  // Public endpoint to create external project requests
  // Uses optionalAuth to link request to user if they're logged in
  app.post("/api/external-requests", optionalAuth, async (req, res, next) => {
    try {
      console.log('📝 Creating external project request:', req.body);
      console.log('👤 User session:', { userId: req.user?.id, email: req.user?.email });

      const requestData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || '',
        project_description: req.body.project_description,
        requirements: req.body.requirements || '',
        budget: req.body.budget || null,
        timeline: req.body.timeline || '',
        status: req.body.status || 'pending',
        // Link to user if logged in
        client_id: req.user?.id || null,
      };

      const externalRequest = await storage.createExternalRequest(requestData);

      console.log('✅ External request created:', externalRequest.id, 'for user:', requestData.client_id);
      res.status(201).json(externalRequest);
    } catch (error) {
      console.error('❌ Error creating external request:', error);
      next(error);
    }
  });

  // Get user's external requests (requires auth)
  app.get("/api/my-external-requests", isAuthenticated, async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      console.log('📋 Fetching external requests for user:', req.user?.id, { page, limit, status });

      const result = await storage.getExternalRequestsByClient(
        req.user?.id as number,
        { page, limit, status }
      );

      console.log('✅ Found', result.total, 'external requests for user');
      res.json(result);
    } catch (error) {
      console.error('❌ Error fetching user external requests:', error);
      next(error);
    }
  });

  // Get user's projects (external requests)
  app.get("/api/my-projects", isAuthenticated, async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      console.log('📋 Fetching projects for user:', req.user?.id, { page, limit, status });

      const result = await storage.getExternalRequestsByClient(
        req.user?.id as number,
        { page, limit, status }
      );

      // Return in the format expected by frontend (projects instead of requests)
      res.json({ projects: result.requests, total: result.total });
    } catch (error) {
      console.error('❌ Error fetching user projects:', error);
      next(error);
    }
  });

  // Get project/external request by ID
  app.get("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      console.log('📋 Fetching project details:', id, 'for user:', req.user?.id);

      const externalRequest = await storage.getExternalRequestById(id);

      if (!externalRequest) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns this request
      if (externalRequest.client_id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Map external request to project format for frontend compatibility
      const projectData = {
        ...externalRequest,
        title: `Project Request #${externalRequest.id}`,
        description: externalRequest.project_description,
        // Keep original fields for compatibility
        project_description: externalRequest.project_description,
      };

      res.json(projectData);
    } catch (error) {
      console.error('❌ Error fetching project details:', error);
      next(error);
    }
  });
}
