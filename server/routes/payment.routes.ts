import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, hasRole } from "../middleware/auth.middleware";
import { insertPaymentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const adminMiddleware = hasRole(['admin']);

export function registerPaymentRoutes(app: Express) {
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
}
