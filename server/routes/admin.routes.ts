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
    
    res.json(result);
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

export default router;
