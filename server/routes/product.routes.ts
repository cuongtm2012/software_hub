import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertProductSchema } from "@shared/schema";
import { isAuthenticated, adminMiddleware, sellerMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public - Get all products
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
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

// Public - Get product by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
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

// Authenticated - Create product (Sellers only)
router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Authenticated - Update product
router.put("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Authenticated - Delete product
router.delete("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Authenticated - Purchase product
router.post("/:id/purchase", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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
    
    // Create order with order items
    const orderItems = [{
      order_id: 0,
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
    
    // Update product stock
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

// Public Marketplace Routes
router.get("/marketplace/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allProducts = await db.select().from(products).where(eq(products.status, 'approved'));
    
    console.log(`📦 Marketplace products fetched: ${allProducts.length} approved products`);
    res.json({ products: allProducts });
  } catch (error) {
    console.error('Marketplace products error:', error);
    next(error);
  }
});

router.get("/marketplace/products/:id", async (req: Request, res: Response, next: NextFunction) => {
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

export default router;
