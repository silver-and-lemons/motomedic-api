import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import * as authController from "../auth.controller.js";
import * as authService from "../auth.service.js";

vi.mock("../auth.service.js", () => ({
  AppError: class AppError extends Error {
    constructor(
      public code: string,
      message: string,
      public statusCode: number,
    ) {
      super(message);
      this.name = "AppError";
    }
  },
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  verifyOtp: vi.fn(),
  verifyLoginOtp: vi.fn(),
  refreshTokensHandler: vi.fn(),
  logoutHandler: vi.fn(),
}));

describe("Auth Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe("register", () => {
    it("should return 400 if body is missing", async () => {
      req.body = undefined;
      await authController.register(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid or missing request body" });
    });

    it("should return 400 if required fields are missing", async () => {
      req.body = { phone: "+639123456789" };
      await authController.register(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Phone, email, and full name are required" });
    });

    it("should return 201 on success", async () => {
      req.body = { phone: "+639123456789", email: "test@example.com", fullName: "Test User" };
      vi.mocked(authService.registerUser).mockResolvedValue({ userId: "user-123", message: "OTP sent" });
      await authController.register(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ userId: "user-123", message: "OTP sent" });
    });

    it("should return error status on AppError", async () => {
      req.body = { phone: "+639123456789", email: "test@example.com", fullName: "Test User" };
      vi.mocked(authService.registerUser).mockRejectedValue(
        new authService.AppError("PHONE_EXISTS", "Phone already registered", 409),
      );
      await authController.register(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Phone already registered", code: "PHONE_EXISTS" });
    });
  });

  describe("verifyOtp", () => {
    it("should return 400 if body is missing", async () => {
      req.body = undefined;
      await authController.verifyOtp(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if userId is missing", async () => {
      req.body = { otp: "123456" };
      await authController.verifyOtp(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User ID and OTP are required" });
    });

    it("should return 200 on success", async () => {
      req.body = { userId: "user-123", otp: "123456" };
      vi.mocked(authService.verifyOtp).mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "user-123", email: "test@example.com", fullName: "Test", contactNumber: "+639123456789" },
        hasBikeProfile: false,
      });
      await authController.verifyOtp(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return 400 if phone is missing", async () => {
      req.body = {};
      await authController.login(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Phone number is required" });
    });

    it("should return 200 on success", async () => {
      req.body = { phone: "+639123456789" };
      vi.mocked(authService.loginUser).mockResolvedValue({ userId: "user-123", message: "OTP sent" });
      await authController.login(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ userId: "user-123", message: "OTP sent" });
    });
  });

  describe("verifyLoginOtp", () => {
    it("should return 400 if userId is missing", async () => {
      req.body = { otp: "123456" };
      await authController.verifyLoginOtp(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 200 on success", async () => {
      req.body = { userId: "user-123", otp: "123456" };
      vi.mocked(authService.verifyLoginOtp).mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "user-123", email: "test@example.com", fullName: "Test", contactNumber: "+639123456789" },
        hasBikeProfile: true,
      });
      await authController.verifyLoginOtp(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("refresh", () => {
    it("should return 400 if refreshToken is missing", async () => {
      req.body = {};
      await authController.refresh(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Refresh token is required" });
    });

    it("should return 200 on success", async () => {
      req.body = { refreshToken: "valid-refresh-token" };
      vi.mocked(authService.refreshTokensHandler).mockResolvedValue({
        accessToken: "new-access",
        refreshToken: "new-refresh",
      });
      await authController.refresh(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("logout", () => {
    it("should return 400 if refreshToken is missing", async () => {
      req.body = {};
      await authController.logout(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 204 on success", async () => {
      req.body = { refreshToken: "valid-refresh-token" };
      vi.mocked(authService.logoutHandler).mockResolvedValue(undefined);
      await authController.logout(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
