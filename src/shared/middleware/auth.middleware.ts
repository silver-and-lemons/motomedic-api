import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { config } from "../config/env.js";
import { db } from "../config/database.js";
import { users } from "../infrastructure/database/schema.js";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    contactNumber: string | null;
  };
}

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

export const requireAuth = authenticate;
