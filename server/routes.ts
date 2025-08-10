import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertSoftwareSchema, insertReviewSchema, insertCategorySchema,
  insertProjectSchema, insertQuoteSchema, insertMessageSchema, 
  insertPortfolioSchema, insertPortfolioReviewSchema,
  insertProductSchema, insertOrderSchema, insertOrderItemSchema,
  insertPaymentSchema, insertProductReviewSchema, insertExternalRequestSchema,
  insertUserDownloadSchema, insertSellerProfileSchema, insertCartItemSchema,
  insertSupportTicketSchema, insertSalesAnalyticsSchema,
  insertServiceRequestSchema, insertServiceQuotationSchema, 
  insertServiceProjectSchema, insertServicePaymentSchema,
  insertChatRoomSchema, insertChatRoomMemberSchema, insertChatMessageSchema,
  insertUserPresenceSchema, chatRooms, chatRoomMembers, chatMessages, userPresence,
  products
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ne, inArray, desc, gt, count } from "drizzle-orm";
import { update } from "drizzle-orm/pg-core";
import { users } from "@shared/schema";
import { z } from "zod";
import emailService from "./services/emailService.js";
import notificationService from "./services/notificationService.js";
import { ObjectStorageService } from "./objectStorage";
import { getR2Storage } from "./cloudflare-r2-storage-working";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check if user exists in session
  if (!req.session.userId || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Add user to request object for easy access
  req.user = req.session.user;
  
  next();
}

// Role-based access control middleware
function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('Role check - session userId:', req.session?.userId, 'user:', req.session?.user?.email, 'role:', req.session?.user?.role);
    
    if (!req.session.userId || !req.session.user) {
      console.log('Authorization failed: no session user');
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.user = req.session.user;
    
    if (!roles.includes(req.user?.role as string)) {
      console.log('Role check failed: user role', req.user?.role, 'not in required roles', roles);
      return res.status(403).json({ message: `Forbidden: Required role not assigned` });
    }
    
    console.log('Role check passed for user:', req.user?.email);
    next();
  };
}

