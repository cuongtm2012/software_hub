import { Request, Response, NextFunction } from "express";
import { verifySupabaseToken } from "../lib/supabase.js";

declare global {
  namespace Express {
    interface Request {
      supabaseUser?: { id: string; email?: string };
    }
  }
}

/**
 * Optional Supabase JWT auth middleware.
 * Checks Authorization: Bearer <token> header and attaches supabaseUser.
 * Falls through if no token — session auth still works during migration.
 */
export async function supabaseAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const user = await verifySupabaseToken(token);
    if (user) req.supabaseUser = user;
  } catch {
    // Supabase not configured yet — ignore
  }
  next();
}
