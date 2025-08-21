import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertOrderSchema, insertPaymentSchema } from "@shared/schema";
import { isAuthenticated, adminMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Get orders based on user role
router.get("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Create new order
router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Get order by ID
router.get("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Update order status
router.put("/:id/status", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Payment Routes
router.get("/payments/all", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Create payment
router.post("/payments", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// Update payment status (Admin only)
router.put("/payments/:id/status", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

export default router;
