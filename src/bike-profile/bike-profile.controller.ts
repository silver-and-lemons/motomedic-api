import type { NextFunction, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../shared/infrastructure/database/index.js";
import { bikeOwned } from "../shared/infrastructure/database/schema.js";
import { createChecklistLog, getChecklistHistoryByBike, getLatestChecklistByBike, createBikeStatus } from "./bike-profile.service.js";

function readSingleQueryValue(value: unknown): string | undefined {
    if (typeof value === "string") {
        return value;
    }
    return undefined;
}

/**
 * GET /api/v1/checklist/history
 * Retrieves all checklist records for a specific bike configuration.
 * Auth-gated: Validates that the requested bike is owned by the authenticated user.
 */
export async function getChecklistHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // 1. Extract and validate authentication context
        const authUser = (req as any).user;
        if (!authUser || !authUser.id) {
            res.status(401).json({ message: "Unauthorized: Missing authentication context" });
            return;
        }

        const userId = authUser.id;
        const bikeOwnedId = readSingleQueryValue(req.query.bikeOwnedId);

        if (!bikeOwnedId) {
            res.status(400).json({ message: "Bad Request: Missing bikeOwnedId parameter" });
            return;
        }

        // 2. 🔒 Security Boundary: Verify ownership of the requested bike record
        const [ownershipRecord] = await db
            .select({ id: bikeOwned.id })
            .from(bikeOwned)
            .where(
                and(
                    eq(bikeOwned.id, bikeOwnedId),
                    eq(bikeOwned.userId, userId)
                )
            )
            .limit(1);

        // If no matching ownership record exists, return a 403 Forbidden to prevent data leaks.
        if (!ownershipRecord) {
            res.status(403).json({ 
                message: "Forbidden: You do not have permission to access logs for this bike." 
            });
            return;
        }

        // 3. Fetch logs securely once ownership is proven
        const history = await getChecklistHistoryByBike({ bikeOwnedId });

        res.status(200).json(history);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/checklist
 * Creates a brand new checklist history entry for a motorcycle.
 * Auth-gated: Validates target bike ownership before processing the insertion.
 */
export async function saveChecklistHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // 1. Extract and validate authentication context
        const authUser = (req as any).user;
        if (!authUser || !authUser.id) {
            res.status(401).json({ message: "Unauthorized: Missing authentication context" });
            return;
        }

        const userId = authUser.id;
        const { bikeOwnedId, ...checklistFields } = req.body;

        if (!bikeOwnedId) {
            res.status(400).json({ message: "Bad Request: Missing bikeOwnedId inside request body" });
            return;
        }

        // 2. 🔒 Security Boundary: Protect records from cross-user injections
        const [ownershipRecord] = await db
            .select({ id: bikeOwned.id })
            .from(bikeOwned)
            .where(
                and(
                    eq(bikeOwned.id, bikeOwnedId),
                    eq(bikeOwned.userId, userId)
                )
            )
            .limit(1);

        if (!ownershipRecord) {
            res.status(403).json({ 
                message: "Forbidden: You cannot save checklist history logs for a bike you do not own." 
            });
            return;
        }

        // 3. Process insertion securely
        const newLog = await createChecklistLog({
            bikeOwnedId,
            ...checklistFields
        });

        res.status(201).json(newLog);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/v1/bike/profile
 * Returns the latest saved bike status for the authenticated user's bike.
 */
export async function getBikeProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authUser = (req as any).user;
        if (!authUser || !authUser.id) {
            res.status(401).json({ message: "Unauthorized: Missing authentication context" });
            return;
        }

        const userId = authUser.id;
        const bikeOwnedId = readSingleQueryValue(req.query.bikeOwnedId);

        if (!bikeOwnedId) {
            res.status(400).json({ message: "Bad Request: Missing bikeOwnedId parameter" });
            return;
        }

        const [ownershipRecord] = await db
            .select({ id: bikeOwned.id })
            .from(bikeOwned)
            .where(
                and(
                    eq(bikeOwned.id, bikeOwnedId),
                    eq(bikeOwned.userId, userId)
                )
            )
            .limit(1);

        if (!ownershipRecord) {
            res.status(403).json({ message: "Forbidden: You do not have permission to access this bike." });
            return;
        }

        const latest = await getLatestChecklistByBike({ bikeOwnedId });
        res.status(200).json(latest);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/bike/profile
 * Creates a new bike status entry for the authenticated user's bike.
 */
export async function postBikeProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authUser = (req as any).user;
        if (!authUser || !authUser.id) {
            res.status(401).json({ message: "Unauthorized: Missing authentication context" });
            return;
        }

        const userId = authUser.id;
        const { bikeOwnedId, ...checklistFields } = req.body;

        if (!bikeOwnedId) {
            res.status(400).json({ message: "Bad Request: Missing bikeOwnedId inside request body" });
            return;
        }

        const [ownershipRecord] = await db
            .select({ id: bikeOwned.id })
            .from(bikeOwned)
            .where(
                and(
                    eq(bikeOwned.id, bikeOwnedId),
                    eq(bikeOwned.userId, userId)
                )
            )
            .limit(1);

        if (!ownershipRecord) {
            res.status(403).json({ message: "Forbidden: You cannot save status logs for a bike you do not own." });
            return;
        }

        const newStatus = await createBikeStatus({ bikeOwnedId, ...checklistFields });
        res.status(201).json(newStatus);
    } catch (error) {
        next(error);
    }
}