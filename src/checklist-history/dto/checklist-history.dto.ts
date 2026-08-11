export type ChecklistStatus = 'Pass' | 'Fail' | 'N/A';

export type GetChecklistHistoryQuery = {
    bikeOwnedId: string;
};

export type ChecklistHistoryResponse = {
    id: string;
    bikeOwnedId: string;
    loggedAt: Date;
    odometerAtInspection: number | null;
    
    // Main Checklist
    tyrePressureCondition: ChecklistStatus;
    engineOilLevel: ChecklistStatus;
    frontRearBrakes: ChecklistStatus;
    lights: ChecklistStatus;
    fuelLevel: ChecklistStatus;

    // Additional Checklist
    chainTensionLubrication: ChecklistStatus;
    sprocketCondition: ChecklistStatus;
    chokeWarmup: ChecklistStatus;
    fiWarningLight: ChecklistStatus;
    coolantLevel: ChecklistStatus;
    batteryElectricals: ChecklistStatus;
    brakeFluidLevel: ChecklistStatus;
    absSelfCheck: ChecklistStatus;

    remarks: string | null;
    createdAt: Date;
};

export type CreateChecklistLogInput = {
    bikeOwnedId: string;
    odometerAtInspection?: number | null;
    
    // Main Checklist
    tyrePressureCondition?: ChecklistStatus;
    engineOilLevel?: ChecklistStatus;
    frontRearBrakes?: ChecklistStatus;
    lights?: ChecklistStatus;
    fuelLevel?: ChecklistStatus;

    // Additional Checklist
    chainTensionLubrication?: ChecklistStatus;
    sprocketCondition?: ChecklistStatus;
    chokeWarmup?: ChecklistStatus;
    fiWarningLight?: ChecklistStatus;
    coolantLevel?: ChecklistStatus;
    batteryElectricals?: ChecklistStatus;
    brakeFluidLevel?: ChecklistStatus;
    absSelfCheck?: ChecklistStatus;

    remarks?: string | null;
};