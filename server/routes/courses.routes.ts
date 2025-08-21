import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";

const router = Router();

// Get all courses with filters
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { topic, level, limit = "12", offset = "0" } = req.query;

        const result = await storage.getCourses({
            topic: topic as string | undefined,
            level: level as string | undefined,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get all unique topics with course counts
router.get("/topics", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topics = await storage.getCourseTopics();
        res.json(topics);
    } catch (error) {
        next(error);
    }
});

// Get single course by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const course = await storage.getCourseById(id);

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json(course);
    } catch (error) {
        next(error);
    }
});

export default router;
