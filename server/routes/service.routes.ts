import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, hasRole } from "../middleware/auth.middleware";
import { insertServiceRequestSchema, insertServiceQuotationSchema, insertServiceProjectSchema, insertServicePaymentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const adminMiddleware = hasRole(['admin']);

export function registerServiceRoutes(app: Express) {
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
      } else if (req.user?.role === 'client') {
        requests = await storage.getClientServiceRequests(req.user.id);
      } else if (req.user?.role === 'developer') {
        requests = await storage.getAvailableServiceRequests();
      } else {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      res.json({ requests });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/service-requests/:id", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const serviceRequest = await storage.getServiceRequestById(parseInt(id));
      
      if (!serviceRequest) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      if (
        req.user?.role !== 'admin' && 
        serviceRequest.client_id !== req.user?.id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(serviceRequest);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/service-requests/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedRequest = await storage.updateServiceRequestStatus(parseInt(id), status);
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Service Quotations
  app.post("/api/service-requests/:id/quotations", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      
      if (req.user?.role !== 'developer' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Only developers can submit quotations" });
      }
      
      const quotationData = insertServiceQuotationSchema.parse({
        ...req.body,
        service_request_id: parseInt(id),
        developer_id: req.user?.id
      });
      
      const quotation = await storage.createServiceQuotation(quotationData);
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

  app.get("/api/service-requests/:id/quotations", isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
      const quotations = await storage.getServiceQuotations(parseInt(id));
      res.json({ quotations });
    } catch (error) {
      next(error);
    }
  });

  // Service Projects
  app.get("/api/service-projects", isAuthenticated, async (req, res, next) => {
    try {
      let projects;
      
      if (req.user?.role === 'admin') {
        projects = await storage.getAllServiceProjects();
      } else if (req.user?.role === 'client') {
        projects = await storage.getClientServiceProjects(req.user.id);
      } else if (req.user?.role === 'developer') {
        projects = await storage.getDeveloperServiceProjects(req.user.id);
      } else {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      res.json({ projects });
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
      
      res.json(project);
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
}
