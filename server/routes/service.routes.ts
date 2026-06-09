import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, hasRole } from "../middleware/auth.middleware";
import { paymentRateLimiter, writeRateLimiter } from "../middleware/rate-limit.js";
import {
  insertServiceRequestSchema,
  insertServiceQuotationSchema,
  insertServiceProjectSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  FRONTEND_PAYMENT_METHODS,
  createPaymentLink,
  isPayosConfigured,
  payosDescription,
  serviceOrderCode,
} from "../lib/payos.js";
import {
  pruneExpiredPendingCheckouts,
  savePendingCheckout,
} from "../storage/payment/pendingCheckoutStorage.js";
import {
  notifyServiceQuotationCreated,
  notifyServiceQuotationResponded,
  notifyServiceRequestCreated,
} from "../lib/service-notifications.js";

const adminMiddleware = hasRole(["admin"]);

const CLIENT_ROLES = ["client", "buyer", "user", "admin"];

function canManageServiceRequest(
  user: { id: number; role: string },
  request: { client_id: number },
) {
  return user.role === "admin" || request.client_id === user.id;
}

function getAppBaseUrl(req: Request) {
  const configured = process.env.APP_URL || process.env.PUBLIC_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = req.get("host") || "localhost:5001";
  const protocol = req.protocol || "http";
  return `${protocol}://${host}`;
}

async function initiateServicePayment(
  req: Request,
  res: Response,
  next: (err?: unknown) => void,
  paymentType: "deposit" | "final",
) {
  try {
    if (!isPayosConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Cổng thanh toán payOS chưa được cấu hình",
      });
    }

    const { quotation_id, payment_method } = req.body as {
      quotation_id?: number;
      payment_method?: string;
    };

    if (!quotation_id) {
      return res.status(400).json({ message: "quotation_id là bắt buộc" });
    }

    if (payment_method && !FRONTEND_PAYMENT_METHODS.has(payment_method)) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
    }

    const quotation = await storage.getServiceQuotationById(quotation_id);
    if (!quotation) {
      return res.status(404).json({ message: "Không tìm thấy báo giá" });
    }

    if (quotation.status !== "accepted") {
      return res.status(400).json({ message: "Báo giá chưa được chấp nhận" });
    }

    const serviceRequest = await storage.getServiceRequestById(quotation.service_request_id);
    if (!serviceRequest || !canManageServiceRequest(req.user!, serviceRequest)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const existingPayments = await storage.getServicePaymentsByQuotation(quotation_id);
    const completedDeposit = existingPayments.find(
      (p) => p.payment_type === "deposit" && p.status === "completed",
    );
    const completedFinal = existingPayments.find(
      (p) => p.payment_type === "final" && p.status === "completed",
    );

    if (paymentType === "deposit" && completedDeposit) {
      return res.status(400).json({ message: "Tiền cọc đã được thanh toán" });
    }
    if (paymentType === "final") {
      if (!completedDeposit) {
        return res.status(400).json({ message: "Vui lòng thanh toán tiền cọc trước" });
      }
      if (completedFinal) {
        return res.status(400).json({ message: "Thanh toán cuối đã hoàn tất" });
      }
    }

    const amount =
      paymentType === "deposit"
        ? Math.round(Number(quotation.deposit_amount))
        : Math.round(Number(quotation.total_price) - Number(quotation.deposit_amount));

    if (amount < 1000) {
      return res.status(400).json({ message: "Số tiền tối thiểu là 1.000₫" });
    }

    const projects = (await storage.getAllServiceProjects()).filter(
      (p) => p.quotation_id === quotation_id,
    );
    const project = projects[0];

    const servicePayment = await storage.createServicePayment(
      {
        quotation_id,
        service_project_id: project?.id ?? null,
        amount: amount.toString(),
        payment_type: paymentType,
        payment_method: "payos",
      },
      serviceRequest.client_id,
    );

    const orderCode = serviceOrderCode(servicePayment.id);
    const baseUrl = getAppBaseUrl(req);
    const user = req.user!;

    const link = await createPaymentLink({
      orderCode,
      amount,
      description: payosDescription(paymentType === "deposit" ? "COC" : "TT", quotation_id),
      returnUrl: `${baseUrl}/services/${quotation.service_request_id}?payment=success`,
      cancelUrl: `${baseUrl}/services/${quotation.service_request_id}?payment=cancel`,
      buyerName: user.name,
      buyerEmail: user.email,
    });

    await savePendingCheckout(String(orderCode), "service_payment", {
      servicePaymentId: servicePayment.id,
      userId: user.id,
      quotationId: quotation_id,
      paymentType,
      amount,
      paymentMethod: "payos",
      orderCode,
      paymentLinkId: link.paymentLinkId,
    });
    await pruneExpiredPendingCheckouts();

    res.json({
      success: true,
      service_payment_id: servicePayment.id,
      payment_info: {
        checkout_url: link.checkoutUrl,
        qr_code: link.qrCode,
        order_code: orderCode,
        order_invoice_number: String(orderCode),
        payment_link_id: link.paymentLinkId,
        amount,
        payment_method: "payos",
      },
    });
  } catch (error) {
    next(error);
  }
}

export function registerServiceRoutes(app: Express) {
  // Create service request (logged-in clients)
  app.post("/api/service-requests", writeRateLimiter, isAuthenticated, async (req, res, next) => {
    try {
      if (!CLIENT_ROLES.includes(req.user!.role)) {
        return res.status(403).json({ message: "Bạn không có quyền gửi yêu cầu dịch vụ" });
      }

      const requestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(requestData, req.user!.id);
      notifyServiceRequestCreated(serviceRequest);
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
        const { status, priority, search } = req.query;
        requests = await storage.getEnrichedServiceRequests({
          status: status as string | undefined,
          priority: priority as string | undefined,
          search: search as string | undefined,
        });
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

      const payments = (
        await Promise.all(quotations.map((q) => storage.getServicePaymentsByQuotation(q.id)))
      ).flat();

      const client = await storage.getUser(serviceRequest.client_id);

      res.json({
        request: {
          ...serviceRequest,
          client_name: client?.name ?? "",
          client_email: client?.email ?? "",
        },
        quotations,
        projects,
        payments,
      });
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

      notifyServiceQuotationCreated(quotation, serviceRequest.client_id);
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

      notifyServiceQuotationResponded(quotation, action, serviceRequest.client_id);

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

  app.get("/api/service-payments/quotation/:quotationId", isAuthenticated, async (req, res, next) => {
    try {
      const quotationId = parseInt(req.params.quotationId, 10);
      const quotation = await storage.getServiceQuotationById(quotationId);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }

      const serviceRequest = await storage.getServiceRequestById(quotation.service_request_id);
      if (!serviceRequest || !canManageServiceRequest(req.user!, serviceRequest)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const payments = await storage.getServicePaymentsByQuotation(quotationId);
      res.json({ payments });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/service-payments/deposit", paymentRateLimiter, isAuthenticated, async (req, res, next) => {
    await initiateServicePayment(req, res, next, "deposit");
  });

  app.post("/api/service-payments/final", paymentRateLimiter, isAuthenticated, async (req, res, next) => {
    await initiateServicePayment(req, res, next, "final");
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
