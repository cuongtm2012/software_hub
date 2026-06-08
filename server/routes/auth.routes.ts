import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { userStorage } from "../storage/user";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { sendWelcomeEmail } from "../email";
import { enqueuePasswordResetEmailJob, enqueueVerificationEmailJob } from "../lib/monolith-queue.js";
import { isAuthenticated, adminMiddleware } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rate-limit.js";
import { resolveUserFromRequest } from "../lib/auth-user.js";

const router = Router();

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logout successful" });
});

router.get("/user", async (req: Request, res: Response) => {
  const user = await resolveUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  res.json(user);
});

// Registration endpoint - Email only, sends verification link
router.post("/register", authRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
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

    // Check if user already exists
    const existingUser = await userStorage.getUserByEmail(email);
    if (existingUser) {
      // For security, don't reveal if email exists
      // But if email is already verified, tell them to login
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

        enqueueVerificationEmailJob({ email, verificationUrl }).catch(error => {
          console.error(`Verification email queue error for ${email}:`, error);
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
    const user = await userStorage.createUser({
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

    enqueueVerificationEmailJob({ email, verificationUrl }).catch(error => {
      console.error(`Verification email queue error for ${email}:`, error);
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

// Verify email endpoint - Check if verification token is valid
router.get("/verify-email", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: "Verification token is required" });
    }

    // Find user by verification token
    const [user] = await db.select()
      .from(users)
      .where(
        and(
          eq(users.reset_token, token),
          gt(users.reset_token_expires, new Date())
        )
      );

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
        expired: true
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        message: "Email already verified. Please login.",
        alreadyVerified: true
      });
    }

    res.json({
      valid: true,
      email: user.email
    });

  } catch (error) {
    console.error("Verify email error:", error);
    next(error);
  }
});

// Set password endpoint - Allow user to set password after email verification
router.post("/set-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password, name } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Find user by verification token
    const [user] = await db.select()
      .from(users)
      .where(
        and(
          eq(users.reset_token, token),
          gt(users.reset_token_expires, new Date())
        )
      );

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    // Update user: set password, verify email, clear token, optionally update name
    const updateData: any = {
      password: password,
      email_verified: true,
      reset_token: null,
      reset_token_expires: null,
      updated_at: new Date()
    };

    // If user provided a name, update it (otherwise keep the temp name from email)
    if (name && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    console.log(`✅ Email verified and password set for user: ${user.email}`);

    res.json({
      message: "Password set successfully! You can now login.",
      success: true
    });

  } catch (error) {
    console.error("Set password error:", error);
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

    const user = await userStorage.getUserByEmail(email);

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

    enqueuePasswordResetEmailJob({
      email: user.email,
      name: user.name,
      resetUrl
    }).catch(error => {
      console.error(`Password reset email queue error for ${user.email}:`, error);
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
    const user = await userStorage.getUser(req.user?.id as number);
    res.json({ profile: user?.profile || {} });
  } catch (error) {
    next(error);
  }
});

router.put("/profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profile } = req.body;
    const updatedUser = await userStorage.updateUserProfile(req.user?.id as number, profile);
    res.json({ profile: updatedUser?.profile || {} });
  } catch (error) {
    next(error);
  }
});

// User Downloads Management
router.get("/downloads", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const downloads = await userStorage.getUserDownloads(req.user?.id as number);
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

    const download = await userStorage.createUserDownload(
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
    const reviews = await userStorage.getUserReviews(req.user?.id as number);
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

// TOKEN VALIDATION API FOR CHAT SERVICE

/**
 * Validate auth token and return user info
 * Used by chat service to verify WebSocket connections
 */
router.post("/validate-token", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, error: "Token is required" });
    }

    const { resolveUserFromToken } = await import("../lib/auth-user.js");
    const user = await resolveUserFromToken(token);
    if (!user) {
      return res.status(401).json({ valid: false, error: "Invalid or expired token" });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ valid: false, error: "Token validation failed" });
  }
});

/**
 * Get user list - for chat service
 * Returns all users with basic info
 */
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userStorage.getAllUsers();

    // Return safe user list (no sensitive data)
    const safeUsers = result.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar || '',
      createdAt: u.created_at
    }));

    console.log(`✅ Returning ${safeUsers.length} users to chat service`);

    res.json({
      success: true,
      users: safeUsers,
      total: result.total
    });
  } catch (error) {
    console.error("Get users error:", error);
    next(error);
  }
});

/**
 * Get user by ID - for chat service to fetch user details
 */
router.get("/users/:userId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await userStorage.getUser(parseInt(userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Return safe user info
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    next(error);
  }
});

export default router;
