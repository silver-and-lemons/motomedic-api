/**
 * OpenAPI paths and schemas for the Auth module.
 * Each schema and path is defined as a typed plain object
 * and exported for merging into the central OpenAPI spec.
 */
import type { OpenAPIV3 } from "openapi-types";

/** Schema for the registration input. */
const RegisterInput: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["phone", "email", "fullName"],
  properties: {
    phone: { type: "string", example: "+639123456789" },
    email: { type: "string", format: "email", example: "rider@example.com" },
    fullName: { type: "string", example: "Juan Dela Cruz" },
  },
};

/** Schema for the OTP verification input. */
const VerifyOtpInput: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["userId", "otp"],
  properties: {
    userId: { type: "string", format: "uuid" },
    otp: { type: "string", example: "123456" },
  },
};

/** Schema for the login input. */
const LoginInput: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["phone"],
  properties: {
    phone: { type: "string", example: "+639123456789" },
  },
};

/** Schema for the refresh token input. */
const RefreshInput: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["refreshToken"],
  properties: {
    refreshToken: { type: "string" },
  },
};

/** Schema for the authenticated user. */
const AuthUser: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    fullName: { type: "string" },
    contactNumber: { type: "string", nullable: true },
  },
};

/** Schema for the auth tokens response. */
const AuthTokens: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: {
    accessToken: { type: "string" },
    refreshToken: { type: "string" },
  },
};

/** Schema for the registration response. */
const RegisterResponse: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: {
    userId: { type: "string", format: "uuid" },
    message: { type: "string" },
  },
};

/** Schema for the login response. */
const LoginResponse: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: {
    userId: { type: "string", format: "uuid" },
    message: { type: "string" },
  },
};

/** Schema for the verify OTP response. */
const VerifyOtpResponse: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: {
    accessToken: { type: "string" },
    refreshToken: { type: "string" },
    user: { $ref: "#/components/schemas/AuthUser" },
    hasBikeProfile: { type: "boolean" },
  },
};

/** All auth schemas keyed by name for merging. */
const schemas = {
  RegisterInput,
  VerifyOtpInput,
  LoginInput,
  RefreshInput,
  AuthUser,
  AuthTokens,
  RegisterResponse,
  LoginResponse,
  VerifyOtpResponse,
};

/** POST /api/v1/auth/register — creates a new rider account. */
const registerPath: OpenAPIV3.PathsObject = {
  "/api/v1/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a new rider account",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Account created, OTP sent",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterResponse" },
            },
          },
        },
        400: { description: "Missing required fields" },
        409: { description: "Phone or email already registered" },
      },
    },
  },
};

/** POST /api/v1/auth/verify-otp — verifies OTP for registration. */
const verifyOtpPath: OpenAPIV3.PathsObject = {
  "/api/v1/auth/verify-otp": {
    post: {
      tags: ["Auth"],
      summary: "Verify OTP for registration",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VerifyOtpInput" },
          },
        },
      },
      responses: {
        200: {
          description: "OTP verified, tokens issued",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyOtpResponse" },
            },
          },
        },
        400: { description: "Missing required fields" },
        401: { description: "Invalid or expired OTP" },
      },
    },
  },
};

/** POST /api/v1/auth/login — sends OTP to existing rider. */
const loginPath: OpenAPIV3.PathsObject = {
  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login with phone number",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginInput" },
          },
        },
      },
      responses: {
        200: {
          description: "OTP sent",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginResponse" },
            },
          },
        },
        400: { description: "Missing phone number" },
        404: { description: "No account found with this phone number" },
      },
    },
  },
};

/** POST /api/v1/auth/verify-login — verifies OTP for login. */
const verifyLoginPath: OpenAPIV3.PathsObject = {
  "/api/v1/auth/verify-login": {
    post: {
      tags: ["Auth"],
      summary: "Verify OTP for login",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VerifyOtpInput" },
          },
        },
      },
      responses: {
        200: {
          description: "OTP verified, tokens issued",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyOtpResponse" },
            },
          },
        },
        400: { description: "Missing required fields" },
        401: { description: "Invalid or expired OTP" },
      },
    },
  },
};

/** POST /api/v1/auth/refresh — rotates refresh token. */
const refreshPath: OpenAPIV3.PathsObject = {
  "/api/v1/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Refresh access token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RefreshInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Tokens refreshed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthTokens" },
            },
          },
        },
        400: { description: "Missing refresh token" },
        401: { description: "Invalid or expired refresh token" },
      },
    },
  },
};

/** POST /api/v1/auth/logout — revokes refresh token. */
const logoutPath: OpenAPIV3.PathsObject = {
  "/api/v1/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Logout and revoke refresh token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RefreshInput" },
          },
        },
      },
      responses: {
        204: { description: "Logged out successfully" },
        400: { description: "Missing refresh token" },
      },
    },
  },
};

export const authOpenapi = {
  schemas,
  paths: {
    ...registerPath,
    ...verifyOtpPath,
    ...loginPath,
    ...verifyLoginPath,
    ...refreshPath,
    ...logoutPath,
  },
} as const;
