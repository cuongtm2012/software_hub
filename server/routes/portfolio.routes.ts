import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertPortfolioSchema, insertPortfolioReviewSchema } from "@shared/schema";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

// List all portfolios (public gallery)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "12", 10);
    const offset = (page - 1) * limit;

    const result = await storage.getAllPortfolios(limit, offset);
    res.json(result.portfolios);
  } catch (error) {
    next(error);
  }
});

// Developer's own portfolios (authenticated)
router.get("/developer", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const developerId =
      req.user?.role === "admin" && req.query.developerId
        ? parseInt(req.query.developerId as string, 10)
        : req.user!.id;

    const portfolios = await storage.getPortfoliosByDeveloperId(developerId);
    res.json(portfolios);
  } catch (error) {
    next(error);
  }
});

// Single portfolio by ID (public)
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid portfolio ID" });
    }

    const portfolio = await storage.getPortfolioById(id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

// Create portfolio (developer only)
router.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== "developer" && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only developers can create portfolios" });
    }

    const data = insertPortfolioSchema.parse(req.body);
    const portfolio = await storage.createPortfolio(data, req.user!.id);
    res.status(201).json(portfolio);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      res.status(400).json({ message: validationError.message });
    } else {
      next(error);
    }
  }
});

// Update portfolio
router.put("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const portfolio = await storage.getPortfolioById(id);

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    if (portfolio.developer_id !== req.user?.id && req.user?.role !== "admin") {
      return res.status(403).json({ message: "You do not have permission to update this portfolio" });
    }

    const data = insertPortfolioSchema.partial().parse(req.body);
    const updated = await storage.updatePortfolio(id, data);
    res.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      res.status(400).json({ message: validationError.message });
    } else {
      next(error);
    }
  }
});

// Delete portfolio
router.delete("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const portfolio = await storage.getPortfolioById(id);

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    if (portfolio.developer_id !== req.user?.id && req.user?.role !== "admin") {
      return res.status(403).json({ message: "You do not have permission to delete this portfolio" });
    }

    await storage.deletePortfolio(id, portfolio.developer_id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Portfolio reviews sub-router mounted at /api/portfolio-reviews
export const portfolioReviewRouter = Router();

portfolioReviewRouter.get("/:portfolioId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolioId = parseInt(req.params.portfolioId, 10);
    const reviews = await storage.getPortfolioReviews(portfolioId);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

portfolioReviewRouter.post("/", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== "client" && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only clients can review portfolios" });
    }

    const data = insertPortfolioReviewSchema.parse(req.body);

    const portfolio = await storage.getPortfolioById(data.portfolio_id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const existing = await storage.getClientReviewForPortfolio(req.user!.id, data.portfolio_id);
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this portfolio" });
    }

    const review = await storage.createPortfolioReview(data, req.user!.id);
    res.status(201).json(review);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      res.status(400).json({ message: validationError.message });
    } else {
      next(error);
    }
  }
});

portfolioReviewRouter.delete("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await storage.deletePortfolioReview(id, req.user!.id);

    if (!deleted) {
      return res.status(404).json({ message: "Review not found or permission denied" });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
