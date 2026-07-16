import { desc, eq } from "drizzle-orm";
import { db } from "../shared/infrastructure/database/index.js";
import { bikeStatuses } from "../shared/infrastructure/database/schema.js";
import type { GetChecklistHistoryQuery, ChecklistHistoryResponse, ChecklistStatus, CreateChecklistLogInput } from "./dto/bike-profile.dto.js";

function mapChecklistRow(row: typeof bikeStatuses.$inferSelect): ChecklistHistoryResponse {
    return {
        id: row.id,
        bikeOwnedId: row.bikeOwnedId,
        loggedAt: row.loggedAt,
        odometerAtInspection: row.odometerAtInspection ?? null,
        
        // Coerce or fallback to valid string cast for the enums
        tyrePressureCondition: (row.tyrePressureCondition ?? 'Pass') as ChecklistStatus,
        engineOilLevel: (row.engineOilLevel ?? 'Pass') as ChecklistStatus,
        frontRearBrakes: (row.frontRearBrakes ?? 'Pass') as ChecklistStatus,
        lights: (row.lights ?? 'Pass') as ChecklistStatus,
        fuelLevel: (row.fuelLevel ?? 'Pass') as ChecklistStatus,
        
        chainTensionLubrication: (row.chainTensionLubrication ?? 'Pass') as ChecklistStatus,
        sprocketCondition: (row.sprocketCondition ?? 'Pass') as ChecklistStatus,
        chokeWarmup: (row.chokeWarmup ?? 'Pass') as ChecklistStatus,
        fiWarningLight: (row.fiWarningLight ?? 'Pass') as ChecklistStatus,
        coolantLevel: (row.coolantLevel ?? 'Pass') as ChecklistStatus,
        batteryElectricals: (row.batteryElectricals ?? 'Pass') as ChecklistStatus,
        brakeFluidLevel: (row.brakeFluidLevel ?? 'Pass') as ChecklistStatus,
        absSelfCheck: (row.absSelfCheck ?? 'Pass') as ChecklistStatus,
        
        remarks: row.remarks ?? null,
        createdAt: row.createdAt,
    };
}

/**
 * Retrieves the history of checklist logs for a specific bike configuration.
 * Results are sorted latest-first.
 */
export async function getChecklistHistoryByBike(query: GetChecklistHistoryQuery): Promise<ChecklistHistoryResponse[]> {
    const records = await db
        .select()
        .from(bikeStatuses)
        .where(eq(bikeStatuses.bikeOwnedId, query.bikeOwnedId))
        .orderBy(desc(bikeStatuses.loggedAt));

    return records.map(mapChecklistRow);
}

/**
 * Commits a brand new motorcycle inspection log into the history.
 */
export async function createChecklistLog(input: CreateChecklistLogInput): Promise<ChecklistHistoryResponse> {
    const [insertedRow] = await db
        .insert(bikeStatuses)
        .values({
            bikeOwnedId: input.bikeOwnedId,
            odometerAtInspection: input.odometerAtInspection ?? null,
            tyrePressureCondition: input.tyrePressureCondition,
            engineOilLevel: input.engineOilLevel,
            frontRearBrakes: input.frontRearBrakes,
            lights: input.lights,
            fuelLevel: input.fuelLevel,
            chainTensionLubrication: input.chainTensionLubrication,
            sprocketCondition: input.sprocketCondition,
            chokeWarmup: input.chokeWarmup,
            fiWarningLight: input.fiWarningLight,
            coolantLevel: input.coolantLevel,
            batteryElectricals: input.batteryElectricals,
            brakeFluidLevel: input.brakeFluidLevel,
            absSelfCheck: input.absSelfCheck,
            remarks: input.remarks ?? null,
        })
        .returning();

    return mapChecklistRow(insertedRow);
}

/**
 * Retrieves the latest checklist/status row for a specific bikeOwnedId.
 * Returns `null` when no records exist.
 */
export async function getLatestChecklistByBike(query: GetChecklistHistoryQuery): Promise<ChecklistHistoryResponse | null> {
    const records = await db
        .select()
        .from(bikeStatuses)
        .where(eq(bikeStatuses.bikeOwnedId, query.bikeOwnedId))
        .orderBy(desc(bikeStatuses.loggedAt))
        .limit(1);

    if (!records || records.length === 0) return null;
    return mapChecklistRow(records[0]);
}

/**
 * Alias for createChecklistLog with a clearer name for bike-profile surface.
 */
export async function createBikeStatus(input: CreateChecklistLogInput): Promise<ChecklistHistoryResponse> {
    return createChecklistLog(input);
}