// Short-hand middleware for common role combinations
const adminMiddleware = hasRole(['admin']);
const adminOrDeveloperMiddleware = hasRole(['admin', 'developer']);

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple test login for testing purposes (before setupAuth to avoid conflicts)
  app.post("/api/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Simple password check for testing - bypass hashing for test accounts
      const isValidPassword = 
        (email === "seller@test.com" && password === "testpassword") ||
        (email === "buyer@test.com" && password === "testpassword") ||
        (email === "cuongeurovnn@gmail.com" && password === "abcd@1234") ||
        (email === "cuongtm2012@gmail.com" && password === "Cuongtm2012$");
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session (simplified)
      
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.session?.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate input
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      // Create the user with default 'user' role
      const user = await storage.createUser({
        name,
        email,
        password, // Note: In production, hash this password
        role: 'user', // Default role for new registrations
      });

      // Send welcome email (don't wait for it to complete)
      emailService.sendWelcomeEmail(user.email, user.name).then(result => {
        if (result.success) {
          console.log(`Welcome email sent to ${user.email} (${result.messageId})`);
        } else {
          console.error(`Failed to send welcome email to ${user.email}:`, result.error);
        }
      }).catch(error => {
        console.error(`Welcome email error for ${user.email}:`, error);
      });

      // Create session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        ...userWithoutPassword,
        welcomeEmailSent: true,
        message: "Account created successfully! A welcome email has been sent to your email address."
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  // Skip setupAuth to avoid session conflicts
  // setupAuth(app);
  
  // Admin routes
  app.get("/api/admin/users", adminMiddleware, async (req, res, next) => {
    try {
      // Get all users (in a real app, you would add pagination)
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  });

  // Admin Software Management Routes
  app.get("/api/admin/software", adminMiddleware, async (req, res, next) => {
    try {
      console.log('Admin software endpoint called by user:', req.user?.email, 'role:', req.user?.role);
      
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '', 
        type = '', 
        license = '', 
        dateFrom = '', 
        dateTo = '' 
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const filters = {
        search: search as string,
        status: status as string,
        type: type as string,
        license: license as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      };
      
      console.log('Fetching admin software list with filters:', filters);
      const result = await storage.getAdminSoftwareList(filters, limitNum, offset);
      console.log('Admin software result:', { total: result.total, count: result.softwares.length });
      
      res.json(result);
    } catch (error) {
      console.error('Error in admin software endpoint:', error);
      next(error);
    }
  });

  app.post("/api/admin/software", adminMiddleware, async (req, res, next) => {
    try {
      const validatedData = insertSoftwareSchema.parse(req.body);
      const software = await storage.createSoftware(validatedData, req.user?.id as number);
      
      // Auto-approve software added by admin
      const approvedSoftware = await storage.updateSoftwareStatus(software.id, 'approved');
      
      res.status(201).json({ software: approvedSoftware });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).details 
        });
      }
      next(error);
    }
  });

  app.put("/api/admin/software/:id", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const software = await storage.updateSoftwareAdmin(parseInt(id), updates);
      
      if (!software) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      res.json(software);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/software/:id", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const softwareId = parseInt(id);
      
      const success = await storage.deleteSoftware(softwareId);
      if (!success) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      res.json({ message: "Software deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/software/:id/status", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const softwareId = parseInt(id);
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be: pending, approved, or rejected" });
      }
      
      const updatedSoftware = await storage.updateSoftwareStatus(softwareId, status);
      if (!updatedSoftware) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      res.json({ software: updatedSoftware });
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/admin/users/:id/role", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }
      
      const user = await storage.updateUser(parseInt(id), { role });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

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
  
  // Categories Management
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/categories", adminMiddleware, async (req, res, next) => {
    try {
      const insertData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(insertData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.get("/api/categories/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await storage.getCategoryById(parseInt(id));
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      next(error);
    }
  });
  
  // Softwares Management
  app.get("/api/softwares", async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "10", 
        category, 
        search,
        platform,
        sort = "newest"
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getSoftwareList({
        category: category ? parseInt(category as string) : undefined,
        search: search as string,
        platform: platform as string,
        status: 'approved', // Only show approved software to public
        limit: limitNum,
        offset
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Admin software endpoint - shows all software regardless of status
  app.get("/api/admin/softwares", adminMiddleware, async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "20", 
        category, 
        search,
        platform,
        sort = "newest"
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getSoftwareList({
        category: category ? parseInt(category as string) : undefined,
        search: search as string,
        platform: platform as string,
        // Admin can see all software regardless of status
        limit: limitNum,
        offset
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Admin users endpoint
  app.get("/api/admin/users", adminMiddleware, async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "20", 
        role,
        search
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getAllUsers({
        role: role as string,
        search: search as string,
        limit: limitNum,
        offset
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Admin update user endpoint
  app.put("/api/admin/users/:id", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(parseInt(id), userData);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Admin delete user endpoint
  app.delete("/api/admin/users/:id", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(parseInt(id));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Admin external requests endpoint
  app.get("/api/admin/external-requests", adminMiddleware, async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "20", 
        status,
        search
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getAllExternalRequests({
        status: status as string,
        search: search as string,
        limit: limitNum,
        offset
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Admin update external request status endpoint
  app.put("/api/admin/external-requests/:id/status", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedRequest = await storage.updateExternalRequestStatus(parseInt(id), status);
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Admin assign developer to external request endpoint
  app.put("/api/admin/external-requests/:id/assign", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { assigned_developer_id } = req.body;
      
      const updatedRequest = await storage.assignDeveloperToExternalRequest(parseInt(id), assigned_developer_id);
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/softwares", isAuthenticated, async (req, res, next) => {
    try {
      const insertData = insertSoftwareSchema.parse(req.body);
      
      const software = await storage.createSoftware(insertData, req.user?.id as number);
      res.status(201).json(software);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.get("/api/softwares/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const software = await storage.getSoftwareById(parseInt(id));
      
      if (!software) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      res.json(software);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/softwares/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const software = await storage.getSoftwareById(parseInt(id));
      
      if (!software) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      if (software.created_by !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You do not have permission to update this software" });
      }
      
      const updatedSoftware = await storage.updateSoftware(parseInt(id), req.body);
      res.json(updatedSoftware);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/softwares/:id/status", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const software = await storage.updateSoftwareStatus(parseInt(id), status);
      
      if (!software) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      res.json(software);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/softwares/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const software = await storage.getSoftwareById(parseInt(id));
      
      if (!software) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      if (software.created_by !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You do not have permission to delete this software" });
      }
      
      await storage.deleteSoftware(parseInt(id));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Reviews Management
  app.get("/api/softwares/:id/reviews", async (req, res, next) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getSoftwareReviews(parseInt(id));
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/softwares/:id/reviews", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if user has already reviewed this software
      const existingReview = await storage.getUserReviewForSoftware(
        req.user?.id as number,
        parseInt(id)
      );
      
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this software" });
      }
      
      const insertData = insertReviewSchema.parse({
        ...req.body,
        software_id: parseInt(id),
        user_id: req.user?.id
      });
      
      const review = await storage.createReview(insertData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.put("/api/reviews/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const review = await storage.getReviewById(parseInt(id));
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You do not have permission to update this review" });
      }
      
      const updatedReview = await storage.updateReview(
        parseInt(id),
        req.user?.id as number,
        req.body
      );
      
      res.json(updatedReview);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/reviews/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const review = await storage.getReviewById(parseInt(id));
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You do not have permission to delete this review" });
      }
      
      await storage.deleteReview(parseInt(id));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Project Management for Freelancers
  app.get("/api/projects", isAuthenticated, async (req, res, next) => {
    try {
      let projects;
      const { status, role } = req.query;
      
      if (req.user?.role === 'admin') {
        projects = await storage.getAllProjects(status as string);
      } else if (req.user?.role === 'client') {
        projects = await storage.getClientProjects(req.user.id, status as string);
      } else if (req.user?.role === 'developer') {
        projects = await storage.getDeveloperProjects(req.user.id, status as string);
      } else if (req.user?.role === 'seller') {
        // Sellers can view available projects for collaboration
        projects = await storage.getAvailableProjects(status as string);
      } else {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const projectsCount = await storage.getProjectsCount(status as string);
      
      res.json({ projects, count: projectsCount.count });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/projects", isAuthenticated, async (req, res, next) => {
    try {
      // Only clients can create projects
      if (req.user?.role !== 'client' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only clients can create projects" });
      }
      
      const insertData = insertProjectSchema.parse({
        ...req.body,
        client_id: req.user?.id,
        status: "pending"
      });
      
      const project = await storage.createProject(insertData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.get("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await storage.getProjectById(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check permissions
      if (
        req.user?.role !== 'admin' && 
        project.client_id !== req.user?.id && 
        project.assigned_developer_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "You do not have permission to view this project" });
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/projects/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const project = await storage.getProjectById(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check permissions
      if (
        req.user?.role !== 'admin' && 
        project.client_id !== req.user?.id && 
        project.developer_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "You do not have permission to update this project" });
      }
      
      const updatedProject = await storage.updateProjectStatus(parseInt(id), status);
      res.json(updatedProject);
    } catch (error) {
      next(error);
    }
  });
  
  // Quotes Management
  app.get("/api/projects/:id/quotes", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await storage.getProjectById(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check permissions
      if (
        req.user?.role !== 'admin' && 
        project.client_id !== req.user?.id && 
        project.assigned_developer_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "You do not have permission to view quotes for this project" });
      }
      
      const quotes = await storage.getQuotesByProjectId(parseInt(id));
      res.json(quotes);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/projects/:id/quotes", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Only developers can submit quotes
      if (req.user?.role !== 'developer' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only developers can submit quotes" });
      }
      
      const project = await storage.getProjectById(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if developer has already submitted a quote for this project
      const existingQuote = await storage.getDeveloperQuoteForProject(
        req.user?.id as number,
        parseInt(id)
      );
      
      if (existingQuote) {
        return res.status(400).json({ message: "You have already submitted a quote for this project" });
      }
      
      const insertData = insertQuoteSchema.parse({
        ...req.body,
        project_id: parseInt(id),
        developer_id: req.user?.id,
        status: "pending"
      });
      
      const quote = await storage.createQuote(insertData);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.put("/api/quotes/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const quote = await storage.getQuoteById(parseInt(id));
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      const project = await storage.getProjectById(quote.project_id);
      
      // Only the client who created the project can accept/reject quotes
      if (req.user?.role !== 'admin' && project?.client_id !== req.user?.id) {
        return res.status(403).json({ message: "Only the project owner can update quote status" });
      }
      
      const updatedQuote = await storage.updateQuoteStatus(parseInt(id), status);
      
      // If quote is accepted, update the project with the developer
      if (status === 'accepted') {
        await storage.updateProject(quote.project_id, { 
          developer_id: quote.developer_id,
          status: 'in_progress'
        });
        
        // Reject all other quotes for this project
        await storage.rejectOtherQuotes(quote.project_id, parseInt(id));
      }
      
      res.json(updatedQuote);
    } catch (error) {
      next(error);
    }
  });
  
  // Messages Management
  app.get("/api/projects/:id/messages", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await storage.getProjectById(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check permissions
      if (
        req.user?.role !== 'admin' && 
        project.client_id !== req.user?.id && 
        project.assigned_developer_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "You do not have permission to view messages for this project" });
      }
      
      const messages = await storage.getMessagesByProjectId(parseInt(id));
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/projects/:id/messages", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await storage.getProjectById(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check permissions
      if (
        req.user?.role !== 'admin' && 
        project.client_id !== req.user?.id && 
        project.assigned_developer_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "You do not have permission to send messages for this project" });
      }
      
      const insertData = insertMessageSchema.parse({
        ...req.body,
        project_id: parseInt(id),
        sender_id: req.user?.id
      });
      
      const message = await storage.sendMessage(insertData, req.user?.id!);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  // Portfolios Management
  app.get("/api/developer/:id/portfolio", async (req, res, next) => {
    try {
      const { id } = req.params;
      const portfolio = await storage.getDeveloperPortfolio(parseInt(id));
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      res.json(portfolio);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/portfolio", isAuthenticated, async (req, res, next) => {
    try {
      // Only developers can create portfolios
      if (req.user?.role !== 'developer' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only developers can create portfolios" });
      }
      
      // Check if developer already has a portfolio
      const existingPortfolio = await storage.getDeveloperPortfolio(req.user?.id as number);
      
      if (existingPortfolio) {
        return res.status(400).json({ message: "You already have a portfolio" });
      }
      
      const insertData = insertPortfolioSchema.parse({
        ...req.body,
        developer_id: req.user?.id
      });
      
      const portfolio = await storage.createPortfolio(insertData);
      res.status(201).json(portfolio);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.put("/api/portfolio", isAuthenticated, async (req, res, next) => {
    try {
      // Only developers can update their portfolios
      if (req.user?.role !== 'developer' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only developers can update portfolios" });
      }
      
      const portfolio = await storage.getDeveloperPortfolio(req.user?.id as number);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      const updatedPortfolio = await storage.updatePortfolio(portfolio.id, req.body);
      res.json(updatedPortfolio);
    } catch (error) {
      next(error);
    }
  });
  
  // Portfolio Reviews Management
  app.get("/api/portfolio/:id/reviews", async (req, res, next) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getPortfolioReviews(parseInt(id));
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/portfolio/:id/reviews", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Only clients can review portfolios
      if (req.user?.role !== 'client' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only clients can review portfolios" });
      }
      
      // Check if portfolio exists
      const portfolio = await storage.getPortfolioById(parseInt(id));
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      // Check if client has already reviewed this portfolio
      const existingReview = await storage.getClientReviewForPortfolio(
        req.user?.id as number,
        parseInt(id)
      );
      
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this portfolio" });
      }
      
      const insertData = insertPortfolioReviewSchema.parse({
        ...req.body,
        portfolio_id: parseInt(id),
        client_id: req.user?.id
      });
      
      const review = await storage.createPortfolioReview(insertData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  // Products Management
  app.get("/api/products", async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "10", 
        category, 
        search,
        sort = "newest"
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const { products, total } = await storage.getProducts({
        page: pageNum,
        limit: limitNum,
        categoryId: category ? parseInt(category as string) : undefined,
        search: search as string,
        sort: sort as string
      });
      
      res.json({
        products,
        total
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/products", isAuthenticated, async (req, res, next) => {
    try {
      // Only sellers can create products
      if (req.user?.role !== 'seller' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only sellers can create products" });
      }
      
      const insertData = insertProductSchema.parse({
        ...req.body,
        seller_id: req.user?.id
      });
      
      const product = await storage.createProduct(insertData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.get("/api/products/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check permissions
      if (product.seller_id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You do not have permission to update this product" });
      }
      
      const updatedProduct = await storage.updateProduct(parseInt(id), req.body);
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check permissions
      if (product.seller_id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You do not have permission to delete this product" });
      }
      
      await storage.deleteProduct(parseInt(id));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Product Reviews Management
  app.get("/api/products/:id/reviews", async (req, res, next) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getProductReviews(parseInt(id));
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/products/:id/reviews", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check if product exists
      const product = await storage.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user has already reviewed this product
      const existingReview = await storage.getUserReviewForProduct(
        req.user?.id as number,
        parseInt(id)
      );
      
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }
      
      const insertData = insertProductReviewSchema.parse({
        ...req.body,
        product_id: parseInt(id),
        user_id: req.user?.id
      });
      
      const review = await storage.createProductReview(insertData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  // Orders Management
  app.get("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      let orders;
      
      if (req.user?.role === 'admin') {
        orders = await storage.getAllOrders();
      } else if (req.user?.role === 'seller') {
        orders = await storage.getSellerOrders(req.user.id);
      } else if (req.user?.role === 'buyer') {
        orders = await storage.getBuyerOrders(req.user.id);
      } else {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });
  
  // Purchase endpoint for buying products
  app.post("/api/products/:id/purchase", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { quantity = 1, payment_method = "credit_card" } = req.body;
      
      // Get product details
      const product = await storage.getProductById(parseInt(id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if product is available
      if (product.status !== 'approved') {
        return res.status(400).json({ message: "Product is not available for purchase" });
      }
      
      // Check stock
      if (product.stock_quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      
      // Prevent self-purchase
      if (product.seller_id === req.user?.id) {
        return res.status(400).json({ message: "Cannot purchase your own product" });
      }
      
      // Calculate total amount
      const unitPrice = parseFloat(product.price.toString());
      const totalAmount = unitPrice * quantity;
      const commissionRate = 0.05; // 5% commission
      const commissionAmount = totalAmount * commissionRate;
      
      // Create order
      const orderData = {
        buyer_id: req.user!.id,
        seller_id: product.seller_id,
        total_amount: totalAmount.toString(),
        commission_amount: commissionAmount.toString(),
        payment_method,
        status: 'completed' as const, // For simplicity, we're making it complete immediately
        buyer_info: {
          buyer_name: req.user!.name,
          buyer_email: req.user!.email
        }
      };
      
      // Create order with order items
      const orderItems = [{
        order_id: 0, // Will be set by the createOrder method
        product_id: parseInt(id),
        quantity,
        price: unitPrice.toString()
      }];
      
      const order = await storage.createOrder({
        buyer_id: req.user!.id,
        seller_id: product.seller_id,
        total_amount: totalAmount.toString(),
        commission_amount: commissionAmount.toString(),
        payment_method,
        status: 'completed' as const,
        buyer_info: {
          buyer_name: req.user!.name,
          buyer_email: req.user!.email
        }
      }, orderItems, req.user!.id);
      
      // Update product stock (admin access for purchase)
      await storage.updateProduct(parseInt(id), {
        stock_quantity: product.stock_quantity - quantity,
        total_sales: product.total_sales + quantity
      });
      
      // Create payment record
      const paymentData = {
        order_id: order.id,
        amount: totalAmount.toString(),
        payment_method,
        status: 'completed' as const,
        transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      await storage.createPayment(paymentData);
      
      res.status(201).json({ 
        message: "Purchase successful", 
        order,
        total_amount: totalAmount,
        download_available: true 
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res, next) => {
    try {
      // Only buyers can create orders
      if (req.user?.role !== 'buyer' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only buyers can create orders" });
      }
      
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      // Calculate order total
      let totalAmount = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await storage.getProductById(item.product_id);
        
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.product_id} not found` });
        }
        
        const quantity = item.quantity || 1;
        const itemTotal = product.price * quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          product_id: product.id,
          quantity,
          price: product.price,
          seller_id: product.seller_id
        });
      }
      
      const insertData = insertOrderSchema.parse({
        buyer_id: req.user?.id,
        total_amount: totalAmount,
        status: "pending"
      });
      
      const order = await storage.createOrder(insertData, orderItems);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.get("/api/orders/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrderById(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permissions
      const isSellerOfAnyItem = order.items.some(item => item.seller_id === req.user?.id);
      
      if (
        req.user?.role !== 'admin' && 
        order.buyer_id !== req.user?.id && 
        !isSellerOfAnyItem
      ) {
        return res.status(403).json({ message: "You do not have permission to view this order" });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/orders/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.getOrderById(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permissions
      const isSellerOfAnyItem = order.items.some(item => item.seller_id === req.user?.id);
      
      if (req.user?.role !== 'admin' && !isSellerOfAnyItem) {
        return res.status(403).json({ message: "Only sellers or admins can update order status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(parseInt(id), status);
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });
  
  // Payments Management
  app.get("/api/payments", isAuthenticated, async (req, res, next) => {
    try {
      let payments;
      
      if (req.user?.role === 'admin') {
        payments = await storage.getAllPayments();
      } else if (req.user?.role === 'client') {
        payments = await storage.getClientPayments(req.user.id);
      } else if (req.user?.role === 'developer') {
        payments = await storage.getDeveloperPayments(req.user.id);
      } else if (req.user?.role === 'buyer') {
        payments = await storage.getBuyerPayments(req.user.id);
      } else if (req.user?.role === 'seller') {
        payments = await storage.getSellerPayments(req.user.id);
      } else {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/payments", isAuthenticated, async (req, res, next) => {
    try {
      const { project_id, order_id, amount } = req.body;
      
      if ((!project_id && !order_id) || !amount) {
        return res.status(400).json({ message: "Project ID or Order ID and amount are required" });
      }
      
      if (project_id) {
        // Project payment
        const project = await storage.getProjectById(parseInt(project_id));
        
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        
        // Only the client who created the project can make payments
        if (req.user?.role !== 'admin' && project.client_id !== req.user?.id) {
          return res.status(403).json({ message: "Only the project owner can make payments" });
        }
        
        const insertData = insertPaymentSchema.parse({
          project_id: parseInt(project_id),
          amount: parseFloat(amount),
          status: "pending",
          payer_id: req.user?.id,
          payee_id: project.developer_id
        });
        
        const payment = await storage.createPayment(insertData);
        res.status(201).json(payment);
      } else {
        // Order payment
        const order = await storage.getOrderById(parseInt(order_id));
        
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        
        // Only the buyer who created the order can make payments
        if (req.user?.role !== 'admin' && order.buyer_id !== req.user?.id) {
          return res.status(403).json({ message: "Only the order owner can make payments" });
        }
        
        const insertData = insertPaymentSchema.parse({
          order_id: parseInt(order_id),
          amount: parseFloat(amount),
          status: "pending",
          payer_id: req.user?.id
        });
        
        const payment = await storage.createPayment(insertData);
        res.status(201).json(payment);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.put("/api/payments/:id/status", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const payment = await storage.getPaymentById(parseInt(id));
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      const updatedPayment = await storage.updatePaymentStatus(parseInt(id), status);
      
      // If payment is completed, update the related project or order
      if (status === 'completed') {
        if (payment.project_id) {
          await storage.updateProjectStatus(payment.project_id, "completed");
        } else if (payment.order_id) {
          await storage.updateOrderStatus(payment.order_id, "completed");
        }
      }
      
      res.json(updatedPayment);
    } catch (error) {
      next(error);
    }
  });
  
  // External Requests Management
  app.post("/api/external-requests", async (req, res, next) => {
    try {
      // Allow anonymous users to submit external requests
      const insertData = insertExternalRequestSchema.parse({
        ...req.body,
        status: "pending"
      });
      
      const externalRequest = await storage.createExternalRequest(insertData);
      res.status(201).json(externalRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });
  
  app.get("/api/external-requests", adminMiddleware, async (req, res, next) => {
    try {
      const externalRequests = await storage.getAllExternalRequests();
      res.json(externalRequests);
    } catch (error) {
      next(error);
    }
  });

  // Get external requests for logged-in user by email
  app.get("/api/my-external-requests", isAuthenticated, async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "50", 
        status 
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getUserExternalRequests(
        req.user?.email as string,
        {
          limit: limitNum,
          offset,
          status: status as string
        }
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Get all available projects (for marketplace/browsing)
  app.get("/api/available-projects", isAuthenticated, async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "50", 
        status 
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getAvailableProjects(
        status as string,
        {
          limit: limitNum,
          offset
        }
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Get combined projects for user dashboard (includes user's external requests + available projects)
  app.get("/api/my-combined-projects", isAuthenticated, async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "10", 
        status 
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getCombinedProjectsForUser(
        req.user?.email as string,
        status as string,
        {
          limit: limitNum,
          offset
        }
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/external-requests/:id", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const externalRequest = await storage.getExternalRequestById(parseInt(id));
      
      if (!externalRequest) {
        return res.status(404).json({ message: "External request not found" });
      }
      
      res.json(externalRequest);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/external-requests/:id/status", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const externalRequest = await storage.updateExternalRequestStatus(parseInt(id), status);
      
      if (!externalRequest) {
        return res.status(404).json({ message: "External request not found" });
      }
      
      res.json(externalRequest);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/external-requests/:id/convert", adminMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const externalRequest = await storage.getExternalRequestById(parseInt(id));
      
      if (!externalRequest) {
        return res.status(404).json({ message: "External request not found" });
      }
      
      // Convert external request to project
      const project = await storage.convertExternalRequestToProject(parseInt(id));
      
      // Update external request status
      await storage.updateExternalRequestStatus(parseInt(id), "approved");
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  // Seller Registration & Management Routes
  app.post("/api/seller/register", isAuthenticated, async (req, res, next) => {
    try {
      console.log('Seller registration request received:', JSON.stringify(req.body, null, 2));
      console.log('User:', req.user);
      
      const insertData = insertSellerProfileSchema.parse({
        ...req.body,
        verification_status: "pending"
      });
      
      console.log('Parsed insert data:', JSON.stringify(insertData, null, 2));
      
      const sellerProfile = await storage.createSellerProfile(insertData, req.user!.id);
      console.log('Seller profile created successfully:', sellerProfile);
      
      res.status(201).json({ seller_profile: sellerProfile });
    } catch (error) {
      console.error('Seller registration error:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error('Validation error details:', validationError.message);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error('Unexpected error:', error);
        next(error);
      }
    }
  });

  app.get("/api/seller/profile", isAuthenticated, async (req, res, next) => {
    try {
      const sellerProfile = await storage.getSellerProfile(req.user!.id);
      res.json({ seller_profile: sellerProfile });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/seller/profile", isAuthenticated, async (req, res, next) => {
    try {
      const updateData = insertSellerProfileSchema.partial().parse(req.body);
      const sellerProfile = await storage.updateSellerProfile(req.user!.id, updateData);
      
      if (!sellerProfile) {
        return res.status(404).json({ message: "Seller profile not found" });
      }
      
      res.json({ seller_profile: sellerProfile });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  // Seller Product Management
  app.post("/api/seller/products", isAuthenticated, async (req, res, next) => {
    try {
      // Check if user is a verified seller
      const sellerProfile = await storage.getSellerProfile(req.user!.id);
      if (!sellerProfile || sellerProfile.verification_status !== 'verified') {
        return res.status(403).json({ message: "Only verified sellers can add products" });
      }

      const insertData = insertProductSchema.parse({
        ...req.body,
        status: "pending" // Products need approval by default
      });
      
      const product = await storage.createProduct(insertData, req.user!.id);
      res.status(201).json({ product });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/seller/products", isAuthenticated, async (req, res, next) => {
    try {
      const { 
        page = "1", 
        limit = "50", // Default to 50 for dashboard, but supports pagination
        status,
        search 
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getProductsBySellerId(
        req.user!.id, 
        {
          limit: limitNum,
          offset,
          status: status as string,
          search: search as string
        }
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/seller/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = insertProductSchema.partial().parse(req.body);
      
      const product = await storage.updateProduct(parseInt(id), updateData, req.user!.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found or unauthorized" });
      }
      
      res.json({ product });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.delete("/api/seller/products/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(parseInt(id), req.user!.id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found or unauthorized" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Seller Orders & Analytics
  app.get("/api/seller/orders", isAuthenticated, async (req, res, next) => {
    try {
      const orders = await storage.getOrdersBySellerId(req.user!.id);
      res.json({ orders });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/seller/analytics", isAuthenticated, async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const filters: { startDate?: Date; endDate?: Date } = {};
      
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const analytics = await storage.getSalesAnalytics(req.user!.id, filters);
      res.json({ analytics });
    } catch (error) {
      next(error);
    }
  });

  // Admin Seller Verification Routes
  app.get("/api/admin/sellers", adminMiddleware, async (req, res, next) => {
    try {
      console.log('Admin sellers endpoint called by user:', req.user?.email, 'role:', req.user?.role);
      
      const sellers = await storage.getAllSellersForVerification();
      
      res.json({ sellers });
    } catch (error) {
      console.error("Admin sellers fetch error:", error);
      next(error);
    }
  });

  app.put("/api/admin/sellers/:userId/status", adminMiddleware, async (req, res, next) => {
    try {
      console.log('Admin seller status update called by user:', req.user?.email, 'role:', req.user?.role);
      
      const { userId } = req.params;
      const { status, notes } = req.body;
      
      if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be pending, verified, or rejected" });
      }
      
      const updatedProfile = await storage.updateSellerVerificationStatus(parseInt(userId), status);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Seller profile not found" });
      }
      
      // TODO: Send notification email to seller about status change
      console.log(`Seller ${userId} status updated to ${status} by admin ${req.user?.email}`);
      if (notes) {
        console.log(`Admin notes: ${notes}`);
      }
      
      res.json({ seller_profile: updatedProfile });
    } catch (error) {
      console.error("Admin seller status update error:", error);
      next(error);
    }
  });

  app.put("/api/admin/sellers/:userId/verification", adminMiddleware, async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid verification status" });
      }
      
      const sellerProfile = await storage.updateSellerVerificationStatus(parseInt(userId), status);
      
      if (!sellerProfile) {
        return res.status(404).json({ message: "Seller profile not found" });
      }
      
      res.json({ seller_profile: sellerProfile });
    } catch (error) {
      next(error);
    }
  });

  // Chat API Routes
  app.get("/api/chat/rooms", isAuthenticated, async (req, res, next) => {
    try {
      // Add cache-busting headers to prevent stale data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const userRooms = await db
        .select({
          id: chatRooms.id,
          name: chatRooms.name,
          type: chatRooms.type,
          created_at: chatRooms.created_at,
          updated_at: chatRooms.updated_at,
        })
        .from(chatRooms)
        .innerJoin(chatRoomMembers, eq(chatRooms.id, chatRoomMembers.room_id))
        .where(eq(chatRoomMembers.user_id, req.user!.id));
      
      console.log(`Chat rooms for user ${req.user!.id}:`, userRooms);
      res.json({ rooms: userRooms });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chat/rooms/:roomId/messages", isAuthenticated, async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      // Check if user is member of this room
      const membership = await db
        .select()
        .from(chatRoomMembers)
        .where(
          and(
            eq(chatRoomMembers.room_id, parseInt(roomId)),
            eq(chatRoomMembers.user_id, req.user!.id)
          )
        )
        .limit(1);
      
      if (membership.length === 0) {
        return res.status(403).json({ message: "You are not a member of this room" });
      }
      
      const messages = await db
        .select({
          id: chatMessages.id,
          content: chatMessages.content,
          message_type: chatMessages.message_type,
          status: chatMessages.status,
          created_at: chatMessages.created_at,
          sender: {
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          }
        })
        .from(chatMessages)
        .innerJoin(users, eq(chatMessages.sender_id, users.id))
        .where(eq(chatMessages.room_id, parseInt(roomId)))
        .orderBy(desc(chatMessages.created_at))
        .limit(parseInt(limit as string))
        .offset((parseInt(page as string) - 1) * parseInt(limit as string));
      
      res.json({ messages: messages.reverse() });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chat/rooms", isAuthenticated, async (req, res, next) => {
    try {
      const roomData = insertChatRoomSchema.parse({
        ...req.body,
        created_by: req.user!.id
      });
      
      const [room] = await db.insert(chatRooms).values(roomData).returning();
      
      // Add creator as member
      await db.insert(chatRoomMembers).values({
        room_id: room.id,
        user_id: req.user!.id,
        is_admin: true
      });
      
      // Add other members if specified
      if (req.body.member_ids && Array.isArray(req.body.member_ids)) {
        const memberValues = req.body.member_ids
          .filter((id: number) => id !== req.user!.id) // Don't add creator twice
          .map((id: number) => ({
            room_id: room.id,
            user_id: id,
            is_admin: false
          }));
        
        if (memberValues.length > 0) {
          await db.insert(chatRoomMembers).values(memberValues);
        }
      }
      
      res.status(201).json({ room });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.post("/api/chat/rooms/direct", isAuthenticated, async (req, res, next) => {
    try {
      const { user_id } = req.body;
      
      if (!user_id || user_id === req.user!.id) {
        return res.status(400).json({ message: "Invalid user_id" });
      }
      
      // Check if direct room already exists between these users
      const existingRoom = await db
        .select({ id: chatRooms.id })
        .from(chatRooms)
        .innerJoin(chatRoomMembers, eq(chatRooms.id, chatRoomMembers.room_id))
        .where(
          and(
            eq(chatRooms.type, 'direct'),
            inArray(chatRoomMembers.user_id, [req.user!.id, user_id])
          )
        )
        .groupBy(chatRooms.id)
        .having(eq(count(chatRoomMembers.user_id), 2));
      
      if (existingRoom.length > 0) {
        return res.json({ room: { id: existingRoom[0].id } });
      }
      
      // Create new direct room
      const [room] = await db.insert(chatRooms).values({
        type: 'direct',
        created_by: req.user!.id
      }).returning();
      
      // Add both users as members
      await db.insert(chatRoomMembers).values([
        { room_id: room.id, user_id: req.user!.id, is_admin: false },
        { room_id: room.id, user_id: user_id, is_admin: false }
      ]);
      
      res.status(201).json({ room });
    } catch (error) {
      next(error);
    }
  });

  // Get messages for a chat room
  app.get("/api/chat/rooms/:roomId/messages", isAuthenticated, async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const roomIdInt = parseInt(roomId);
      
      // Verify user is member of the room
      const membership = await db
        .select()
        .from(chatRoomMembers)
        .where(
          and(
            eq(chatRoomMembers.room_id, roomIdInt),
            eq(chatRoomMembers.user_id, req.user!.id)
          )
        )
        .limit(1);
      
      if (membership.length === 0) {
        return res.status(403).json({ message: "Access denied to this chat room" });
      }
      
      // Get messages with sender information
      const messages = await db
        .select({
          id: chatMessages.id,
          room_id: chatMessages.room_id,
          sender_id: chatMessages.sender_id,
          content: chatMessages.content,
          message_type: chatMessages.message_type,
          status: chatMessages.status,
          created_at: chatMessages.created_at,
          sender: {
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          }
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.sender_id, users.id))
        .where(eq(chatMessages.room_id, roomIdInt))
        .orderBy(chatMessages.created_at);
      
      res.json({ messages });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chat/users", isAuthenticated, async (req, res, next) => {
    try {
      const { role } = req.query;
      const currentUserRole = req.user!.role;
      
      // Define role-based access rules
      let allowedRoles: string[] = [];
      
      if (currentUserRole === 'admin') {
        allowedRoles = ['seller', 'buyer', 'user', 'developer', 'client'];
      } else if (currentUserRole === 'seller') {
        allowedRoles = ['buyer', 'admin'];
      } else if (currentUserRole === 'buyer') {
        allowedRoles = ['seller', 'admin'];
      } else {
        allowedRoles = ['admin']; // Regular users can only chat with admin
      }
      
      // First get distinct users without JOIN to avoid duplicates
      let query = db
        .selectDistinct({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(
          and(
            inArray(users.role, allowedRoles),
            ne(users.id, req.user!.id) // Exclude current user
          )
        );
      
      if (role && allowedRoles.includes(role as string)) {
        query = query.where(
          and(
            eq(users.role, role as any),
            ne(users.id, req.user!.id)
          )
        );
      }
      
      const baseUsers = await query;
      
      // Now get presence info for these users separately to avoid duplicates
      const userIds = baseUsers.map(user => user.id);
      const presenceData = userIds.length > 0 ? await db
        .select({
          user_id: userPresence.user_id,
          is_online: userPresence.is_online,
          last_seen: userPresence.last_seen,
        })
        .from(userPresence)
        .where(inArray(userPresence.user_id, userIds)) : [];
      
      // Merge presence data with users (handle potential duplicates by taking the first match)
      const chatUsers = baseUsers.map(user => {
        const presence = presenceData.find(p => p.user_id === user.id);
        return {
          ...user,
          is_online: presence?.is_online || false,
          last_seen: presence?.last_seen || null,
        };
      });
      
      res.json({ users: chatUsers });
    } catch (error) {
      next(error);
    }
  });

  // Public Marketplace Routes
  app.get("/api/marketplace/products", async (req, res, next) => {
    try {
      // Get all approved products for marketplace
      const allProducts = await db.select().from(products).where(eq(products.status, 'approved'));
      res.json({ products: allProducts });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/marketplace/products/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const [product] = await db.select().from(products).where(eq(products.id, parseInt(id)));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // IT Services API Routes
  
  // Service Requests
  app.post("/api/service-requests", isAuthenticated, async (req, res, next) => {
    try {
      const requestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(requestData, req.user!.id);
      res.status(201).json(serviceRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/service-requests", isAuthenticated, async (req, res, next) => {
    try {
      let requests;
      
      if (req.user?.role === 'admin') {
        requests = await storage.getAllServiceRequests();
      } else {
        requests = await storage.getServiceRequestsByClient(req.user!.id);
      }
      
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/service-requests/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const request = await storage.getServiceRequestById(parseInt(id));
      
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      // Check permissions
      if (req.user?.role !== 'admin' && request.client_id !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/service-requests/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = insertServiceRequestSchema.partial().parse(req.body);
      
      const existingRequest = await storage.getServiceRequestById(parseInt(id));
      if (!existingRequest) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      // Check permissions
      if (req.user?.role !== 'admin' && existingRequest.client_id !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedRequest = await storage.updateServiceRequest(parseInt(id), updateData);
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.put("/api/service-requests/:id/status", hasRole(['admin']), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      
      const updatedRequest = await storage.updateServiceRequestStatus(parseInt(id), status, adminNotes);
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Service Quotations
  app.post("/api/service-quotations", hasRole(['admin']), async (req, res, next) => {
    try {
      const quotationData = insertServiceQuotationSchema.parse(req.body);
      const quotation = await storage.createServiceQuotation(quotationData, req.user!.id);
      res.status(201).json(quotation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/service-quotations", isAuthenticated, async (req, res, next) => {
    try {
      const { requestId } = req.query;
      let quotations;
      
      if (requestId) {
        quotations = await storage.getServiceQuotationsByRequest(parseInt(requestId as string));
      } else if (req.user?.role === 'admin') {
        quotations = await storage.getAllServiceQuotations();
      } else {
        // Get quotations for requests created by this client
        const userRequests = await storage.getServiceRequestsByClient(req.user!.id);
        const requestIds = userRequests.map(r => r.id);
        quotations = [];
        for (const reqId of requestIds) {
          const reqQuotations = await storage.getServiceQuotationsByRequest(reqId);
          quotations.push(...reqQuotations);
        }
      }
      
      res.json(quotations);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/service-quotations/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, clientResponse } = req.body;
      
      const quotation = await storage.getServiceQuotationById(parseInt(id));
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      // Get the related service request
      const serviceRequest = await storage.getServiceRequestById(quotation.service_request_id);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Related service request not found" });
      }
      
      // Check permissions - admin or client who owns the request
      if (req.user?.role !== 'admin' && serviceRequest.client_id !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedQuotation = await storage.updateServiceQuotationStatus(parseInt(id), status, clientResponse);
      res.json(updatedQuotation);
    } catch (error) {
      next(error);
    }
  });

  // Service Projects
  app.post("/api/service-projects", hasRole(['admin']), async (req, res, next) => {
    try {
      const projectData = insertServiceProjectSchema.parse(req.body);
      const project = await storage.createServiceProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/service-projects", isAuthenticated, async (req, res, next) => {
    try {
      let projects;
      
      if (req.user?.role === 'admin') {
        projects = await storage.getAllServiceProjects();
      } else {
        projects = await storage.getServiceProjectsByClient(req.user!.id);
      }
      
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/service-projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await storage.getServiceProjectById(parseInt(id));
      
      if (!project) {
        return res.status(404).json({ message: "Service project not found" });
      }
      
      // Check permissions
      if (req.user?.role !== 'admin' && project.client_id !== req.user?.id && project.admin_id !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/service-projects/:id/progress", hasRole(['admin']), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { progress, adminNotes } = req.body;
      
      const updatedProject = await storage.updateServiceProjectProgress(parseInt(id), progress, adminNotes);
      res.json(updatedProject);
    } catch (error) {
      next(error);
    }
  });

  // Service Payments
  app.post("/api/service-payments", isAuthenticated, async (req, res, next) => {
    try {
      const paymentData = insertServicePaymentSchema.parse(req.body);
      const payment = await storage.createServicePayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/service-payments", isAuthenticated, async (req, res, next) => {
    try {
      const { quotationId } = req.query;
      let payments;
      
      if (quotationId) {
        payments = await storage.getServicePaymentsByQuotation(parseInt(quotationId as string));
      } else {
        payments = await storage.getServicePaymentsByClient(req.user!.id);
      }
      
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/service-payments/:id/status", hasRole(['admin']), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedPayment = await storage.updateServicePaymentStatus(parseInt(id), status);
      res.json(updatedPayment);
    } catch (error) {
      next(error);
    }
  });

  // Email service endpoints
  app.post("/api/email/send", isAuthenticated, async (req, res, next) => {
    try {
      const { to, subject, message, type = 'custom' } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ 
          message: "Missing required fields: to, subject, message" 
        });
      }
      
      const result = await emailService.sendEmail({
        to,
        from: 'noreply@softwarehub.com',
        subject,
        html: message
      });
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send email",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Email sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/email/welcome", adminMiddleware, async (req, res, next) => {
    try {
      const { userEmail, userName } = req.body;
      
      if (!userEmail || !userName) {
        return res.status(400).json({ 
          message: "Missing required fields: userEmail, userName" 
        });
      }
      
      const result = await emailService.sendWelcomeEmail(userEmail, userName);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send welcome email",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Welcome email sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/email/project-notification", adminMiddleware, async (req, res, next) => {
    try {
      const { userEmail, userName, projectTitle, status } = req.body;
      
      if (!userEmail || !userName || !projectTitle || !status) {
        return res.status(400).json({ 
          message: "Missing required fields: userEmail, userName, projectTitle, status" 
        });
      }
      
      const result = await emailService.sendProjectNotification(userEmail, userName, projectTitle, status);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send project notification",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Project notification sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Password Reset Email
  app.post("/api/email/password-reset", async (req, res, next) => {
    try {
      const { userEmail } = req.body;
      
      if (!userEmail) {
        return res.status(400).json({ 
          message: "Missing required field: userEmail" 
        });
      }

      // Validate email format
      const validation = emailService.validateEmail(userEmail);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: validation.error 
        });
      }

      // Check if user exists
      const userExists = await emailService.checkUserExists(userEmail);
      if (!userExists) {
        return res.status(404).json({ 
          message: "Email not found in our records" 
        });
      }

      // Generate reset token (in production, store this securely)
      const resetToken = Math.random().toString(36).substring(2, 15);
      
      const result = await emailService.sendPasswordResetEmail(userEmail, resetToken);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send password reset email",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Password reset email sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Account Activation Email
  app.post("/api/email/activation", adminMiddleware, async (req, res, next) => {
    try {
      const { userEmail, userName } = req.body;
      
      if (!userEmail || !userName) {
        return res.status(400).json({ 
          message: "Missing required fields: userEmail, userName" 
        });
      }

      // Validate email format
      const validation = emailService.validateEmail(userEmail);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: validation.error 
        });
      }

      // Generate activation token
      const activationToken = Math.random().toString(36).substring(2, 15);
      
      const result = await emailService.sendAccountActivationEmail(userEmail, userName, activationToken);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send activation email",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Activation email sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Order Confirmation Email
  app.post("/api/email/order-confirmation", isAuthenticated, async (req, res, next) => {
    try {
      const { userEmail, userName, orderDetails } = req.body;
      
      if (!userEmail || !userName || !orderDetails) {
        return res.status(400).json({ 
          message: "Missing required fields: userEmail, userName, orderDetails" 
        });
      }
      
      const result = await emailService.sendOrderConfirmationEmail(userEmail, userName, orderDetails);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send order confirmation email",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Order confirmation email sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Support Notification Email
  app.post("/api/email/support-notification", async (req, res, next) => {
    try {
      const { userEmail, subject, message } = req.body;
      const supportEmail = process.env.SUPPORT_EMAIL || 'support@softwarehub.com';
      
      if (!userEmail || !subject || !message) {
        return res.status(400).json({ 
          message: "Missing required fields: userEmail, subject, message" 
        });
      }
      
      const result = await emailService.sendSupportNotification(supportEmail, userEmail, subject, message);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send support notification",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Support notification sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Newsletter Subscription Confirmation
  app.post("/api/email/newsletter-confirmation", async (req, res, next) => {
    try {
      const { userEmail, userName } = req.body;
      
      if (!userEmail || !userName) {
        return res.status(400).json({ 
          message: "Missing required fields: userEmail, userName" 
        });
      }

      // Validate email format
      const validation = emailService.validateEmail(userEmail);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: validation.error 
        });
      }
      
      const result = await emailService.sendNewsletterSubscriptionConfirmation(userEmail, userName);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send newsletter confirmation",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Newsletter confirmation sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Account Deactivation Notice
  app.post("/api/email/account-deactivation", adminMiddleware, async (req, res, next) => {
    try {
      const { userEmail, userName } = req.body;
      
      if (!userEmail || !userName) {
        return res.status(400).json({ 
          message: "Missing required fields: userEmail, userName" 
        });
      }
      
      const result = await emailService.sendAccountDeactivationNotice(userEmail, userName);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send deactivation notice",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Deactivation notice sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Account Reactivation Notice
  app.post("/api/email/account-reactivation", adminMiddleware, async (req, res, next) => {
    try {
      const { userEmail, userName } = req.body;
      
      if (!userEmail || !userName) {
        return res.status(400).json({ 
          message: "Missing required fields: userEmail, userName" 
        });
      }
      
      const result = await emailService.sendAccountReactivationNotice(userEmail, userName);
      
      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send reactivation notice",
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        message: "Reactivation notice sent successfully" 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Marketing Email Campaign
  app.post("/api/email/marketing-campaign", adminMiddleware, async (req, res, next) => {
    try {
      const { recipients, campaignData } = req.body;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ 
          message: "Missing or invalid recipients array" 
        });
      }

      if (!campaignData) {
        return res.status(400).json({ 
          message: "Missing campaignData" 
        });
      }

      const results = [];
      let successCount = 0;
      let failCount = 0;

      // Send to each recipient
      for (const recipient of recipients) {
        try {
          const result = await emailService.sendMarketingEmail(
            recipient.email, 
            recipient.name, 
            campaignData
          );
          
          results.push({
            email: recipient.email,
            success: result.success,
            messageId: result.messageId,
            error: result.error
          });

          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error: any) {
          results.push({
            email: recipient.email,
            success: false,
            error: error.message
          });
          failCount++;
        }
      }
      
      res.json({ 
        success: true,
        summary: {
          total: recipients.length,
          successful: successCount,
          failed: failCount
        },
        results: results,
        message: `Marketing campaign completed. ${successCount} emails sent successfully, ${failCount} failed.`
      });
      
    } catch (error) {
      next(error);
    }
  });

  // Email Testing Endpoint
  app.post("/api/email/test", adminMiddleware, async (req, res, next) => {
    try {
      const { testType, userEmail, userName, ...additionalData } = req.body;
      
      if (!testType || !userEmail) {
        return res.status(400).json({ 
          message: "Missing required fields: testType, userEmail" 
        });
      }

      let result;
      
      switch (testType) {
        case 'welcome':
          result = await emailService.sendWelcomeEmail(userEmail, userName || 'Test User');
          break;
        
        case 'activation':
          const activationToken = 'test-activation-token';
          result = await emailService.sendAccountActivationEmail(userEmail, userName || 'Test User', activationToken);
          break;
        
        case 'password-reset':
          const resetToken = 'test-reset-token';
          result = await emailService.sendPasswordResetEmail(userEmail, resetToken);
          break;
        
        case 'order-confirmation':
          const orderDetails = {
            orderId: 'TEST-001',
            productName: 'Test Product',
            amount: '29.99',
            status: 'confirmed',
            ...additionalData.orderDetails
          };
          result = await emailService.sendOrderConfirmationEmail(userEmail, userName || 'Test User', orderDetails);
          break;
        
        case 'project-notification':
          result = await emailService.sendProjectNotification(
            userEmail, 
            userName || 'Test User', 
            additionalData.projectTitle || 'Test Project',
            additionalData.status || 'completed'
          );
          break;
        
        case 'newsletter-confirmation':
          result = await emailService.sendNewsletterSubscriptionConfirmation(userEmail, userName || 'Test User');
          break;
        
        case 'account-deactivation':
          result = await emailService.sendAccountDeactivationNotice(userEmail, userName || 'Test User');
          break;
        
        case 'account-reactivation':
          result = await emailService.sendAccountReactivationNotice(userEmail, userName || 'Test User');
          break;
        
        case 'marketing':
          const campaignData = {
            subject: 'Test Marketing Email',
            title: 'Special Test Offer',
            content: '<p>This is a test marketing email with special offers!</p>',
            ctaText: 'Shop Now',
            ctaUrl: 'https://example.com/shop',
            ...additionalData.campaignData
          };
          result = await emailService.sendMarketingEmail(userEmail, userName || 'Test User', campaignData);
          break;
        
        case 'support-notification':
          const supportEmail = process.env.SUPPORT_EMAIL || 'support@softwarehub.com';
          result = await emailService.sendSupportNotification(
            supportEmail,
            userEmail,
            additionalData.subject || 'Test Support Request',
            additionalData.message || 'This is a test support request message.'
          );
          break;
        
        default:
          return res.status(400).json({ 
            message: `Invalid test type: ${testType}. Supported types: welcome, activation, password-reset, order-confirmation, project-notification, newsletter-confirmation, account-deactivation, account-reactivation, marketing, support-notification` 
          });
      }
      
      if (!result.success) {
        return res.status(500).json({ 
          message: `Failed to send ${testType} test email`,
          error: result.error
        });
      }
      
      res.json({ 
        success: true, 
        messageId: result.messageId,
        testType,
        message: `${testType} test email sent successfully to ${userEmail}` 
      });
      
    } catch (error) {
      next(error);
    }
  });

  // FCM Token Registration Endpoint
  app.post("/api/notifications/register-token", isAuthenticated, async (req, res, next) => {
    try {
      const { token } = req.body;
      const userId = req.user!.id;
      
      if (!token) {
        return res.status(400).json({ message: "FCM token is required" });
      }
      
      // Store token in database (for now, just log it)
      console.log(`📱 FCM Token registered for User ${userId}: ${token.substring(0, 20)}...`);
      
      // TODO: Store in database table for user FCM tokens
      // await storage.storeFCMToken(userId, token);
      
      res.json({ success: true, message: "FCM token registered successfully" });
    } catch (error) {
      next(error);
    }
  });

  // PUSH NOTIFICATION TESTING ENDPOINTS - Using Local Service

  // Test notification endpoints using local notification service
  app.post(
    '/api/notifications/test-new-message',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        // Use form data from frontend or fallback to defaults
        const { userId, senderName, messagePreview } = req.body;
        const targetUserId = userId ? parseInt(userId) : 1;
        const sender = senderName || "Alice Johnson";
        const message = messagePreview || "Hey, how's your project coming along?";
        
        const result = await notificationService.sendNewMessageNotification(
          targetUserId,
          sender,
          message
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'new-message',
          message: `New message notification sent successfully to User ${targetUserId}`
        });
      } catch (error: any) {
        console.error('New message notification test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'new-message'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-comment',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        // Use form data from frontend or fallback to defaults
        const { userId, commenterName, contentTitle } = req.body;
        const targetUserId = userId ? parseInt(userId) : 1;
        const commenter = commenterName || "Bob Smith";
        const content = contentTitle || "Your Latest Project";
        
        const result = await notificationService.sendCommentNotification(
          targetUserId,
          commenter,
          content
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'comment',
          message: `Comment notification sent successfully to User ${targetUserId}`
        });
      } catch (error: any) {
        console.error('Comment notification test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'comment'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-maintenance-alert',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        const result = await notificationService.sendMaintenanceAlert(
          "Saturday 2:00 AM - 4:00 AM EST",
          "We'll be updating our servers."
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'maintenance-alert',
          message: 'maintenance-alert test notification sent successfully'
        });
      } catch (error: any) {
        console.error('Maintenance alert test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'maintenance-alert'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-system-update',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        const result = await notificationService.sendSystemUpdateNotification(
          "2.1.0",
          "New dashboard, improved performance, bug fixes"
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'system-update',
          message: 'system-update test notification sent successfully'
        });
      } catch (error: any) {
        console.error('System update test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'system-update'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-order-confirmation',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        // Use form data from frontend or fallback to defaults
        const { userId, orderId, amount } = req.body;
        const targetUserId = userId ? parseInt(userId) : 1;
        const orderNumber = orderId || "ORD-2024-001";
        const orderAmount = amount || "$99.99";
        
        const result = await notificationService.sendOrderConfirmation(
          targetUserId,
          orderNumber,
          orderAmount
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'order-confirmation',
          message: `Order confirmation notification sent successfully to User ${targetUserId}`
        });
      } catch (error: any) {
        console.error('Order confirmation test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'order-confirmation'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-payment-failure',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        const result = await notificationService.sendPaymentFailureNotification(
          1, // Test user ID
          "ORD-2024-001",
          "Insufficient funds"
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'payment-failure',
          message: 'payment-failure test notification sent successfully'
        });
      } catch (error: any) {
        console.error('Payment failure test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'payment-failure'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-event-reminder',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        const result = await notificationService.sendEventReminder(
          1, // Test user ID
          "Product Launch Webinar",
          "Tomorrow 3:00 PM EST"
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'event-reminder',
          message: 'event-reminder test notification sent successfully'
        });
      } catch (error: any) {
        console.error('Event reminder test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'event-reminder'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-subscription-renewal',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        const result = await notificationService.sendSubscriptionRenewalReminder(
          1, // Test user ID
          "March 15, 2024"
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'subscription-renewal',
          message: 'subscription-renewal test notification sent successfully'
        });
      } catch (error: any) {
        console.error('Subscription renewal test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'subscription-renewal'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-promotional-offer',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        const result = await notificationService.sendPromotionalOffer(
          "50% Off Premium Features",
          "Upgrade now and save big!",
          "March 31, 2024"
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'promotional-offer',
          message: 'promotional-offer test notification sent successfully'
        });
      } catch (error: any) {
        console.error('Promotional offer test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'promotional-offer'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-unusual-login',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        const result = await notificationService.sendUnusualLoginNotification(
          1, // Test user ID
          "San Francisco, CA",
          "iPhone 14"
        );

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'unusual-login',
          message: 'unusual-login test notification sent successfully'
        });
      } catch (error: any) {
        console.error('Unusual login test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'unusual-login'
        });
      }
    }
  );

  app.post(
    '/api/notifications/test-password-change',
    async (req: Request, res: Response) => {
      // Check admin role first
      if (!req.session?.userId || !req.session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userRole = req.session.user.role;
      if (!userRole || userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      try {
        const result = await notificationService.sendPasswordChangeConfirmation(1); // Test user ID

        res.json({
          success: result.success,
          messageId: result.messageId,
          testType: 'password-change',
          message: 'password-change test notification sent successfully'
        });
      } catch (error: any) {
        console.error('Password change test error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to send test notification',
          testType: 'password-change'
        });
      }
    }
  );

  // EMAIL MICROSERVICE PROXY ENDPOINTS
  const proxyToEmailService = (endpoint: string) => {
    return async (req: Request, res: Response) => {
      try {
        // Check admin role first
        if (!req.session?.userId || !req.session?.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        const userRole = req.session.user.role;
        if (!userRole || userRole !== 'admin') {
          return res.status(403).json({ message: "Admin access required" });
        }

        const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';
        const response = await fetch(`${emailServiceUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body)
        });
        
        const result = await response.json();
        res.status(response.status).json(result);
      } catch (error) {
        console.error(`Email test error for ${endpoint}:`, error);
        res.status(500).json({ 
          success: false, 
          error: `Failed to send email test: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    };
  };

  // Map all email test endpoints to the microservice
  const emailTestEndpoints = [
    '/api/email/test-welcome',
    '/api/email/test-activation',
    '/api/email/test-password-reset',
    '/api/email/test-order-confirmation',
    '/api/email/test-project-notification',
    '/api/email/test-newsletter-confirmation',
    '/api/email/test-account-deactivation',
    '/api/email/test-account-reactivation',
    '/api/email/test-marketing',
    '/api/email/test-support-notification',
    '/api/email/test-bulk'
  ];

  // Register all email test endpoints
  emailTestEndpoints.forEach(endpoint => {
    const microserviceEndpoint = endpoint.replace('/api/email/', '/api/');
    app.post(endpoint, proxyToEmailService(microserviceEndpoint));
  });

  // Object Storage Routes
  app.post("/api/objects/upload", isAuthenticated, async (req, res, next) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Cloudflare R2 Storage API Routes
  app.post("/api/r2/upload-url", isAuthenticated, async (req, res, next) => {
    try {
      const { fileName, contentType, uploadType = 'general' } = req.body;
      
      if (!fileName || !contentType) {
        return res.status(400).json({ error: "fileName and contentType are required" });
      }

      const r2Storage = getR2Storage();
      if (!r2Storage) {
        return res.status(500).json({ error: "R2 storage not configured" });
      }
      
      // Generate unique key based on uploadType
      const userId = req.user?.id;
      const timestamp = Date.now();
      const fileExtension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
      
      let fileKey: string;
      switch (uploadType) {
        case 'verification-documents':
          if (!userId) {
            return res.status(401).json({ error: "User authentication required" });
          }
          fileKey = `verification-documents/${userId}/${timestamp}-${fileName}`;
          break;
        case 'product-images':
          fileKey = `product-images/temp/${timestamp}-${fileName}`;
          break;
        case 'documents':
        default:
          fileKey = `documents/${timestamp}-${fileName}`;
          break;
      }
      
      const uploadUrl = await r2Storage.generatePresignedUploadUrl(fileKey, contentType);
      
      res.json({ 
        uploadUrl,
        fileKey 
      });
    } catch (error) {
      console.error("Error getting R2 upload URL:", error);
      res.status(500).json({ error: "Failed to get R2 upload URL" });
    }
  });

  app.post("/api/r2/download-url", isAuthenticated, async (req, res, next) => {
    try {
      const { fileKey } = req.body;
      
      if (!fileKey) {
        return res.status(400).json({ error: "fileKey is required" });
      }

      const r2Storage = getR2Storage();
      if (!r2Storage) {
        return res.status(500).json({ error: "R2 storage not configured" });
      }
      
      const downloadUrl = await r2Storage.generatePresignedDownloadUrl(fileKey);
      
      res.json({ downloadUrl });
    } catch (error) {
      console.error("Error getting R2 download URL:", error);
      res.status(500).json({ error: "Failed to get R2 download URL" });
    }
  });

  // Admin endpoint for direct document viewing (with redirect to presigned URL)
  // Admin R2 download endpoint for secure file access
  app.get("/api/r2/download", adminMiddleware, async (req, res, next) => {
    try {
      const { key } = req.query;
      
      if (!key) {
        return res.status(400).json({ error: "key parameter is required" });
      }

      const r2Storage = getR2Storage();
      if (!r2Storage) {
        return res.status(500).json({ error: "R2 storage not configured" });
      }
      
      const downloadUrl = await r2Storage.generatePresignedDownloadUrl(key as string);
      
      // Redirect to the presigned URL for direct download/viewing
      res.redirect(downloadUrl);
    } catch (error) {
      console.error("Admin R2 download error:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // Get presigned URL for image viewing (for admin dashboard)
  app.get("/api/r2/image-url", adminMiddleware, async (req, res, next) => {
    try {
      const { key } = req.query;
      
      if (!key) {
        return res.status(400).json({ error: "key parameter is required" });
      }

      const r2Storage = getR2Storage();
      if (!r2Storage) {
        return res.status(500).json({ error: "R2 storage not configured" });
      }
      
      // Generate presigned URL with longer expiration for image viewing
      const imageUrl = await r2Storage.generatePresignedDownloadUrl(key as string, 7200); // 2 hours
      
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("Admin R2 image URL error:", error);
      res.status(500).json({ error: "Failed to generate image URL" });
    }
  });

  app.get("/api/r2/file/:fileKey(*)", isAuthenticated, async (req, res, next) => {
    try {
      const { fileKey } = req.params;
      const r2Storage = getR2Storage();
      if (!r2Storage) {
        return res.status(500).json({ error: "R2 storage not configured" });
      }
      
      // Redirect to download URL
      const downloadUrl = await r2Storage.generatePresignedDownloadUrl(fileKey);
      res.redirect(downloadUrl);
    } catch (error) {
      console.error("Error downloading file from R2:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download file" });
      }
    }
  });

  app.delete("/api/r2/file/:fileKey(*)", isAuthenticated, async (req, res, next) => {
    try {
      const { fileKey } = req.params;
      const r2Storage = getR2Storage();
      if (!r2Storage) {
        return res.status(500).json({ error: "R2 storage not configured" });
      }
      
      // Note: Delete functionality would need to be implemented in the working storage class
      res.json({ success: true, message: "File deletion not implemented yet" });
    } catch (error) {
      console.error("Error deleting file from R2:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Server-side upload fallback for CORS issues
  app.post("/api/r2/server-upload", isAuthenticated, async (req, res, next) => {
    try {
      const multer = await import('multer');
      const upload = multer.default({ storage: multer.default.memoryStorage() });
      
      upload.single('file')(req, res, async (err: any) => {
        if (err) {
          return res.status(400).json({ error: "File upload error" });
        }

        const file = req.file;
        const { fileKey } = req.body;
        
        if (!file || !fileKey) {
          return res.status(400).json({ error: "File and fileKey are required" });
        }

        const r2Storage = getR2Storage();
        if (!r2Storage) {
          return res.status(500).json({ error: "R2 storage not configured" });
        }
        
        // Use the working R2 storage to upload the file
        const result = await r2Storage.uploadFile(
          file.buffer,
          fileKey,
          file.originalname,
          file.mimetype
        );
        res.json({ success: true, fileKey });
      });
    } catch (error) {
      console.error("Error in server-side R2 upload:", error);
      res.status(500).json({ error: "Server-side upload failed" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res, next) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error accessing object:", error);
      if (error.constructor.name === "ObjectNotFoundError") {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.get("/public-objects/:filePath(*)", async (req, res, next) => {
    try {
      const filePath = req.params.filePath;
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // WebSocket integration for real-time chat
  const server = createServer(app);
  const { Server } = await import('socket.io');
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Socket.IO chat handlers
  io.on('connection', (socket: any) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle user authentication
    socket.on('authenticate', async (data: { token?: string, userId?: number }) => {
      try {
        if (data.userId) {
          socket.userId = data.userId;
          
          // Update user presence
          try {
            await db.insert(userPresence).values({
              user_id: data.userId,
              is_online: true,
              socket_id: socket.id
            });
          } catch (error) {
            // User already exists, update
            await db.update(userPresence)
              .set({
                is_online: true,
                socket_id: socket.id,
                last_seen: new Date()
              })
              .where(eq(userPresence.user_id, data.userId));
          }
          
          socket.join(`user_${data.userId}`);
          socket.emit('authenticated', { success: true });
          console.log(`User ${data.userId} authenticated`);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });
    
    // Handle joining chat rooms
    socket.on('join_room', async (data: { roomId: number }) => {
      try {
        if (!socket.userId) {
          console.log('Join room failed: User not authenticated');
          return socket.emit('error', { message: 'Not authenticated' });
        }
        
        console.log(`User ${socket.userId} attempting to join room ${data.roomId}`);
        
        // Verify user is member of this room
        const membership = await db
          .select()
          .from(chatRoomMembers)
          .where(
            and(
              eq(chatRoomMembers.room_id, data.roomId),
              eq(chatRoomMembers.user_id, socket.userId)
            )
          )
          .limit(1);
        
        console.log(`Room membership check for user ${socket.userId} in room ${data.roomId}:`, membership);
        
        if (membership.length === 0) {
          console.log(`User ${socket.userId} not authorized for room ${data.roomId}`);
          return socket.emit('error', { message: 'Not authorized to join this room' });
        }
        
        socket.join(`room_${data.roomId}`);
        socket.emit('joined_room', { roomId: data.roomId });
        console.log(`✓ User ${socket.userId} successfully joined Socket.IO room room_${data.roomId}`);
        
        // Verify the user is actually in the room
        const rooms = Array.from(socket.rooms);
        console.log(`User ${socket.userId} is now in Socket.IO rooms:`, rooms);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });
    
    // Handle sending messages
    socket.on('send_message', async (data: { roomId: number, content: string, messageType?: string }) => {
      try {
        if (!socket.userId) {
          return socket.emit('error', { message: 'Not authenticated' });
        }
        
        // Verify user is member of this room
        const membership = await db
          .select()
          .from(chatRoomMembers)
          .where(
            and(
              eq(chatRoomMembers.room_id, data.roomId),
              eq(chatRoomMembers.user_id, socket.userId)
            )
          )
          .limit(1);
        
        if (membership.length === 0) {
          return socket.emit('error', { message: 'Not authorized to send to this room' });
        }
        
        // Save message to database
        const [message] = await db.insert(chatMessages).values({
          room_id: data.roomId,
          sender_id: socket.userId,
          content: data.content,
          message_type: data.messageType || 'text'
        }).returning();
        
        // Get sender details for broadcasting
        const [sender] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role
          })
          .from(users)
          .where(eq(users.id, socket.userId))
          .limit(1);
        
        const messageWithSender = {
          ...message,
          sender
        };
        
        // Broadcast message to all room members
        console.log(`Broadcasting message to Socket.IO room room_${data.roomId}:`, messageWithSender);
        io.to(`room_${data.roomId}`).emit('new_message', messageWithSender);
        
        console.log(`Message sent to room ${data.roomId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing', (data: { roomId: number, isTyping: boolean }) => {
      socket.to(`room_${data.roomId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (socket.userId) {
        // Update user presence to offline
        await db.update(userPresence)
          .set({
            is_online: false,
            last_seen: new Date()
          })
          .where(eq(userPresence.user_id, socket.userId));
      }
    });
  });

  return server;
}