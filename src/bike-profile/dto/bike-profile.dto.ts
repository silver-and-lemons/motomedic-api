
export type CreateBikeOwnedInput = {
    bikeId: number;                     // Matches bigint represented as number
    plateNumber?: string | null;        // Unique, optional identifier
    chassisNumber?: string | null;      // Optional manufacturer tracking number
    currentOdometer?: number;           // Defaults to 0 on database level
};

export type UpdateBikeOwnedInput = {
    plateNumber?: string | null;
    chassisNumber?: string | null;
    currentOdometer?: number;
    isActive?: boolean;
};

export type GetBikeOwnedQuery = {
    bikeOwnedId: string;                // Represents the UUID of the owned record
};

export type BikeOwnedResponse = {
    id: string;                         // UUID primary key
    userId: string;                     // Owner UUID reference
    bikeId: number;                     // Bigint represented as number
    plateNumber: string | null;
    chassisNumber: string | null;
    currentOdometer: number;            // Defaults to 0, represented as integer
    isActive: boolean;                  // Defaults to true
    createdAt: Date;
    updatedAt: Date;
};