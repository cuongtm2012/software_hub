import type { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Validation schemas
const productSpecSchema = z.object({
  productId: z.number(),
  specKey: z.string().min(1),
  specValue: z.string().min(1),
  displayOrder: z.number().optional(),
});

const productFeatureSchema = z.object({
  productId: z.number(),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional(),
  displayOrder: z.number().optional(),
});

const productImageSchema = z.object({
  productId: z.number(),
  imageUrl: z.string().url(),
  altText: z.string().optional(),
  displayOrder: z.number().optional(),
  isMain: z.boolean().optional(),
});

const productReviewSchema = z.object({
  productId: z.number(),
  userId: z.number(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(10),
  verifiedPurchase: z.boolean().optional(),
});

// Middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = req.session.user;
  next();
}

export function registerProductDetailsRoutes(app: Express) {
  
  // ============ Product Specifications ============
  
  // Get all specs for a product
  app.get("/api/products/:productId/specifications", async (req, res) => {
    try {
      const { productId } = req.params;
      const specs = await prisma.productSpecification.findMany({
        where: { productId: parseInt(productId) },
        orderBy: { displayOrder: 'asc' },
      });
      res.json({ specifications: specs });
    } catch (error) {
      console.error("Error fetching product specifications:", error);
      res.status(500).json({ message: "Failed to fetch specifications" });
    }
  });

  // Add product specification (seller only)
  app.post("/api/products/:productId/specifications", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Verify product belongs to seller
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const specData = productSpecSchema.parse({
        ...req.body,
        productId: parseInt(productId),
      });
      
      const spec = await prisma.productSpecification.create({
        data: specData,
      });
      
      res.status(201).json({ specification: spec });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating specification:", error);
      res.status(500).json({ message: "Failed to create specification" });
    }
  });

  // Update specification
  app.put("/api/specifications/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const spec = await prisma.productSpecification.findUnique({
        where: { id: parseInt(id) },
        include: { product: true },
      });
      
      if (!spec) {
        return res.status(404).json({ message: "Specification not found" });
      }
      
      if (spec.product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedSpec = await prisma.productSpecification.update({
        where: { id: parseInt(id) },
        data: req.body,
      });
      
      res.json({ specification: updatedSpec });
    } catch (error) {
      console.error("Error updating specification:", error);
      res.status(500).json({ message: "Failed to update specification" });
    }
  });

  // Delete specification
  app.delete("/api/specifications/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const spec = await prisma.productSpecification.findUnique({
        where: { id: parseInt(id) },
        include: { product: true },
      });
      
      if (!spec) {
        return res.status(404).json({ message: "Specification not found" });
      }
      
      if (spec.product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await prisma.productSpecification.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: "Specification deleted successfully" });
    } catch (error) {
      console.error("Error deleting specification:", error);
      res.status(500).json({ message: "Failed to delete specification" });
    }
  });

  // ============ Product Features ============
  
  // Get all features for a product
  app.get("/api/products/:productId/features", async (req, res) => {
    try {
      const { productId } = req.params;
      const features = await prisma.productFeature.findMany({
        where: { productId: parseInt(productId) },
        orderBy: { displayOrder: 'asc' },
      });
      res.json({ features });
    } catch (error) {
      console.error("Error fetching product features:", error);
      res.status(500).json({ message: "Failed to fetch features" });
    }
  });

  // Add product feature (seller only)
  app.post("/api/products/:productId/features", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Verify product belongs to seller
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const featureData = productFeatureSchema.parse({
        ...req.body,
        productId: parseInt(productId),
      });
      
      const feature = await prisma.productFeature.create({
        data: featureData,
      });
      
      res.status(201).json({ feature });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating feature:", error);
      res.status(500).json({ message: "Failed to create feature" });
    }
  });

  // Update feature
  app.put("/api/features/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const feature = await prisma.productFeature.findUnique({
        where: { id: parseInt(id) },
        include: { product: true },
      });
      
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      if (feature.product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedFeature = await prisma.productFeature.update({
        where: { id: parseInt(id) },
        data: req.body,
      });
      
      res.json({ feature: updatedFeature });
    } catch (error) {
      console.error("Error updating feature:", error);
      res.status(500).json({ message: "Failed to update feature" });
    }
  });

  // Delete feature
  app.delete("/api/features/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const feature = await prisma.productFeature.findUnique({
        where: { id: parseInt(id) },
        include: { product: true },
      });
      
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      if (feature.product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await prisma.productFeature.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: "Feature deleted successfully" });
    } catch (error) {
      console.error("Error deleting feature:", error);
      res.status(500).json({ message: "Failed to delete feature" });
    }
  });

  // ============ Product Images ============
  
  // Get all images for a product
  app.get("/api/products/:productId/images", async (req, res) => {
    try {
      const { productId } = req.params;
      const images = await prisma.productImage.findMany({
        where: { productId: parseInt(productId) },
        orderBy: { displayOrder: 'asc' },
      });
      res.json({ images });
    } catch (error) {
      console.error("Error fetching product images:", error);
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  // Add product image (seller only)
  app.post("/api/products/:productId/images", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Verify product belongs to seller
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const imageData = productImageSchema.parse({
        ...req.body,
        productId: parseInt(productId),
      });
      
      const image = await prisma.productImage.create({
        data: imageData,
      });
      
      res.status(201).json({ image });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating image:", error);
      res.status(500).json({ message: "Failed to create image" });
    }
  });

  // Delete image
  app.delete("/api/images/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const image = await prisma.productImage.findUnique({
        where: { id: parseInt(id) },
        include: { product: true },
      });
      
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      if (image.product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await prisma.productImage.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // ============ Product Reviews ============
  
  // Get all reviews for a product
  app.get("/api/products/:productId/product-reviews", async (req, res) => {
    try {
      const { productId } = req.params;
      const reviews = await prisma.productReview.findMany({
        where: { productId: parseInt(productId) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ reviews });
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Add product review (authenticated users only)
  app.post("/api/products/:productId/product-reviews", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if user already reviewed this product
      const existingReview = await prisma.productReview.findFirst({
        where: {
          productId: parseInt(productId),
          userId: req.user!.id,
        },
      });
      
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }
      
      const reviewData = productReviewSchema.parse({
        ...req.body,
        productId: parseInt(productId),
        userId: req.user!.id,
      });
      
      const review = await prisma.productReview.create({
        data: reviewData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Update product average rating
      const allReviews = await prisma.productReview.findMany({
        where: { productId: parseInt(productId) },
      });
      
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await prisma.product.update({
        where: { id: parseInt(productId) },
        data: { 
          averageRating: avgRating,
          totalReviews: allReviews.length,
        },
      });
      
      res.status(201).json({ review });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Update review (user can only update their own review)
  app.put("/api/product-reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const review = await prisma.productReview.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (review.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedReview = await prisma.productReview.update({
        where: { id: parseInt(id) },
        data: req.body,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Recalculate product average rating
      const allReviews = await prisma.productReview.findMany({
        where: { productId: review.productId },
      });
      
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await prisma.product.update({
        where: { id: review.productId },
        data: { averageRating: avgRating },
      });
      
      res.json({ review: updatedReview });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Delete review
  app.delete("/api/product-reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const review = await prisma.productReview.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (review.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await prisma.productReview.delete({
        where: { id: parseInt(id) },
      });
      
      // Recalculate product average rating
      const allReviews = await prisma.productReview.findMany({
        where: { productId: review.productId },
      });
      
      const avgRating = allReviews.length > 0 
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
        : 0;
      
      await prisma.product.update({
        where: { id: review.productId },
        data: { 
          averageRating: avgRating,
          totalReviews: allReviews.length,
        },
      });
      
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ============ Combined Product Details Endpoint ============
  
  // Get complete product details with all related data
  app.get("/api/products/:productId/details", async (req, res) => {
    try {
      const { productId } = req.params;
      
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
        include: {
          specifications: {
            orderBy: { displayOrder: 'asc' },
          },
          features: {
            orderBy: { displayOrder: 'asc' },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ product });
    } catch (error) {
      console.error("Error fetching product details:", error);
      res.status(500).json({ message: "Failed to fetch product details" });
    }
  });
}
