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

const router = Router();

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

// Update external request (admin fields: status, priority, notes)
router.put("/external-requests/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, priority, admin_notes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (admin_notes) updateData.admin_notes = admin_notes;

    // Use the external request storage module
    const { externalRequestStorage } = await import('../storage/external-request.storage');
    const updatedRequest = await externalRequestStorage.updateExternalRequest(parseInt(id), updateData);
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

// GET /api/admin/projects - Get all projects with filters
router.get("/projects", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query;
    const projects = await storage.getAdminProjects({
      status: status as string,
      search: search as string,
    });
    res.json({ projects });
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
      totalPages: Math.ceil(total / limitNum)
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
