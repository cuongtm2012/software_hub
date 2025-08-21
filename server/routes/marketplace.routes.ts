import type { Express } from "express";
import { db } from "../db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerMarketplaceRoutes(app: Express) {
  // Public Marketplace Routes
  app.get("/api/marketplace/products", async (req, res, next) => {
    try {
      const allProducts = await db.select().from(products).where(eq(products.status, 'approved'));
      
      console.log(`📦 Marketplace products fetched: ${allProducts.length} approved products`);
      res.json({ products: allProducts });
    } catch (error) {
      console.error('Marketplace products error:', error);
      next(error);
    }
  });

  app.get("/api/marketplace/products/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const [product] = await db.select().from(products).where(eq(products.id, parseInt(id)));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });
}
