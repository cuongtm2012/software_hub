import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, hasRole } from "../middleware/auth.middleware";
import {
  insertServiceRequestSchema,
  insertServiceQuotationSchema,
  insertServiceProjectSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const adminMiddleware = hasRole(["admin"]);

const CLIENT_ROLES = ["client", "buyer", "user", "admin"];

function canManageServiceRequest(
  user: { id: number; role: string },
  request: { client_id: number },
) {
  return user.role === "admin" || request.client_id === user.id;
}

export function registerServiceRoutes(app: Express) {
  // Create service request (logged-in clients)
  app.post("/api/service-requests", isAuthenticated, async (req, res, next) => {
    try {
      if (!CLIENT_ROLES.includes(req.user!.role)) {
        return res.status(403).json({ message: "Bạn không có quyền gửi yêu cầu dịch vụ" });
      }

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

      if (req.user?.role === "admin") {
        requests = await storage.getAllServiceRequests();
      } else if (CLIENT_ROLES.includes(req.user!.role)) {
        requests = await storage.getClientServiceRequests(req.user!.id);
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
      const id = parseInt(req.params.id, 10);
      const serviceRequest = await storage.getServiceRequestById(id);

      if (!serviceRequest) {
        return res.status(404).json({ message: "Service request not found" });
      }

      if (!canManageServiceRequest(req.user!, serviceRequest)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const quotations = await storage.getServiceQuotations(id);
      const projects = (await storage.getAllServiceProjects()).filter(
        (p) => p.service_request_id === id,
      );

      res.json({ request: serviceRequest, quotations, projects });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/service-requests/:id/status", adminMiddleware, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, admin_notes } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedRequest = await storage.updateServiceRequestStatus(id, status, admin_notes);
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Admin creates quotation for a service request
  app.post("/api/service-requests/:id/quotations", adminMiddleware, async (req, res, next) => {
    try {
      const requestId = parseInt(req.params.id, 10);
      const serviceRequest = await storage.getServiceRequestById(requestId);

      if (!serviceRequest) {
        return res.status(404).json({ message: "Service request not found" });
      }

      const quotationData = insertServiceQuotationSchema.parse({
        ...req.body,
        service_request_id: requestId,
      });

      const quotation = await storage.createServiceQuotation(quotationData, req.user!.id);

      if (serviceRequest.status === "submitted") {
        await storage.updateServiceRequestStatus(requestId, "quoted");
      }

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
      const requestId = parseInt(req.params.id, 10);
      const serviceRequest = await storage.getServiceRequestById(requestId);

      if (!serviceRequest) {
        return res.status(404).json({ message: "Service request not found" });
      }

      if (!canManageServiceRequest(req.user!, serviceRequest)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const quotations = await storage.getServiceQuotations(requestId);
      res.json({ quotations });
    } catch (error) {
      next(error);
    }
  });

  // Client accepts or rejects a quotation
  app.put("/api/service-quotations/:id/respond", isAuthenticated, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { action, client_response } = req.body as {
        action?: "accept" | "reject";
        client_response?: string;
      };

      if (!action || !["accept", "reject"].includes(action)) {
        return res.status(400).json({ message: "action must be accept or reject" });
      }

      const quotation = await storage.getServiceQuotationById(id);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }

      const serviceRequest = await storage.getServiceRequestById(quotation.service_request_id);
      if (!serviceRequest || !canManageServiceRequest(req.user!, serviceRequest)) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (quotation.status !== "pending") {
        return res.status(400).json({ message: "Quotation already responded" });
      }

      const newStatus = action === "accept" ? "accepted" : "rejected";
      const updatedQuotation = await storage.updateServiceQuotationStatus(
        id,
        newStatus,
        client_response,
      );

      if (action === "accept") {
        await storage.updateServiceRequestStatus(quotation.service_request_id, "accepted");

        const milestones =
          quotation.deliverables?.map((title, index) => ({
            id: index + 1,
            title,
            completed: false,
          })) ?? [];

        await storage.createServiceProject({
          quotation_id: id,
          service_request_id: quotation.service_request_id,
          client_id: serviceRequest.client_id,
          admin_id: quotation.admin_id,
          milestones,
          progress_percentage: 0,
        });

        await storage.updateServiceRequestStatus(quotation.service_request_id, "in_progress");
      } else {
        await storage.updateServiceRequestStatus(quotation.service_request_id, "under_review");
      }

      res.json(updatedQuotation);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/service-projects", isAuthenticated, async (req, res, next) => {
    try {
      let projects;

      if (req.user?.role === "admin") {
        projects = await storage.getAllServiceProjects();
      } else if (CLIENT_ROLES.includes(req.user!.role)) {
        projects = await storage.getClientServiceProjects(req.user!.id);
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
      const id = parseInt(req.params.id, 10);
      const project = await storage.getServiceProjectById(id);

      if (!project) {
        return res.status(404).json({ message: "Service project not found" });
      }

      if (req.user?.role !== "admin" && project.client_id !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/service-projects/:id/progress", adminMiddleware, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { progress_percentage, admin_notes, status } = req.body;

      let project = await storage.getServiceProjectById(id);
      if (!project) {
        return res.status(404).json({ message: "Service project not found" });
      }

      if (typeof progress_percentage === "number") {
        project = await storage.updateServiceProjectProgress(
          id,
          Math.min(100, Math.max(0, progress_percentage)),
          admin_notes,
        );
      }

      if (status) {
        project = await storage.updateServiceProject(id, { status });
        if (status === "completed") {
          await storage.updateServiceRequestStatus(project!.service_request_id, "completed");
        }
      }

      res.json(project);
    } catch (error) {
      next(error);
    }
  });
}
