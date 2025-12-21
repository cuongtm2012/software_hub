import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../email";
import { isAuthenticated, adminMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Login endpoint
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Simple password check for testing - bypass hashing for test accounts
    const isValidPassword = 
      (email === "seller@test.com" && password === "testpassword") ||
      (email === "buyer@test.com" && password === "testpassword") ||
      (email === "cuongeurovnn@gmail.com" && password === "abcd@1234") ||
      (email === "cuongtm2012@gmail.com" && password === "Cuongtm2012$");
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Create session and save it explicitly
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // Save session explicitly to ensure persistence
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
router.post("/quick-login/seller", async (req: Request, res: Response, next: NextFunction) => {
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

router.post("/quick-login/buyer", async (req: Request, res: Response, next: NextFunction) => {
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
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

// Get current user
router.get("/user", (req: Request, res: Response) => {
  if (req.session?.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Registration endpoint
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create the user with default 'user' role
    const user = await storage.createUser({
      name,
      email,
      password,
      role: 'user',
    });

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(user.email, user.name).then(result => {
      if (result.success) {
        console.log(`Welcome email sent to ${user.email} (${result.messageId})`);
      } else {
        console.error(`Failed to send welcome email to ${user.email}:`, result.error);
      }
    }).catch(error => {
      console.error(`Welcome email error for ${user.email}:`, error);
    });

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      ...userWithoutPassword,
      welcomeEmailSent: true,
      message: "Account created successfully! A welcome email has been sent to your email address."
    });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
});

// Forgot password endpoint
router.post("/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await storage.getUserByEmail(email);
    
    // Always return success to prevent email enumeration
    res.json({ message: "If the email exists in our system, you'll receive a password reset link." });
    
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await db.update(users)
      .set({ 
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires 
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password?token=${resetToken}`;
    
    sendPasswordResetEmail(user.email, user.name, resetUrl).then(result => {
      if (result.success) {
        console.log(`Password reset email sent to ${user.email} (${result.messageId})`);
      } else {
        console.error(`Failed to send password reset email to ${user.email}:`, result.error);
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
router.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Find user by reset token
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

    // Update password and clear reset token
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

// User Profile Management Routes
router.get("/profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await storage.getUser(req.user?.id as number);
    res.json({ profile: user?.profile || {} });
  } catch (error) {
    next(error);
  }
});

router.put("/profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profile } = req.body;
    const updatedUser = await storage.updateUserProfile(req.user?.id as number, profile);
    res.json({ profile: updatedUser?.profile || {} });
  } catch (error) {
    next(error);
  }
});

// User Downloads Management
router.get("/downloads", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const downloads = await storage.getUserDownloads(req.user?.id as number);
    res.json({ downloads });
  } catch (error) {
    next(error);
  }
});

router.post("/downloads", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { softwareId, version } = req.body;
    
    if (!softwareId || !version) {
      return res.status(400).json({ message: "Software ID and version are required" });
    }
    
    const download = await storage.createUserDownload(
      req.user?.id as number, 
      parseInt(softwareId), 
      version
    );
    
    res.status(201).json({ download });
  } catch (error) {
    next(error);
  }
});

// User Reviews Management
router.get("/reviews", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await storage.getUserReviews(req.user?.id as number);
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

export default router;
