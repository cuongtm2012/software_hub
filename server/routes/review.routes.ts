import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertReviewSchema, insertProductReviewSchema, insertPortfolioReviewSchema } from "@shared/schema";
import { isAuthenticated, adminMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Software Reviews
router.get("/software/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reviews = await storage.getSoftwareReviews(parseInt(id));
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

router.post("/software/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if user has already reviewed this software
    const existingReview = await storage.getUserReviewForSoftware(
      req.user?.id as number,
      parseInt(id)
    );
    
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this software" });
    }
    
    const insertData = insertReviewSchema.parse({
      ...req.body,
      software_id: parseInt(id),
      user_id: req.user?.id
    });
    
    const review = await storage.createReview(insertData);
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

router.put("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await storage.getReviewById(parseInt(id));
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to update this review" });
    }
    
    const updatedReview = await storage.updateReview(
      parseInt(id),
      req.user?.id as number,
      req.body
    );
    
    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await storage.getReviewById(parseInt(id));
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to delete this review" });
    }
    
    await storage.deleteReview(parseInt(id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Product Reviews
router.get("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reviews = await storage.getProductReviews(parseInt(id));
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

router.post("/products/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await storage.getProductById(parseInt(id));
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Check if user has already reviewed this product
    const existingReview = await storage.getUserReviewForProduct(
      req.user?.id as number,
      parseInt(id)
    );
    
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    
    const insertData = insertProductReviewSchema.parse({
      ...req.body,
      product_id: parseInt(id),
      user_id: req.user?.id
    });
    
    const review = await storage.createProductReview(insertData);
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

// Portfolio Reviews
router.get("/portfolio/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reviews = await storage.getPortfolioReviews(parseInt(id));
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

router.post("/portfolio/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Only clients can review portfolios
    if (req.user?.role !== 'client' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Only clients can review portfolios" });
    }
    
    // Check if portfolio exists
    const portfolio = await storage.getPortfolioById(parseInt(id));
    
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    
    // Check if client has already reviewed this portfolio
    const existingReview = await storage.getClientReviewForPortfolio(
      req.user?.id as number,
      parseInt(id)
    );
    
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this portfolio" });
    }
    
    const insertData = insertPortfolioReviewSchema.parse({
      ...req.body,
      portfolio_id: parseInt(id),
      client_id: req.user?.id
    });
    
    const review = await storage.createPortfolioReview(insertData);
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

export default router;
