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
  insertPaymentSchema, insertProductReviewSchema, insertExternalRequestSchema
} from "@shared/schema";

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

  // Phase 2: Projects Routes
  function isDeveloper(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.role !== 'developer') {
      return res.status(403).json({ message: "Forbidden: Developer access required" });
    }
    
    next();
  }

  function isClient(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.role !== 'client') {
      return res.status(403).json({ message: "Forbidden: Client access required" });
    }
    
    next();
  }

  // Project Routes
  app.post("/api/projects", isClient, async (req, res, next) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const clientId = req.user!.id;
      
      const project = await storage.createProject(projectData, clientId);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/projects/client", isClient, async (req, res, next) => {
    try {
      const clientId = req.user!.id;
      const projects = await storage.getProjectsByClientId(clientId);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/available", isDeveloper, async (req, res, next) => {
    try {
      const { status, page = "1", limit = "10" } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getProjectsForDevelopers(
        status as string, 
        limitNum,
        offset
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id, 10);
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is the client who owns the project or a developer
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      if (project.client_id !== userId && userRole !== 'developer' && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You don't have access to this project" });
      }
      
      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/projects/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be one of: pending, in_progress, completed, cancelled" });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is the client who owns the project or admin
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      if (project.client_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this project" });
      }
      
      const updatedProject = await storage.updateProjectStatus(projectId, status);
      res.json(updatedProject);
    } catch (error) {
      next(error);
    }
  });

  // Quotes Routes
  app.post("/api/quotes", isDeveloper, async (req, res, next) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const developerId = req.user!.id;
      
      // Verify that the project exists
      const project = await storage.getProjectById(quoteData.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const quote = await storage.createQuote(quoteData, developerId);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/quotes/project/:project_id", isAuthenticated, async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.project_id, 10);
      
      // Verify that the project exists
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is the client who owns the project, the developer who submitted a quote, or admin
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      if (project.client_id !== userId && userRole !== 'developer' && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You don't have access to quotes for this project" });
      }
      
      const quotes = await storage.getQuotesByProjectId(projectId);
      res.json(quotes);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/quotes/developer", isDeveloper, async (req, res, next) => {
    try {
      const developerId = req.user!.id;
      const quotes = await storage.getQuotesByDeveloperId(developerId);
      res.json(quotes);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/quotes/:id/status", isClient, async (req, res, next) => {
    try {
      const quoteId = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be one of: pending, accepted, rejected" });
      }
      
      // Get the quote
      const quote = await storage.getQuotesByProjectId(quoteId);
      if (!quote || quote.length === 0) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Verify that the client owns the project
      const project = await storage.getProjectById(quote[0].project_id);
      if (!project || project.client_id !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this quote" });
      }
      
      const updatedQuote = await storage.updateQuoteStatus(quoteId, status);
      
      // If accepting a quote, update the project status to in_progress
      if (status === 'accepted') {
        await storage.updateProjectStatus(project.id, 'in_progress');
      }
      
      res.json(updatedQuote);
    } catch (error) {
      next(error);
    }
  });

  // Messages Routes
  app.post("/api/messages", isAuthenticated, async (req, res, next) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const senderId = req.user!.id;
      
      // Verify that the project exists
      const project = await storage.getProjectById(messageData.project_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is the client who owns the project, a developer with an accepted quote, or admin
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      if (project.client_id !== userId && userRole !== 'developer' && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You don't have permission to send messages to this project" });
      }
      
      const message = await storage.sendMessage(messageData, senderId);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/messages/project/:project_id", isAuthenticated, async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.project_id, 10);
      
      // Verify that the project exists
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user is the client who owns the project, a developer with an accepted quote, or admin
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      if (project.client_id !== userId && userRole !== 'developer' && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You don't have access to messages for this project" });
      }
      
      const messages = await storage.getMessagesByProjectId(projectId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Portfolios Routes
  app.post("/api/portfolios", isDeveloper, async (req, res, next) => {
    try {
      const portfolioData = insertPortfolioSchema.parse(req.body);
      const developerId = req.user!.id;
      
      const portfolio = await storage.createPortfolio(portfolioData, developerId);
      res.status(201).json(portfolio);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/portfolios", async (req, res, next) => {
    try {
      const { page = "1", limit = "12" } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getAllPortfolios(limitNum, offset);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/portfolios/developer/:developer_id", async (req, res, next) => {
    try {
      const developerId = parseInt(req.params.developer_id, 10);
      const portfolios = await storage.getPortfoliosByDeveloperId(developerId);
      res.json(portfolios);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/portfolios/:id", async (req, res, next) => {
    try {
      const portfolioId = parseInt(req.params.id, 10);
      const portfolio = await storage.getPortfolioById(portfolioId);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      res.json(portfolio);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/portfolios/:id", isDeveloper, async (req, res, next) => {
    try {
      const portfolioId = parseInt(req.params.id, 10);
      const portfolioData = insertPortfolioSchema.partial().parse(req.body);
      const developerId = req.user!.id;
      
      // Verify that the developer owns the portfolio
      const portfolio = await storage.getPortfolioById(portfolioId);
      if (!portfolio || portfolio.developer_id !== developerId) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this portfolio" });
      }
      
      const updatedPortfolio = await storage.updatePortfolio(portfolioId, portfolioData);
      res.json(updatedPortfolio);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.delete("/api/portfolios/:id", isDeveloper, async (req, res, next) => {
    try {
      const portfolioId = parseInt(req.params.id, 10);
      const developerId = req.user!.id;
      
      const success = await storage.deletePortfolio(portfolioId, developerId);
      
      if (!success) {
        return res.status(404).json({ message: "Portfolio not found or you don't have permission to delete it" });
      }
      
      res.json({ message: "Portfolio deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Portfolio Reviews Routes
  app.post("/api/portfolio-reviews", isAuthenticated, async (req, res, next) => {
    try {
      const reviewData = insertPortfolioReviewSchema.parse(req.body);
      const userId = req.user!.id;
      
      // Verify that the portfolio exists
      const portfolio = await storage.getPortfolioById(reviewData.portfolio_id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      const review = await storage.createPortfolioReview(reviewData, userId);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/portfolio-reviews/:portfolio_id", async (req, res, next) => {
    try {
      const portfolioId = parseInt(req.params.portfolio_id, 10);
      const reviews = await storage.getPortfolioReviewsByPortfolioId(portfolioId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/portfolio-reviews/:id", isAuthenticated, async (req, res, next) => {
    try {
      const reviewId = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      
      const success = await storage.deletePortfolioReview(reviewId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Review not found or you don't have permission to delete it" });
      }
      
      res.json({ message: "Portfolio review deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Phase 3: Marketplace Routes
  function isSeller(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.role !== 'seller') {
      return res.status(403).json({ message: "Forbidden: Seller access required" });
    }
    
    next();
  }

  function isBuyer(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user?.role !== 'buyer') {
      return res.status(403).json({ message: "Forbidden: Buyer access required" });
    }
    
    next();
  }

  // Products Routes
  app.post("/api/products", isSeller, async (req, res, next) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const sellerId = req.user!.id;
      
      const product = await storage.createProduct(productData, sellerId);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/products", async (req, res, next) => {
    try {
      const { category, search, page = "1", limit = "12" } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;
      
      let result;
      
      if (search) {
        result = await storage.searchProducts(search as string, limitNum, offset);
      } else if (category) {
        result = await storage.getProductsByCategory(category as string, limitNum, offset);
      } else {
        // Default to getting all products with pagination
        result = await storage.searchProducts("", limitNum, offset);
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/seller", isSeller, async (req, res, next) => {
    try {
      const sellerId = req.user!.id;
      const products = await storage.getProductsBySellerId(sellerId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", async (req, res, next) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/products/:id", isSeller, async (req, res, next) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const productData = insertProductSchema.partial().parse(req.body);
      const sellerId = req.user!.id;
      
      const updatedProduct = await storage.updateProduct(productId, productData, sellerId);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found or you don't have permission to update it" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.delete("/api/products/:id", isSeller, async (req, res, next) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const sellerId = req.user!.id;
      
      const success = await storage.deleteProduct(productId, sellerId);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found or you don't have permission to delete it" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Orders Routes
  app.post("/api/orders", isBuyer, async (req, res, next) => {
    try {
      const { order, items } = req.body;
      
      const orderData = insertOrderSchema.parse(order);
      const orderItems = items.map((item: any) => insertOrderItemSchema.parse(item));
      
      const buyerId = req.user!.id;
      
      const createdOrder = await storage.createOrder(orderData, orderItems, buyerId);
      res.status(201).json(createdOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/orders/buyer", isBuyer, async (req, res, next) => {
    try {
      const buyerId = req.user!.id;
      const orders = await storage.getOrdersByBuyerId(buyerId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/seller", isSeller, async (req, res, next) => {
    try {
      const sellerId = req.user!.id;
      const orders = await storage.getOrdersBySellerId(sellerId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the user is the buyer, seller, or admin
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      if (order.buyer_id !== userId && userRole !== 'seller' && userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You don't have access to this order" });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/orders/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status. Must be one of: pending, processing, shipped, delivered, completed, cancelled" 
        });
      }
      
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permissions based on status change
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      // Buyers can only cancel an order or mark it as received
      if (userRole === 'buyer') {
        if (status !== 'cancelled' && status !== 'delivered') {
          return res.status(403).json({ 
            message: "Forbidden: Buyers can only cancel orders or mark them as delivered" 
          });
        }
        
        // Buyer must be the owner of the order
        if (order.buyer_id !== userId) {
          return res.status(403).json({ 
            message: "Forbidden: You don't have permission to update this order" 
          });
        }
      } 
      // Sellers can update to processing, shipped 
      else if (userRole === 'seller') {
        if (status !== 'processing' && status !== 'shipped') {
          return res.status(403).json({ 
            message: "Forbidden: Sellers can only update orders to processing or shipped" 
          });
        }
      }
      // Admin can update to any status
      else if (userRole !== 'admin') {
        return res.status(403).json({ 
          message: "Forbidden: You don't have permission to update this order" 
        });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });

  // Payments Routes
  app.post("/api/payments", isAuthenticated, async (req, res, next) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      
      // Check if the order exists
      const order = await storage.getOrderById(paymentData.order_id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // For security, validate that the buyer is making the payment
      if (req.user!.role === 'buyer' && order.buyer_id !== req.user!.id) {
        return res.status(403).json({ 
          message: "Forbidden: You don't have permission to make a payment for this order" 
        });
      }
      
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/payments/order/:order_id", isAuthenticated, async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.order_id, 10);
      
      // Check if the order exists
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permissions
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      if (order.buyer_id !== userId && userRole !== 'seller' && userRole !== 'admin') {
        return res.status(403).json({ 
          message: "Forbidden: You don't have access to payments for this order" 
        });
      }
      
      const payments = await storage.getPaymentsByOrderId(orderId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments/:id/release-escrow", isBuyer, async (req, res, next) => {
    try {
      const paymentId = parseInt(req.params.id, 10);
      const buyerId = req.user!.id;
      
      const payment = await storage.releaseEscrow(paymentId, buyerId);
      
      if (!payment) {
        return res.status(404).json({ 
          message: "Payment not found or you don't have permission to release this escrow" 
        });
      }
      
      res.json(payment);
    } catch (error) {
      next(error);
    }
  });

  // Product Reviews Routes
  app.post("/api/product-reviews", isBuyer, async (req, res, next) => {
    try {
      const reviewData = insertProductReviewSchema.parse(req.body);
      const buyerId = req.user!.id;
      
      // Verify that the product exists
      const product = await storage.getProductById(reviewData.product_id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const review = await storage.createProductReview(reviewData, buyerId);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/product-reviews/:product_id", async (req, res, next) => {
    try {
      const productId = parseInt(req.params.product_id, 10);
      const reviews = await storage.getProductReviewsByProductId(productId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/product-reviews/:id", isBuyer, async (req, res, next) => {
    try {
      const reviewId = parseInt(req.params.id, 10);
      const buyerId = req.user!.id;
      
      const success = await storage.deleteProductReview(reviewId, buyerId);
      
      if (!success) {
        return res.status(404).json({ 
          message: "Review not found or you don't have permission to delete it" 
        });
      }
      
      res.json({ message: "Product review deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // External Project Requests Routes
  app.post("/api/external-requests", async (req, res, next) => {
    try {
      const requestData = insertExternalRequestSchema.parse(req.body);
      
      const request = await storage.createExternalRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/external-requests", isAdmin, async (req, res, next) => {
    try {
      const { status, page = "1", limit = "10" } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;
      
      const result = await storage.getExternalRequests(
        status as string, 
        limitNum,
        offset
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/external-requests/:id", isAdmin, async (req, res, next) => {
    try {
      const requestId = parseInt(req.params.id, 10);
      const request = await storage.getExternalRequestById(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "External request not found" });
      }
      
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/external-requests/:id/status", isAdmin, async (req, res, next) => {
    try {
      const requestId = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected', 'converted'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be one of: pending, approved, rejected, converted" });
      }
      
      const request = await storage.updateExternalRequestStatus(requestId, status);
      
      if (!request) {
        return res.status(404).json({ message: "External request not found" });
      }
      
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/external-requests/:id/convert", isAdmin, async (req, res, next) => {
    try {
      const requestId = parseInt(req.params.id, 10);
      const projectData = insertProjectSchema.parse(req.body);
      
      const project = await storage.convertExternalRequestToProject(requestId, projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
