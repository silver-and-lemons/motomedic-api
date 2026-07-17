import type { OpenAPIV3 } from "openapi-types";

/**
 * Schema representing BikeOwnedResponse
 */
const BikeOwnedResponseSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    required: [
        "id",
        "userId",
        "bikeId",
        "currentOdometer",
        "isActive",
        "createdAt",
        "updatedAt"
    ],
    properties: {
        id: { 
            type: "string", 
            format: "uuid",
            description: "The unique system UUID for the user's linked bike record."
        },
        userId: { 
            type: "string", 
            format: "uuid",
            description: "The UUID of the authenticated owner."
        },
        bikeId: { 
            type: "integer",
            description: "The underlying global bike model reference ID (bigint mapped to number)."
        },
        plateNumber: { 
            type: "string", 
            nullable: true,
            maxLength: 50,
            description: "The unique license plate number of the vehicle."
        },
        chassisNumber: { 
            type: "string", 
            nullable: true,
            maxLength: 100,
            description: "The manufacturer identification chassis number."
        },
        currentOdometer: { 
            type: "integer", 
            default: 0,
            description: "The current recorded distance traveled by the vehicle."
        },
        isActive: { 
            type: "boolean", 
            default: true,
            description: "Indicates whether the bike configuration is actively used by the rider."
        },
        createdAt: { 
            type: "string", 
            format: "date-time" 
        },
        updatedAt: { 
            type: "string", 
            format: "date-time" 
        }
    }
};

/**
 * Schema representing CreateBikeOwnedInput (JSON Request Body)
 */
const CreateBikeOwnedInputSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    required: ["bikeId"],
    properties: {
        bikeId: { 
            type: "integer", 
            description: "The global motorcycle catalog ID to bind." 
        },
        plateNumber: { 
            type: "string", 
            nullable: true,
            maxLength: 50 
        },
        chassisNumber: { 
            type: "string", 
            nullable: true,
            maxLength: 100 
        },
        currentOdometer: { 
            type: "integer", 
            default: 0 
        }
    }
};

/**
 * Schema representing UpdateBikeOwnedInput (JSON Request Body via POST updates)
 */
const UpdateBikeOwnedInputSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        plateNumber: { 
            type: "string", 
            nullable: true, 
            maxLength: 50 
        },
        chassisNumber: { 
            type: "string", 
            nullable: true, 
            maxLength: 100 
        },
        currentOdometer: { 
            type: "integer" 
        },
        isActive: { 
            type: "boolean" 
        }
    }
};

export const bikeProfileOpenapi = {
    schemas: {
        BikeOwnedResponse: BikeOwnedResponseSchema,
        CreateBikeOwnedInput: CreateBikeOwnedInputSchema,
        UpdateBikeOwnedInput: UpdateBikeOwnedInputSchema
    },
    paths: {
        "/api/v1/bike/profile": {
            get: {
                tags: ["Bike Profile"],
                summary: "Retrieve owned bike configuration details",
                description: "Gets specific registration and telemetry info for an owned bike. Gated to authenticated requests; returns 404/403 if the record does not exist or belongs to another user.",
                parameters: [
                    {
                        name: "bikeOwnedId",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "The system UUID mapping the motorcycle's record."
                    }
                ],
                responses: {
                    200: {
                        description: "Bike registration details retrieved successfully.",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/BikeOwnedResponse" }
                            }
                        }
                    },
                    400: {
                        description: "Bad Request: Missing bikeOwnedId parameter."
                    },
                    401: {
                        description: "Unauthorized: Access token missing or invalid."
                    },
                    404: {
                        description: "Not Found: No configuration found for this ID under your profile."
                    }
                }
            },
            post: {
                tags: ["Bike Profile"],
                summary: "Register a bike or update an existing configuration",
                description: "Overloaded controller behavior: If `bikeOwnedId` is provided in the query string (or `id` in the request body), it acts as an update patch. If omitted, it registers and maps a new bike profile.",
                parameters: [
                    {
                        name: "bikeOwnedId",
                        in: "query",
                        required: false,
                        schema: { type: "string", format: "uuid" },
                        description: "Provide to transition route behavior into a partial update (PATCH) mode."
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                oneOf: [
                                    { $ref: "#/components/schemas/CreateBikeOwnedInput" },
                                    { $ref: "#/components/schemas/UpdateBikeOwnedInput" }
                                ]
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Successfully linked new motorcycle configuration to the user account.",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/BikeOwnedResponse" }
                            }
                        }
                    },
                    200: {
                        description: "Existing configuration updated successfully.",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/BikeOwnedResponse" }
                            }
                        }
                    },
                    400: {
                        description: "Bad Request: Missing required properties."
                    },
                    401: {
                        description: "Unauthorized: Authentication required."
                    },
                    404: {
                        description: "Not Found: Profile update targets a non-existent or un-owned record."
                    }
                }
            }
        }
    }
} as const;