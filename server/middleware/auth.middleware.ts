import type { Request, Response, NextFunction } from "express";
import { resolveUserFromRequest } from "../lib/auth-user.js";

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user as any;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
}

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await resolveUserFromRequest(req);
    if (user) req.user = user as any;
    next();
  } catch {
    next();
  }
}

export function hasRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await resolveUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = user as any;
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: Required role not assigned" });
      }
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(500).json({ message: "Authentication error" });
    }
  };
}

export const adminMiddleware = hasRole(["admin"]);
export const adminOrDeveloperMiddleware = hasRole(["admin", "developer"]);
export const sellerMiddleware = hasRole(["seller", "admin"]);
export const buyerMiddleware = hasRole(["buyer", "admin"]);
