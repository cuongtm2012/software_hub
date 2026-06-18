import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertSoftwareSchema, insertCategorySchema } from "@shared/schema";
import { adminMiddleware } from "../middleware/auth.middleware";
import { queueManager } from "../lib/queue.js";
import {
  getDeepseekSettingsPublic,
  saveDeepseekSettings,
} from "../lib/deepseek-settings.js";
import { getGaSettingsPublic, saveGaSettings } from "../lib/ga-settings.js";
import { deepseekChatCompletion } from "../lib/deepseek.js";

const router = Router();

// ============ Queue Management ============

router.get("/queue/stats", adminMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const queues = queueManager.getRegisteredQueues();
    const statsEntries = await Promise.all(
      queues.map(async (name) => [name, await queueManager.getStats(name)] as const),
    );

    const stats = Object.fromEntries(statsEntries);
    res.json({ queues, stats });
  } catch (error) {
    next(error);
  }
});

router.post("/queue/:queueName/retry-failed", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { queueName } = req.params;
    const limit = Number(req.body?.limit) || 50;

    const queues = queueManager.getRegisteredQueues();
    if (!queues.includes(queueName)) {
      return res.status(404).json({ message: "Queue not found" });
    }

    const retried = await queueManager.retryFailedJobs(queueName, limit);
    res.json({
      success: true,
      queue: queueName,
      retried,
      message: `Retried ${retried} failed job(s)`
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/queue/:queueName/failed", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { queueName } = req.params;
    const queues = queueManager.getRegisteredQueues();
    if (!queues.includes(queueName)) {
      return res.status(404).json({ message: "Queue not found" });
    }

    const removed = await queueManager.clearFailedJobs(queueName);
    res.json({
      success: true,
      queue: queueName,
      removed,
      message: `Cleared ${removed} failed job(s)`
    });
  } catch (error) {
    next(error);
  }
});

// ============ App Settings ============

router.get("/settings/deepseek", adminMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getDeepseekSettingsPublic();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put("/settings/deepseek", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apiKey, baseUrl, model, clearApiKey } = req.body ?? {};
    const settings = await saveDeepseekSettings({
      apiKey: typeof apiKey === "string" ? apiKey : undefined,
      baseUrl: typeof baseUrl === "string" ? baseUrl : undefined,
      model: typeof model === "string" ? model : undefined,
      clearApiKey: clearApiKey === true,
    });
    res.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không lưu được cài đặt DeepSeek";
    console.error("Save DeepSeek settings failed:", error);
    res.status(500).json({ message });
  }
});

router.post("/settings/deepseek/test", adminMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reply = await deepseekChatCompletion({
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      max_tokens: 16,
      temperature: 0,
    });
    res.json({ ok: true, reply: reply.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "DeepSeek test failed";
    res.status(502).json({ ok: false, message });
  }
});

router.get("/settings/ga4", adminMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getGaSettingsPublic();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put("/settings/ga4", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { measurementId, clearMeasurementId } = req.body ?? {};
    const settings = await saveGaSettings({
      measurementId: typeof measurementId === "string" ? measurementId : undefined,
      clearMeasurementId: clearMeasurementId === true,
    });
    res.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không lưu được cài đặt GA4";
    console.error("Save GA4 settings failed:", error);
    res.status(500).json({ message });
  }
});

// ============ Dashboard Statistics ============

