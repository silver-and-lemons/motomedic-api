// Authentication middleware
import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

/**
 * Middleware to enforce authentication on routes.
 * Pulls the user context (typically decoded from a JWT or session token)
 * and attaches it to the Request object.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: Missing or invalid token format" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        // TODO: Replace with your actual token verification logic (JWT, Supabase, etc.)
        // For demonstration, let's assume decoding the token yields the user payload:
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Mocked verification assignment:
        (req as any).user = {
            id: "user-uuid-placeholder", // Populate from verified token
            email: "user@example.com"    // Populate from verified token
        };

        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid or expired session token" });
    }
}
import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { config } from "../config/env.js";
import { db } from "../config/database.js";
import { users } from "../infrastructure/database/schema.js";
import { eq } from "drizzle-orm";

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing or invalid authorization header" });
    return;
  }

  const token = header.slice(7);
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(config.jwt.accessSecret),
    );

    if (payload.type !== "access") {
      res.status(401).json({ message: "Invalid token type" });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub! as string)).limit(1);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      contactNumber: user.contactNumber,
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
