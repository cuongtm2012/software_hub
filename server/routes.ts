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
  insertSupportTicketSchema, insertSalesAnalyticsSchema
} from "@shared/schema";
import { z } from "zod";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
}

// Role-based access control middleware
function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!roles.includes(req.user?.role as string)) {
      return res.status(403).json({ message: `Forbidden: Required role not assigned` });
    }
    
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
        (email === "admin@gmail.com" && password === "abcd@1234");
      
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
        message: "Login successful", 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
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
      const { limit = 50, offset = 0, status } = req.query;
      const result = await storage.getSoftwareList({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        status: status as 'pending' | 'approved' | 'rejected' | undefined
      });
      res.json(result);
    } catch (error) {
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
      const softwareId = parseInt(id);
      
      // Get existing software to update it
      const existingSoftware = await storage.getSoftwareById(softwareId);
      if (!existingSoftware) {
        return res.status(404).json({ message: "Software not found" });
      }

      // Validate the update data (partial schema)
      const updateData = req.body;
      if (updateData.category_id) {
        updateData.category_id = parseInt(updateData.category_id);
      }

      // Update the software in storage (you'll need to implement this method)
      const updatedSoftware = await storage.updateSoftware(softwareId, updateData);
      
      res.json({ software: updatedSoftware });
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
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
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
  
  app.post("/api/softwares", isAuthenticated, async (req, res, next) => {
    try {
      const insertData = insertSoftwareSchema.parse({
        ...req.body,
        author_id: req.user?.id
      });
      
      const software = await storage.createSoftware(insertData);
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
      
      if (software.author_id !== req.user?.id && req.user?.role !== 'admin') {
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
      
      if (software.author_id !== req.user?.id && req.user?.role !== 'admin') {
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
        project.developer_id !== req.user?.id
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
        project.developer_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "You do not have permission to view quotes for this project" });
      }
      
      const quotes = await storage.getProjectQuotes(parseInt(id));
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
        project.developer_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "You do not have permission to view messages for this project" });
      }
      
      const messages = await storage.getProjectMessages(parseInt(id));
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
        project.developer_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "You do not have permission to send messages for this project" });
      }
      
      const insertData = insertMessageSchema.parse({
        ...req.body,
        project_id: parseInt(id),
        sender_id: req.user?.id
      });
      
      const message = await storage.createMessage(insertData);
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
      const externalRequests = []; // TODO: Implement external requests feature
      res.json(externalRequests);
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
      const insertData = insertSellerProfileSchema.parse({
        ...req.body,
        verification_status: "pending"
      });
      
      const sellerProfile = await storage.createSellerProfile(insertData, req.user!.id);
      res.status(201).json({ seller_profile: sellerProfile });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
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
      const products = await storage.getProductsBySellerId(req.user!.id);
      res.json({ products });
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
  app.get("/api/admin/sellers/verification", adminMiddleware, async (req, res, next) => {
    try {
      const sellers = await storage.getAllSellersForVerification();
      res.json({ sellers });
    } catch (error) {
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



  const httpServer = createServer(app);

  return httpServer;
}