// Get admin dashboard statistics
router.get("/stats", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await storage.getAdminStatistics();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// ============ Notification Management ============

// Broadcast notification to users
router.post("/notifications/broadcast", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, target } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!['all', 'seller', 'buyer'].includes(target)) {
      return res.status(400).json({ message: "Invalid target. Must be: all, seller, or buyer" });
    }

    // Create notification for target users
    const result = await storage.broadcastNotification({
      message: message.trim(),
      target,
      senderId: req.user?.id as number,
    });

    res.json({
      success: true,
      recipientCount: result.recipientCount,
      message: "Notification sent successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get notification history
router.get("/notifications/history", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const result = await storage.getNotificationHistory({
      limit: limitNum,
      offset,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============ User Management ============

// Get all users
router.get("/users", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

// Update user
router.put("/users/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const updatedUser = await storage.updateUser(parseInt(id), userData);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Update user role
router.patch("/users/:id/role", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

// Reset user password
router.post("/users/:id/reset-password", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    await storage.resetUserPassword(parseInt(id), newPassword);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete("/users/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user?.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await storage.deleteUser(parseInt(id));
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// ============ Software Management ============

// Get all software (admin view - all statuses)
router.get("/software", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      type = '',
      license = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      search: search as string,
      status: status as string,
      type: type as string,
      license: license as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const result = await storage.getAdminSoftwareList(filters, limitNum, offset);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Create software (admin)
router.post("/software", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

// Update software SEO fields (admin)
router.put("/software/:id/seo", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const softwareId = parseInt(req.params.id, 10);
    const { seo_description, seo_content, slug } = req.body as {
      seo_description?: string;
      seo_content?: string;
      slug?: string;
    };

    const updates: Record<string, string | null> = {};
    if (seo_description !== undefined) updates.seo_description = seo_description || null;
    if (seo_content !== undefined) updates.seo_content = seo_content || null;
    if (slug !== undefined) updates.slug = slug.trim() || null;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No SEO fields to update" });
    }

    const software = await storage.updateSoftwareAdmin(softwareId, updates);
    if (!software) {
      return res.status(404).json({ message: "Software not found" });
    }

    res.json(software);
  } catch (error) {
    next(error);
  }
});

// Update software (admin)
router.put("/software/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const software = await storage.updateSoftwareAdmin(parseInt(id), updates);

    if (!software) {
      return res.status(404).json({ message: "Software not found" });
    }

    res.json(software);
  } catch (error) {
    next(error);
  }
});

// Delete software (admin)
router.delete("/software/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

// Update software status (admin)
router.put("/software/:id/status", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const softwareId = parseInt(id);

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be: pending, approved, or rejected" });
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

// ============ Category Management ============

// Get all categories
router.get("/categories", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Create category (admin)
router.post("/categories", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

// Get category by ID
router.get("/categories/:id", async (req: Request, res: Response, next: NextFunction) => {
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

// ============ External Requests Management ============

// Get all external requests
router.get("/external-requests", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = "1",
      limit = "20",
      status,
      priority,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const result = await storage.getAllExternalRequests({
      status: status as string,
      search: search as string,
      limit: limitNum,
      offset
    });

    // Filter by priority if provided (client-side filter for now)
    let filteredRequests = result.requests;
    if (priority && priority !== 'all') {
      filteredRequests = result.requests.filter(r => r.priority === priority);
    }

    res.json({ requests: filteredRequests, total: filteredRequests.length });
  } catch (error) {
    next(error);
  }
});

// Get external requests statistics
router.get("/external-requests/stats", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allRequests = await storage.getAllExternalRequests({});

    const stats = {
      total: allRequests.total,
      pending: allRequests.requests.filter(r => r.status === 'pending').length,
      in_progress: allRequests.requests.filter(r => r.status === 'in_progress').length,
      completed: allRequests.requests.filter(r => r.status === 'completed').length,
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get single external request
router.get("/external-requests/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const request = await storage.getExternalRequestById(parseInt(id));
    if (!request) {
      return res.status(404).json({ message: "External request not found" });
    }
    res.json(request);
  } catch (error) {
    next(error);
  }
});

// Update external request
router.put("/external-requests/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { externalRequestStorage } = await import('../storage/external-request.storage');
    const updatedRequest = await externalRequestStorage.updateExternalRequest(parseInt(id), req.body);
    if (!updatedRequest) {
      return res.status(404).json({ message: "External request not found" });
    }
    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
});

// Update external request status
router.put("/external-requests/:id/status", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedRequest = await storage.updateExternalRequestStatus(parseInt(id), status);
    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
});

// Create quote for external request
router.post("/external-requests/:id/quotes", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, price, deposit_amount, timeline_days, deliverables, terms_conditions } = req.body;

    // Validation
    if (!title || !description || !price || !deposit_amount || !timeline_days || !deliverables) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Use the external request storage module
    const { externalRequestStorage } = await import('../storage/external-request.storage');
    const quote = await externalRequestStorage.createQuoteForRequest(parseInt(id), {
      title,
      description,
      deliverables,
      total_price: parseFloat(price),
      deposit_amount: parseFloat(deposit_amount),
      timeline_days: parseInt(timeline_days),
      terms_conditions,
      admin_id: req.user?.id as number,
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
});

// Assign developer to external request
router.put("/external-requests/:id/assign", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { assigned_developer_id } = req.body;

    const updatedRequest = await storage.assignDeveloperToExternalRequest(parseInt(id), assigned_developer_id);
    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
});

// ============ Project Management ============

// GET /api/admin/projects - Unified project requests (external_requests)
router.get("/projects", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search, source, priority, page, limit } = req.query;
    const result = await storage.getAdminProjects({
      status: status as string,
      search: search as string,
      source: source as string,
      priority: priority as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/projects/stats - Get project statistics
router.get("/projects/stats", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await storage.getProjectStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/projects/:id - Get project details
router.get("/projects/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/projects/:id - Update project
router.patch("/projects/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = parseInt(req.params.id);
    const updates = req.body;

    const updated = await storage.updateProject(projectId, updates);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ============ Marketplace Products (admin moderation) ============

router.get("/products", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await storage.getAdminProducts({
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch("/products/:id/status", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!["draft", "pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const product = await storage.updateProductStatusAdmin(parseInt(req.params.id), status);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// ============ Marketplace Orders (admin) ============

router.get("/orders", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search, page, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string, 10) : 50;
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const result = await storage.getEnrichedOrders({
      status: status as string,
      search: search as string,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/orders-timeline", adminMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const timeline = await storage.getOrdersTimeline(6);
    res.json({ timeline });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/leads-timeline", adminMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const timeline = await storage.getLeadsTimeline(6);
    res.json({ timeline });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/ga4-traffic", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fetchGa4TrafficSummary } = await import("../lib/ga4-reporting.js");
    const days = Math.min(90, Math.max(7, parseInt(String(req.query.days || "30"), 10) || 30));
    const summary = await fetchGa4TrafficSummary(days);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// ============ Software Management ============

// GET /api/admin/softwares - Get all software with filters
router.get("/softwares", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      status,
      type,
      license,
      dateFrom,
      dateTo
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Fetch all software from database
    const result = await storage.getSoftwareList({
      limit: 10000, // Get all for filtering
      offset: 0
    });

    console.log('📊 Total software from DB:', result.softwares.length);
    console.log('📊 Query params - status:', status, 'license:', license, 'search:', search);

    const allSoftware = result.softwares;

    // Apply filters
    let filtered = allSoftware;

    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter((s: any) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower)
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((s: any) => s.status === status);
    }

    if (license && license !== 'all') {
      filtered = filtered.filter((s: any) => s.license === license);
    }

    if (type && type !== 'all') {
      filtered = filtered.filter((s: any) => s.type === type);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom as string);
      filtered = filtered.filter((s: any) => new Date(s.created_at) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo as string);
      filtered = filtered.filter((s: any) => new Date(s.created_at) <= toDate);
    }

    const total = filtered.length;
    const softwares = filtered.slice(offset, offset + limitNum);

    console.log('✅ Final - Total filtered:', total, 'Returning:', softwares.length, 'Page:', pageNum);

    res.json({
      softwares,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      stats: {
        total: allSoftware.length,
        approved: allSoftware.filter((s: any) => s.status === "approved").length,
        pending: allSoftware.filter((s: any) => s.status === "pending").length,
        rejected: allSoftware.filter((s: any) => s.status === "rejected").length,
      },
    });
  } catch (error) {
    console.error('Error fetching admin software:', error);
    next(error);
  }
});

// PUT /api/admin/software/:id - Update software
router.put("/software/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const softwareId = parseInt(req.params.id);
    const updates = req.body;

    console.log('🔍 Update request for software', softwareId);
    console.log('📦 Raw updates:', JSON.stringify(updates, null, 2));

    // Remove readonly fields that shouldn't be updated
    const { created_at, created_by, id, ...updateData } = updates;

    console.log('✅ Filtered updateData:', JSON.stringify(updateData, null, 2));

    const updated = await storage.updateSoftware(softwareId, updateData);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/software/:id/status - Update software status
router.put("/software/:id/status", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const softwareId = parseInt(req.params.id);
    const { status } = req.body;

    const updated = await storage.updateSoftware(softwareId, { status });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/software/:id - Delete software
router.delete("/software/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const softwareId = parseInt(req.params.id);

    await storage.deleteSoftware(softwareId);
    res.json({ success: true, message: "Software deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
