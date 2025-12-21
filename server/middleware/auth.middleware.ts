import type { Request, Response, NextFunction } from "express";

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check if user exists in session
  if (!req.session.userId || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Add user to request object for easy access
  req.user = req.session.user;
  
  next();
}

// Role-based access control middleware
export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('Role check - session userId:', req.session?.userId, 'user:', req.session?.user?.email, 'role:', req.session?.user?.role);
    
    if (!req.session.userId || !req.session.user) {
      console.log('Authorization failed: no session user');
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.user = req.session.user;
    
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
