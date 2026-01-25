import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Mock users for development mode
const MOCK_USERS = {
  seller: {
    id: 2,
    name: "Test Seller",
    email: "seller@test.com",
    role: "seller" as const,
    avatar: "",
  },
  buyer: {
    id: 3,
    name: "Test Buyer",
    email: "buyer@test.com",
    role: "buyer" as const,
    avatar: "",
  },
  admin: {
    id: 1,
    name: "Admin User",
    email: "admin@test.com",
    role: "admin" as const,
    avatar: "",
  },
};

// Development mode bypass middleware
function bypassAuthIfEnabled(req: Request, res: Response, next: NextFunction) {
  // Check if auth bypass is enabled
  if (process.env.DISABLE_AUTH === 'true') {
    // Get mock user role from env or default to seller
    const mockRole = (process.env.MOCK_USER_ROLE || 'seller') as keyof typeof MOCK_USERS;
    const mockUser = MOCK_USERS[mockRole] || MOCK_USERS.seller;

    // Set mock user in request and session
    req.user = mockUser as any;
    req.session.userId = mockUser.id;
    req.session.user = mockUser as any;

    console.log('🔓 [DEV MODE] Auth bypassed, using mock user:', mockUser.email, `(${mockUser.role})`);
    return next();
  }

  // Normal authentication flow
  return next();
}

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check if bypass is enabled first
  if (process.env.DISABLE_AUTH === 'true') {
    return bypassAuthIfEnabled(req, res, next);
  }

  // Check if user exists in session
  if (!req.session.userId || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Add user to request object for easy access
  req.user = req.session.user as any;

  next();
}

// Optional authentication middleware - populates req.user if session exists, but doesn't require it
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Check if bypass is enabled first
  if (process.env.DISABLE_AUTH === 'true') {
    return bypassAuthIfEnabled(req, res, next);
  }

  // If user exists in session, add to request object
  if (req.session.userId && req.session.user) {
    req.user = req.session.user as any;
  }

  next();
}

// Role-based access control middleware
export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if bypass is enabled first
    if (process.env.DISABLE_AUTH === 'true') {
      return bypassAuthIfEnabled(req, res, next);
    }

    console.log('Role check - session userId:', req.session?.userId, 'user:', req.session?.user?.email, 'role:', req.session?.user?.role);

    if (!req.session.userId || !req.session.user) {
      console.log('Authorization failed: no session user');
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = req.session.user as any;

    if (!roles.includes(req.user?.role as string)) {
      console.log('Role check failed: user role', req.user?.role, 'not in required roles', roles);
      return res.status(403).json({ message: `Forbidden: Required role not assigned` });
    }

    console.log('Role check passed for user:', req.user?.email);
    next();
  };
}

// Short-hand middleware for common role combinations
export const adminMiddleware = hasRole(['admin']);
export const adminOrDeveloperMiddleware = hasRole(['admin', 'developer']);
export const sellerMiddleware = hasRole(['seller', 'admin']);
export const buyerMiddleware = hasRole(['buyer', 'admin']);
