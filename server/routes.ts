import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { db } from "./db.js";
import { users } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { storage } from "./storage.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "./email.js";

// Import default exports (Router instances)
import authRouter from "./routes/auth.routes.js";
import reviewRouter from "./routes/review.routes.js";
import sellerRouter from "./routes/seller.routes.js";
import buyerRouter from "./routes/buyer.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import chatRouter from "./routes/chat.routes.js";
import orderRouter from "./routes/order.routes.js";
import adminRouter from "./routes/admin.routes.js";
import productRouter from "./routes/product.routes.js";
import softwareRouter from "./routes/software.routes.js";
import coursesRouter from "./routes/courses.routes.js";
import leadsRouter from "./routes/leads.routes.js";
import blogRouter from "./routes/blog.routes.js";
import sitemapRouter from "./routes/sitemap.routes.js";
import { seoPrerenderMiddleware } from "./middleware/seo-prerender.js";
import uploadRouter from "./routes/upload.routes.js";
import portfolioRouter, { portfolioReviewRouter } from "./routes/portfolio.routes.js";
import supportRouter from "./routes/support.routes.js";
import configRouter from "./routes/config.routes.js";
import { authRateLimiter } from "./middleware/rate-limit.js";

// Import named exports (register functions)
import { registerMarketplaceRoutes } from "./routes/marketplace.routes.js";
import { registerUserRoutes } from "./routes/user.routes.js";
import { registerPaymentRoutes } from "./routes/payment.routes.js";
import { registerServiceRoutes } from "./routes/service.routes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // SEO: sitemap, robots.txt, llms.txt + bot prerender
  app.use(sitemapRouter);
  app.use(seoPrerenderMiddleware);

  // Logout stub — client uses Supabase signOut; kept for backward compatibility
  app.post("/api/logout", (_req, res) => {
    res.json({ message: "Logout successful" });
  });

  // Get current user (Supabase JWT)
  app.get("/api/user", async (req, res) => {
    try {
      const { resolveUserFromRequest } = await import("./lib/auth-user.js");
      const user = await resolveUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Registration endpoint - Email only, sends verification link
  app.post("/api/register", authRateLimiter, async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // If email is already verified, tell them to login
        if (existingUser.email_verified) {
          return res.status(400).json({
            message: "This email is already registered. Please login instead."
          });
        } else {
          // Email exists but not verified - resend verification email
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          await db.update(users)
            .set({
              reset_token: verificationToken,
              reset_token_expires: verificationTokenExpires
            })
            .where(eq(users.id, existingUser.id));

          const verificationUrl = `${req.protocol}://${req.get('host')}/auth/set-password?token=${verificationToken}`;

          const { sendVerificationEmail } = await import("./email");
          sendVerificationEmail(email, verificationUrl).then(result => {
            if (result.success) {
              console.log(`Verification email resent to ${email} (${result.messageId})`);
            } else {
              console.error(`Failed to resend verification email to ${email}:`, result.error);
            }
          }).catch(error => {
            console.error(`Verification email error for ${email}:`, error);
          });

          return res.status(200).json({
            message: "A verification email has been sent to your email address. Please check your inbox.",
            emailSent: true
          });
        }
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Extract name from email (before @) as temporary name
      const tempName = email.split('@')[0];

      // Generate random temporary password (user won't know this)
      const tempPassword = crypto.randomBytes(32).toString('hex');

      // Create the user with unverified status
      const user = await storage.createUser({
        name: tempName,
        email,
        password: tempPassword, // Temporary password
        role: 'user',
        email_verified: false,
        phone_verified: false,
        reset_token: verificationToken,
        reset_token_expires: verificationTokenExpires,
      });

      // Send verification email
      const verificationUrl = `${req.protocol}://${req.get('host')}/auth/set-password?token=${verificationToken}`;

      const { sendVerificationEmail } = await import("./email");
      sendVerificationEmail(email, verificationUrl).then(result => {
        if (result.success) {
          console.log(`Verification email sent to ${email} (${result.messageId})`);
        } else {
          console.error(`Failed to send verification email to ${email}:`, result.error);
        }
      }).catch(error => {
        console.error(`Verification email error for ${email}:`, error);
      });

      res.status(201).json({
        message: "Registration successful! Please check your email to set your password.",
        emailSent: true
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  // Forgot password endpoint
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);

      res.json({ message: "If the email exists in our system, you'll receive a password reset link." });

      if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000);

      await db.update(users)
        .set({
          reset_token: resetToken,
          reset_token_expires: resetTokenExpires
        })
        .where(eq(users.id, user.id));

      const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password?token=${resetToken}`;

      sendPasswordResetEmail(user.email, user.name, resetUrl).then(result => {
        if (result.success) {
          console.log(`Password reset email sent to ${user.email}`);
        }
      }).catch(error => {
        console.error(`Password reset email error for ${user.email}:`, error);
      });

    } catch (error) {
      console.error("Forgot password error:", error);
      next(error);
    }
  });

  // Reset password endpoint
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      const [user] = await db.select()
        .from(users)
        .where(
          and(
            eq(users.reset_token, token),
            gt(users.reset_token_expires, new Date())
          )
        );

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      await db.update(users)
        .set({
          password: password,
          reset_token: null,
          reset_token_expires: null
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Password reset successful" });

    } catch (error) {
      console.error("Reset password error:", error);
      next(error);
    }
  });

  // ==========================================
  // REGISTER ALL ROUTE MODULES
  // ==========================================

  console.log("📦 Registering route modules...");

  // Register router instances (default exports)
  app.use("/api/auth", authRouter);
  app.use("/api/reviews", reviewRouter);
  app.use("/api/seller", sellerRouter);
  app.use("/api/buyer", buyerRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/config", configRouter);
  app.use("/api/products", productRouter);
  app.use("/api/softwares", softwareRouter);
  app.use("/api/courses", coursesRouter);
  app.use("/api/leads", leadsRouter);
  app.use("/api/blog", blogRouter);
  app.use("/api/storage", uploadRouter);
  app.use("/api/portfolios", portfolioRouter);
  app.use("/api/portfolio-reviews", portfolioReviewRouter);
  app.use("/api/support/tickets", supportRouter);

  // Register function-based routes (named exports)
  registerMarketplaceRoutes(app);
  registerUserRoutes(app);
  registerPaymentRoutes(app);
  registerServiceRoutes(app);

  console.log("✅ All route modules registered successfully!");

  // ==========================================
  // CREATE HTTP SERVER
  // ==========================================

  const httpServer = createServer(app);
  return httpServer;
}