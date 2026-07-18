// bike-profile.service.ts
import { and, eq } from "drizzle-orm";
import { db } from "../shared/infrastructure/database/index.js";
import { bikeOwned } from "../shared/infrastructure/database/schema.js";
import type { 
    BikeOwnedResponse, 
    CreateBikeOwnedInput, 
    UpdateBikeOwnedInput 
} from "./dto/bike-profile.dto.js";

/**
 * Maps a raw Drizzle database row from the `bikeOwned` table to our BikeOwnedResponse DTO structure.
 */
function mapBikeOwnedRow(row: typeof bikeOwned.$inferSelect): BikeOwnedResponse {
    return {
        id: row.id,
        userId: row.userId,
        bikeId: row.bikeId,
        plateNumber: row.plateNumber ?? null,
        chassisNumber: row.chassisNumber ?? null,
        currentOdometer: row.currentOdometer ?? 0,
        isActive: row.isActive ?? true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

/**
 * Retrieves an owned bike profile by its UUID, scoped to a specific owner.
 * Returns `null` if the record does not exist or the tenancy checks fail.
 */
export async function getBikeOwnedById(id: string, userId: string): Promise<BikeOwnedResponse | null> {
    const [record] = await db
        .select()
        .from(bikeOwned)
        .where(
            and(
                eq(bikeOwned.id, id),
                eq(bikeOwned.userId, userId)
            )
        )
        .limit(1);

    if (!record) return null;
    return mapBikeOwnedRow(record);
}

/**
 * Links/Registers a new motorcycle model to a user profile.
 */
export async function createBikeOwned(userId: string, input: CreateBikeOwnedInput): Promise<BikeOwnedResponse> {
    const [insertedRow] = await db
        .insert(bikeOwned)
        .values({
            userId: userId,
            bikeId: input.bikeId,
            plateNumber: input.plateNumber ?? null,
            chassisNumber: input.chassisNumber ?? null,
            currentOdometer: input.currentOdometer ?? 0,
            isActive: true, // Defaults to true on register
        })
        .returning();

    return mapBikeOwnedRow(insertedRow);
}

/**
 * Updates properties (such as odometer readings, active status, or registration IDs) 
 * on an owned bike record.
 */
export async function updateBikeOwned(id: string, userId: string, input: UpdateBikeOwnedInput): Promise<BikeOwnedResponse | null> {
    const [updatedRow] = await db
        .update(bikeOwned)
        .set({
            plateNumber: input.plateNumber !== undefined ? input.plateNumber : undefined,
            chassisNumber: input.chassisNumber !== undefined ? input.chassisNumber : undefined,
            currentOdometer: input.currentOdometer !== undefined ? input.currentOdometer : undefined,
            isActive: input.isActive !== undefined ? input.isActive : undefined,
        })
        .where(
            and(
                eq(bikeOwned.id, id),
                eq(bikeOwned.userId, userId)
            )
        )
        .returning();

    if (!updatedRow) return null;
    return mapBikeOwnedRow(updatedRow);
}