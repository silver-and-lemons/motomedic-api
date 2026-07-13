import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "../auth.service.js";

vi.mock("../../shared/config/database.js", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    returning: vi.fn().mockResolvedValue([{ id: "test-user-id" }]),
  },
}));

vi.mock("../../shared/utils/logger.js", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
  jwtVerify: vi.fn().mockRejectedValue(new Error("Invalid token")),
}));

const { db } = await import("../../shared/config/database.js");

function mockSelectChain(result: unknown[]) {
  const limitMock = vi.fn().mockResolvedValue(result);
  const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
  const fromMock = vi.fn().mockReturnValue({ where: whereMock });
  vi.mocked(db.select).mockReturnValue({ from: fromMock } as ReturnType<typeof db.select>);
}

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AppError", () => {
    it("should create an error with code, message, and statusCode", () => {
      const error = new authService.AppError("TEST_ERROR", "Test message", 400);
      expect(error.code).toBe("TEST_ERROR");
      expect(error.message).toBe("Test message");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("AppError");
    });
  });

  describe("registerUser", () => {
    it("should throw if phone already exists", async () => {
      mockSelectChain([{ id: "existing-user" }]);

      await expect(
        authService.registerUser({
          phone: "+639123456789",
          email: "test@example.com",
          fullName: "Test User",
        }),
      ).rejects.toThrow("Phone number already registered");
    });

    it("should throw if email already exists", async () => {
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(
                callCount === 1 ? [] : [{ id: "existing-user" }],
              ),
            }),
          }),
        } as ReturnType<typeof db.select>;
      });

      await expect(
        authService.registerUser({
          phone: "+639123456789",
          email: "existing@example.com",
          fullName: "Test User",
        }),
      ).rejects.toThrow("Email already registered");
    });
  });

  describe("loginUser", () => {
    it("should throw if user not found", async () => {
      mockSelectChain([]);

      await expect(
        authService.loginUser({ phone: "+639123456789" }),
      ).rejects.toThrow("No account found with this phone number");
    });
  });

  describe("verifyOtp", () => {
    it("should throw if no valid OTP found", async () => {
      mockSelectChain([]);

      await expect(
        authService.verifyOtp({ userId: "test-user-id", otp: "123456" }),
      ).rejects.toThrow("Invalid or expired OTP");
    });
  });

  describe("verifyLoginOtp", () => {
    it("should throw if no valid OTP found", async () => {
      mockSelectChain([]);

      await expect(
        authService.verifyLoginOtp({ userId: "test-user-id", otp: "123456" }),
      ).rejects.toThrow("Invalid or expired OTP");
    });
  });

  describe("refreshTokensHandler", () => {
    it("should throw if refresh token is invalid", async () => {
      await expect(
        authService.refreshTokensHandler({ refreshToken: "invalid-token" }),
      ).rejects.toThrow("Invalid or expired refresh token");
    });
  });

  describe("logoutHandler", () => {
    it("should not throw even with invalid token", async () => {
      await expect(
        authService.logoutHandler({ refreshToken: "invalid-token" }),
      ).resolves.not.toThrow();
    });
  });
});
