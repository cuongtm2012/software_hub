import type { Express, Request, Response } from "express";
import { prisma } from "../database/prisma";
import { z } from "zod";

// Middleware to check authentication
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.session.userId || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = req.session.user;
  next();
}

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  stock_quantity: z.number().int().nonnegative("Stock must be non-negative").optional(),
  sku: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).optional(),
});

const updateProductSchema = createProductSchema.partial();

export function registerProductRoutes(app: Express) {
  // Get all products (public)
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { 
        page = "1", 
        limit = "10", 
        category, 
        search,
        status = "active",
        sort = "newest"
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      // Build where clause
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (category) {
        where.category = category;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      
      // Build orderBy
      let orderBy: any = {};
      switch (sort) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'name':
          orderBy = { name: 'asc' };
          break;
        case 'newest':
        default:
          orderBy = { created_at: 'desc' };
          break;
      }
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }),
        prisma.product.count({ where })
      ]);
      
      res.json({
        products,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get single product by ID (public)
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create product (authenticated sellers only)
  app.post("/api/products", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check if user is a seller
      if (req.user?.role !== 'seller' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only sellers can create products" });
      }
      
      const validatedData = createProductSchema.parse(req.body);
      
      const product = await prisma.product.create({
        data: {
          ...validatedData,
          seller_id: req.user.id,
          status: validatedData.status || 'draft',
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Create product error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update product (owner or admin only)
  app.put("/api/products/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if product exists and user has permission
      const existingProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.seller_id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to update this product" });
      }
      
      const validatedData = updateProductSchema.parse(req.body);
      
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: validatedData,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Update product error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete product (owner or admin only)
  app.delete("/api/products/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if product exists and user has permission
      const existingProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.seller_id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to delete this product" });
      }
      
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get seller's products (authenticated seller)
  app.get("/api/seller/products", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (req.user?.role !== 'seller' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { 
        page = "1", 
        limit = "50", 
        status,
        search 
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      const where: any = { seller_id: req.user.id };
      
      if (status) {
        where.status = status;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.product.count({ where })
      ]);
      
      res.json({
        products,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      console.error("Get seller products error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Product Reviews
  app.get("/api/products/:id/reviews", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const reviews = await prisma.productReview.findMany({
        where: { product_id: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });
      
      res.json(reviews);
    } catch (error) {
      console.error("Get product reviews error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/products/:id/reviews", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      // Check if user already reviewed this product
      const existingReview = await prisma.productReview.findFirst({
        where: {
          product_id: parseInt(id),
          user_id: req.user!.id
        }
      });
      
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }
      
      const review = await prisma.productReview.create({
        data: {
          product_id: parseInt(id),
          user_id: req.user!.id,
          rating,
          comment
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Create product review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
