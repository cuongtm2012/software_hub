import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, level, search, limit = "12", offset = "0" } = req.query;

    const result = await storage.getCourses({
      topic: topic as string | undefined,
      level: level as string | undefined,
      search: search as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
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
