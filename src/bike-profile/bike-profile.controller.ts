// bike-profile.controller.ts
import type { NextFunction, Request, Response } from "express";
import { 
    getBikeOwnedById, 
    createBikeOwned, 
    updateBikeOwned 
} from "./bike-profile.service.js";
import type { 
    CreateBikeOwnedInput, 
    UpdateBikeOwnedInput 
} from "./dto/bike-profile.dto.js";

function readSingleQueryValue(value: unknown): string | undefined {
    if (typeof value === "string") {
        return value;
    }
    return undefined;
}

/**
 * GET /api/v1/bike/profile
 * Retrieves the specific owned bike profile configurations.
 * Query Params: ?bikeOwnedId=UUID
 */
export async function getBikeProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
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

        // 2. Query and return record (Tenant-scoping is handled directly inside the service)
        const bikeProfile = await getBikeOwnedById(bikeOwnedId, userId);

        if (!bikeProfile) {
            res.status(404).json({ 
                message: "Not Found: Bike profile does not exist or you do not have permission to access it." 
            });
            return;
        }

        res.status(200).json(bikeProfile);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/v1/bike/profile
 * Registers/Creates a brand-new bike profile configuration, OR acts as a PATCH/Update if a bikeOwnedId is supplied to modify the record.
 */
export async function postBikeProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // 1. Extract and validate authentication context
        const authUser = (req as any).user;
        if (!authUser || !authUser.id) {
            res.status(401).json({ message: "Unauthorized: Missing authentication context" });
            return;
        }

        const userId = authUser.id;
        
        // Optional parameter to check if we are performing an update rather than registering a new one
        const bikeOwnedId = readSingleQueryValue(req.query.bikeOwnedId) || req.body.id;

        // 2. CASE A: Update/Modify existing profile
        if (bikeOwnedId) {
            const updateInput: UpdateBikeOwnedInput = {
                plateNumber: req.body.plateNumber,
                chassisNumber: req.body.chassisNumber,
                currentOdometer: req.body.currentOdometer,
                isActive: req.body.isActive,
            };

            const updatedBike = await updateBikeOwned(bikeOwnedId, userId, updateInput);

            if (!updatedBike) {
                res.status(404).json({ 
                    message: "Not Found: Cannot update. Bike profile does not exist or you do not have permission." 
                });
                return;
            }

            res.status(200).json(updatedBike);
            return;
        }

        // 3. CASE B: Register a new profile link
        const { bikeId, plateNumber, chassisNumber, currentOdometer } = req.body;

        if (bikeId === undefined || bikeId === null) {
            res.status(400).json({ message: "Bad Request: Missing bikeId in request body" });
            return;
        }

        const createInput: CreateBikeOwnedInput = {
            bikeId: Number(bikeId),
            plateNumber: plateNumber ?? null,
            chassisNumber: chassisNumber ?? null,
            currentOdometer: currentOdometer ? Number(currentOdometer) : 0,
        };

        const newBike = await createBikeOwned(userId, createInput);
        res.status(201).json(newBike);
    } catch (error) {
        next(error);
    }
}