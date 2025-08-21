import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { userStorage } from "../storage/user";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } from "../email";
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
    const user = await userStorage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        emailNotVerified: true
      });
    }

    // Simple password check for testing - bypass hashing for test accounts
    const isValidPassword =
      (email === "seller@test.com" && password === "testpassword") ||
      (email === "buyer@test.com" && password === "testpassword") ||
      (email === "cuongeurovnn@gmail.com" && password === "abcd@1234") ||
      (email === "cuongtm2012@gmail.com" && password === "Cuongtm2012$") ||
      (user.password === password); // Direct password comparison for new users

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
    const user = await userStorage.getUserByEmail("seller@test.com");

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
    const user = await userStorage.getUserByEmail("buyer@test.com");

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

router.post("/quick-login/admin", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("🔍 Admin quick login - searching for cuongeurovnn@gmail.com");
    const user = await userStorage.getUserByEmail("cuongeurovnn@gmail.com");
    console.log("🔍 User found:", user ? `${user.email} (${user.role})` : "NOT FOUND");

    if (!user) {
      console.log("❌ Admin account not found");
      return res.status(404).json({ message: "Demo admin account not found" });
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

      console.log("✅ Quick login as Admin successful");
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    });
  } catch (error) {
    console.error("Quick login admin error:", error);
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

// Registration endpoint - Email only, sends verification link
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
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
router.post("/validate-token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    console.log('🔐 Token validation request received:', { tokenLength: token?.length });

    if (!token) {
      return res.status(400).json({
        valid: false,
        error: "Token is required"
      });
    }

    // Get session store from app
    const sessionStore = (req as any).sessionStore;

    if (!sessionStore) {
      console.error('❌ Session store not available');
      return res.status(500).json({
        valid: false,
        error: "Session store not configured"
      });
    }

    // Get session data from store
    sessionStore.get(token, (err: any, session: any) => {
      if (err) {
        console.error('❌ Session store error:', err);
        return res.status(500).json({
          valid: false,
          error: "Session retrieval failed"
        });
      }

      if (!session || !session.userId || !session.user) {
        console.log('❌ Invalid session - no user data found');
        return res.status(401).json({
          valid: false,
          error: "Invalid or expired token"
        });
      }

      console.log('✅ Token validated successfully for user:', session.user.email);

      // Token is valid, return user info
      res.json({
        valid: true,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          avatar: session.user.avatar || ''
        }
      });
    });

  } catch (error) {
    console.error("❌ Token validation error:", error);
    res.status(500).json({
      valid: false,
      error: "Token validation failed"
    });
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
