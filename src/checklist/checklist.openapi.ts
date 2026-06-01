/**
 * OpenAPI paths and schemas for the Checklist module.
 * Each schema and path is defined as a typed plain object
 * and exported for merging into the central OpenAPI spec.
 */
import type { OpenAPIV3 } from "openapi-types";

/** Schema for the motorcycle questionnaire input from the rider. */
const MotorcycleQuestionnaire: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["bikeType", "engineSize", "fuelSystem", "cooling", "bikeAge"],
  properties: {
    bikeType: {
      type: "string",
      enum: ["automatic-scooter", "underbone", "sport-naked-big-bike"],
    },
    engineSize: {
      type: "string",
      enum: ["100-125cc", "126-155cc", "156cc-above"],
    },
    fuelSystem: {
      type: "string",
      enum: ["carbureted", "fuel-injected"],
    },
    cooling: {
      type: "string",
      enum: ["air-cooled", "liquid-cooled"],
    },
    bikeAge: {
      type: "string",
      enum: ["2014-and-older", "2015-2019", "2020-present"],
    },
  },
};

/** Schema for a single checklist item returned to the client. */
const ChecklistItem: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["id", "label", "description", "category", "condition", "required", "status"],
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    description: { type: "string" },
    category: {
      type: "string",
      enum: ["engine", "brakes", "suspension", "drivetrain", "electrical", "tires"],
    },
    condition: { type: "string" },
    required: { type: "boolean" },
    status: {
      type: "string",
      enum: ["pending", "pass", "fail", "skipped"],
    },
  },
};

/** Schema wrapping the generated checklist and the original profile. */
const ChecklistResult: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: {
    profile: { $ref: "#/components/schemas/MotorcycleQuestionnaire" },
    items: {
      type: "array",
      items: { $ref: "#/components/schemas/ChecklistItem" },
    },
    generatedAt: { type: "string", format: "date-time" },
  },
};

/** Schema for the evaluate request — profile paired with items to check. */
const EvaluateInput: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["profile", "items"],
  properties: {
    profile: { $ref: "#/components/schemas/MotorcycleQuestionnaire" },
    items: {
      type: "array",
      items: { $ref: "#/components/schemas/ChecklistItem" },
    },
  },
};

/** Schema wrapping evaluated items with a timestamp. */
const EvaluateResult: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: {
    profile: { $ref: "#/components/schemas/MotorcycleQuestionnaire" },
    items: {
      type: "array",
      items: { $ref: "#/components/schemas/ChecklistItem" },
    },
    evaluatedAt: { type: "string", format: "date-time" },
  },
};

/** All checklist schemas keyed by name for merging. */
const schemas = {
  MotorcycleQuestionnaire,
  ChecklistItem,
  ChecklistResult,
  EvaluateInput,
  EvaluateResult,
};

/** POST /api/checklist/generate — creates a checklist from a questionnaire. */
const generatePath: OpenAPIV3.PathsObject = {
  "/api/checklist/generate": {
    post: {
      tags: ["Checklist"],
      summary: "Generate checklist items from a motorcycle questionnaire",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/MotorcycleQuestionnaire" },
          },
        },
      },
      responses: {
        201: {
          description: "Checklist generated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChecklistResult" },
            },
          },
        },
        400: {
          description: "Invalid or missing profile",
        },
      },
    },
  },
};

/** POST /api/checklist/evaluate — evaluates items against the profile. */
const evaluatePath: OpenAPIV3.PathsObject = {
  "/api/checklist/evaluate": {
    post: {
      tags: ["Checklist"],
      summary: "Evaluate checklist items against a motorcycle profile",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EvaluateInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Items evaluated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EvaluateResult" },
            },
          },
        },
        400: {
          description: "Invalid or missing input",
        },
      },
    },
  },
};

export const checklistOpenapi = {
  schemas,
  paths: { ...generatePath, ...evaluatePath },
} as const;
