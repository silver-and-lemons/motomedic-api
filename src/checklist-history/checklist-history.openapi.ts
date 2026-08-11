import type { OpenAPIV3 } from "openapi-types";

const ChecklistStatusSchema: OpenAPIV3.SchemaObject = {
    type: "string",
    enum: ["Pass", "Fail", "N/A"],
    default: "Pass"
};

const ChecklistHistoryItem: OpenAPIV3.SchemaObject = {
    type: "object",
    required: [
        "id",
        "bikeOwnedId",
        "loggedAt",
        "tyrePressureCondition",
        "engineOilLevel",
        "frontRearBrakes",
        "lights",
        "fuelLevel",
        "chainTensionLubrication",
        "sprocketCondition",
        "chokeWarmup",
        "fiWarningLight",
        "coolantLevel",
        "batteryElectricals",
        "brakeFluidLevel",
        "absSelfCheck",
        "createdAt"
    ],
    properties: {
        id: { type: "string", format: "uuid" },
        bikeOwnedId: { type: "string", format: "uuid" },
        loggedAt: { type: "string", format: "date-time" },
        odometerAtInspection: { type: "integer", nullable: true },
        
        // Main Checklist
        tyrePressureCondition: { $ref: "#/components/schemas/ChecklistStatus" },
        engineOilLevel: { $ref: "#/components/schemas/ChecklistStatus" },
        frontRearBrakes: { $ref: "#/components/schemas/ChecklistStatus" },
        lights: { $ref: "#/components/schemas/ChecklistStatus" },
        fuelLevel: { $ref: "#/components/schemas/ChecklistStatus" },
        
        // Additional Checklist
        chainTensionLubrication: { $ref: "#/components/schemas/ChecklistStatus" },
        sprocketCondition: { $ref: "#/components/schemas/ChecklistStatus" },
        chokeWarmup: { $ref: "#/components/schemas/ChecklistStatus" },
        fiWarningLight: { $ref: "#/components/schemas/ChecklistStatus" },
        coolantLevel: { $ref: "#/components/schemas/ChecklistStatus" },
        batteryElectricals: { $ref: "#/components/schemas/ChecklistStatus" },
        brakeFluidLevel: { $ref: "#/components/schemas/ChecklistStatus" },
        absSelfCheck: { $ref: "#/components/schemas/ChecklistStatus" },
        
        remarks: { type: "string", nullable: true },
        createdAt: { type: "string", format: "date-time" }
    }
};

const CreateChecklistLogInputSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    required: ["bikeOwnedId"],
    properties: {
        bikeOwnedId: { type: "string", format: "uuid" },
        odometerAtInspection: { type: "integer", nullable: true },
        
        // Main Checklist (Optional payload overrides)
        tyrePressureCondition: { $ref: "#/components/schemas/ChecklistStatus" },
        engineOilLevel: { $ref: "#/components/schemas/ChecklistStatus" },
        frontRearBrakes: { $ref: "#/components/schemas/ChecklistStatus" },
        lights: { $ref: "#/components/schemas/ChecklistStatus" },
        fuelLevel: { $ref: "#/components/schemas/ChecklistStatus" },
        
        // Additional Checklist (Optional payload overrides)
        chainTensionLubrication: { $ref: "#/components/schemas/ChecklistStatus" },
        sprocketCondition: { $ref: "#/components/schemas/ChecklistStatus" },
        chokeWarmup: { $ref: "#/components/schemas/ChecklistStatus" },
        fiWarningLight: { $ref: "#/components/schemas/ChecklistStatus" },
        coolantLevel: { $ref: "#/components/schemas/ChecklistStatus" },
        batteryElectricals: { $ref: "#/components/schemas/ChecklistStatus" },
        brakeFluidLevel: { $ref: "#/components/schemas/ChecklistStatus" },
        absSelfCheck: { $ref: "#/components/schemas/ChecklistStatus" },
        
        remarks: { type: "string", nullable: true }
    }
};

export const checklistHistoryOpenapi = {
    schemas: {
        ChecklistStatus: ChecklistStatusSchema,
        ChecklistHistoryItem,
        CreateChecklistLogInput: CreateChecklistLogInputSchema
    },
    paths: {
        "/api/v1/checklist/history": {
            post: {
                tags: ["Checklist History"],
                summary: "Get checklist history for a bike",
                description: "Retrieves all pre-ride inspection checklists recorded for a specific bike. Auth-gated and strictly scoped to matching user ownership.",
                parameters: [
                    {
                        name: "bikeOwnedId",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "The unique ID of the owned bike configuration."
                    }
                ],
                responses: {
                    200: {
                        description: "Successfully retrieved checklist history logs, sorted newest-first.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/ChecklistHistoryItem" }
                                }
                            }
                        }
                    },
                    400: {
                        description: "Bad Request: Missing bikeOwnedId parameter."
                    },
                    401: {
                        description: "Unauthorized: Missing authentication context."
                    },
                    403: {
                        description: "Forbidden: You do not have permission to access logs for this bike."
                    }
                }
            }
        },
        "/api/v1/checklist/save-checklist": {
            post: {
                tags: ["Checklist History"],
                summary: "Save a new pre-ride checklist entry",
                description: "Saves a new safety checklist evaluation. Ensures that the targeted bike is owned by the logged-in user.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CreateChecklistLogInput" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Checklist run successfully saved to history database.",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ChecklistHistoryItem" }
                            }
                        }
                    },
                    400: {
                        description: "Bad Request: Missing required properties (such as bikeOwnedId)."
                    },
                    401: {
                        description: "Unauthorized: Missing authentication context."
                    },
                    403: {
                        description: "Forbidden: You cannot save checklist history logs for a bike you do not own."
                    }
                }
            }
        }
    }
} as const;