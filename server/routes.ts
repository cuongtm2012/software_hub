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

// Import named exports (register functions)
import { registerMarketplaceRoutes } from "./routes/marketplace.routes.js";
import { registerUserRoutes } from "./routes/user.routes.js";
import { registerPaymentRoutes } from "./routes/payment.routes.js";
import { registerServiceRoutes } from "./routes/service.routes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // ==========================================
  // BASIC AUTH ROUTES (Login/Logout/Register)
  // ==========================================

  // Simple login endpoint
  app.post("/api/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Simple password check for testing
      const isValidPassword =
        (email === "seller@test.com" && password === "testpassword") ||
        (email === "buyer@test.com" && password === "testpassword") ||
        (email === "cuongeurovnn@gmail.com" && password === "abcd@1234") ||
        (email === "cuongtm2012@gmail.com" && password === "Cuongtm2012$");

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }

        console.log("✅ Session saved successfully:", {
          sessionId: req.sessionID,
          userId: req.session.userId,
          userEmail: req.session.user?.email
        });

        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quick Login endpoints for demo accounts
  app.post("/api/quick-login/seller", async (req, res, next) => {
    try {
      const user = await storage.getUserByEmail("seller@test.com");

      if (!user) {
        return res.status(404).json({ message: "Demo seller account not found" });
      }

      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }

        console.log("✅ Quick login as Seller successful");
        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      });
    } catch (error) {
      console.error("Quick login seller error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/quick-login/buyer", async (req, res, next) => {
    try {
      const user = await storage.getUserByEmail("buyer@test.com");

      if (!user) {
        return res.status(404).json({ message: "Demo buyer account not found" });
      }

      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }

        console.log("✅ Quick login as Buyer successful");
        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      });
    } catch (error) {
      console.error("Quick login buyer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    // Dev mode: auto-login if auth is disabled
    if (process.env.DISABLE_AUTH === 'true') {
      const mockRole = process.env.MOCK_USER_ROLE || 'seller';
      const mockUsers: Record<string, any> = {
        seller: { id: 2, name: "Test Seller", email: "seller@test.com", role: "seller", avatar: "" },
        buyer: { id: 3, name: "Test Buyer", email: "buyer@test.com", role: "buyer", avatar: "" },
        admin: { id: 1, name: "Admin User", email: "admin@test.com", role: "admin", avatar: "" },
      };

      const mockUser = mockUsers[mockRole] || mockUsers.seller;

      // Set session for consistency
      req.session.userId = mockUser.id;
      req.session.user = mockUser;

      console.log('🔓 [DEV MODE] Auto-login:', mockUser.email, `(${mockUser.role})`);
      return res.json(mockUser);
    }

    // Normal mode: check session
    if (req.session?.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Registration endpoint - Email only, sends verification link
  app.post("/api/register", async (req, res, next) => {
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
  // app.use("/api/chat", chatRouter); // REMOVED - Chat is WebSocket-only via Chat Service
  app.use("/api/orders", orderRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/products", productRouter);
  app.use("/api/softwares", softwareRouter);
  app.use("/api/courses", coursesRouter);

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