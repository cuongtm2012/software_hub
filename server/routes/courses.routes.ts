import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { hasRole } from "../middleware/auth.middleware";

const router = Router();
const adminMiddleware = hasRole(["admin"]);

router.get("/admin/all", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, limit = "100", offset = "0" } = req.query;
    const result = await storage.getCourses({
      search: search as string | undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/admin/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const existing = await storage.getCourseById(id);
    if (!existing) {
      return res.status(404).json({ message: "Course not found" });
    }

    const updated = await storage.updateCourse(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, level, search, sort, limit = "12", offset = "0" } = req.query;

    const result = await storage.getCourses({
      topic: topic as string | undefined,
      level: level as string | undefined,
      search: search as string | undefined,
      sort: sort as string | undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/topics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topics = await storage.getCourseTopics();
    res.json(topics);
  } catch (error) {
    next(error);
  }
});

router.get("/:idOrSlug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrSlug } = req.params;
    const numericId = parseInt(idOrSlug, 10);

    const course =
      !isNaN(numericId) && String(numericId) === idOrSlug
        ? await storage.getCourseById(numericId)
        : await storage.getCourseBySlug(idOrSlug);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
});

export default router;
