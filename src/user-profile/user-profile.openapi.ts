import type { OpenAPIV3 } from "openapi-types";

const UserProfile: OpenAPIV3.SchemaObject = {
	type: "object",
	required: ["id", "email", "fullName", "createdAt", "updatedAt"],
	properties: {
		id: { type: "string", format: "uuid" },
		googleId: { type: "string", nullable: true },
		email: { type: "string", format: "email" },
		fullName: { type: "string" },
		contactNumber: { type: "string", nullable: true },
		avatarUrl: { type: "string", nullable: true },
		createdAt: { type: "string", format: "date-time" },
		updatedAt: { type: "string", format: "date-time" },
	},
};

const UserProfileIdQuery: OpenAPIV3.ParameterObject = {
	name: "id",
	in: "query",
	required: false,
	schema: { type: "string", format: "uuid" },
	description: "Optional user id to look up a specific profile.",
};

const UserProfileEmailQuery: OpenAPIV3.ParameterObject = {
	name: "email",
	in: "query",
	required: false,
	schema: { type: "string", format: "email" },
	description: "Optional email to look up a specific profile.",
};

export const userProfileOpenapi = {
	schemas: { UserProfile },
	paths: {
		"/api/v1/user": {
			get: {
				tags: ["User Profile"],
				summary: "Get a user profile",
				parameters: [UserProfileIdQuery, UserProfileEmailQuery],
				responses: {
					200: {
						description: "User profile retrieved successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/UserProfile" },
							},
						},
					},
					404: {
						description: "User profile not found",
					},
				},
			},
		},
	},
} as const;
