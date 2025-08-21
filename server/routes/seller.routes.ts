import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertSellerProfileSchema, insertProductSchema } from "@shared/schema";
import { isAuthenticated, adminMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Seller Statistics
router.get("/stats", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await storage.getSellerStatistics(req.user!.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Seller Registration
router.post("/register", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Get Seller Profile
router.get("/profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerProfile = await storage.getSellerProfile(req.user!.id);
    res.json({ seller_profile: sellerProfile });
  } catch (error) {
    next(error);
  }
});

// Update Seller Profile
router.put("/profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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
router.post("/products", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is a verified seller
    const sellerProfile = await storage.getSellerProfile(req.user!.id);
    if (!sellerProfile || sellerProfile.verification_status !== 'verified') {
      return res.status(403).json({ message: "Only verified sellers can add products" });
    }

    const insertData = insertProductSchema.parse({
      ...req.body,
      status: "pending"
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

// Get Seller Products
router.get("/products", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = "1",
      limit = "50",
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

// Update Seller Product
router.put("/products/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    console.log(`🔧 Seller product update request - Product ID: ${id}, Seller ID: ${req.user!.id}`);
    console.log('📦 Update data received:', JSON.stringify(req.body, null, 2));

    // Validate that the product exists and belongs to the seller
    const existingProduct = await storage.getProductById(parseInt(id));

    if (!existingProduct) {
      console.log(`❌ Product ${id} not found`);
      return res.status(404).json({ message: "Product not found" });
    }

    if (existingProduct.seller_id !== req.user!.id) {
      console.log(`❌ Unauthorized: Product ${id} belongs to seller ${existingProduct.seller_id}, not ${req.user!.id}`);
      return res.status(403).json({ message: "Unauthorized: You can only update your own products" });
    }

    const updateData = insertProductSchema.partial().parse(req.body);
    console.log('✅ Validated update data:', JSON.stringify(updateData, null, 2));

    const product = await storage.updateProduct(parseInt(id), updateData, req.user!.id);

    if (!product) {
      console.log(`❌ Update failed for product ${id}`);
      return res.status(404).json({ message: "Failed to update product or unauthorized" });
    }

    console.log(`✅ Product ${id} updated successfully by seller ${req.user!.id}`);
    res.json({ product });
  } catch (error) {
    console.error('❌ Seller product update error:', error);
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      console.error('Validation error details:', validationError.message);
      res.status(400).json({ message: validationError.message });
    } else {
      next(error);
    }
  }
});

// Delete Seller Product
router.delete("/products/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Seller Orders
router.get("/orders", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await storage.getOrdersBySellerId(req.user!.id);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

// Seller Analytics
router.get("/analytics", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

export default router;
