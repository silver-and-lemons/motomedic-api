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