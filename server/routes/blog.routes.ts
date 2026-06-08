import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { hasRole } from "../middleware/auth.middleware";

const router = Router();

router.get("/admin/all", hasRole(["admin"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, limit = "50", offset = "0" } = req.query;
    const result = await storage.getBlogPosts({
      tag: tag as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      publishedOnly: false,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, limit = "12", offset = "0" } = req.query;
    const result = await storage.getBlogPosts({
      tag: tag as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      publishedOnly: true,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post || post.status !== "published") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.post("/", hasRole(["admin"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await storage.createBlogPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", hasRole(["admin"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const post = await storage.updateBlogPost(id, req.body);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", hasRole(["admin"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBlogPost(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
