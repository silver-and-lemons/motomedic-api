import type { Request, Response, NextFunction } from "express";
import type { RegisterInput } from "./dto/register.dto.js";
import type { VerifyOtpInput } from "./dto/verify-otp.dto.js";
import type { LoginInput } from "./dto/login.dto.js";
import type { RefreshInput } from "./dto/refresh.dto.js";
import * as authService from "./auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as RegisterInput;

    if (!input || typeof input !== "object") {
      res.status(400).json({ message: "Invalid or missing request body" });
      return;
    }

    if (!input.phone || !input.email || !input.fullName) {
      res.status(400).json({ message: "Phone, email, and full name are required" });
      return;
    }

    const result = await authService.registerUser(input);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof authService.AppError) {
      res.status(err.statusCode).json({ message: err.message, code: err.code });
      return;
    }
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as VerifyOtpInput;

    if (!input || typeof input !== "object") {
      res.status(400).json({ message: "Invalid or missing request body" });
      return;
    }

    if (!input.userId || !input.otp) {
      res.status(400).json({ message: "User ID and OTP are required" });
      return;
    }

    const result = await authService.verifyOtp(input);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof authService.AppError) {
      res.status(err.statusCode).json({ message: err.message, code: err.code });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as LoginInput;

    if (!input || typeof input !== "object") {
      res.status(400).json({ message: "Invalid or missing request body" });
      return;
    }

    if (!input.phone) {
      res.status(400).json({ message: "Phone number is required" });
      return;
    }

    const result = await authService.loginUser(input);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof authService.AppError) {
      res.status(err.statusCode).json({ message: err.message, code: err.code });
      return;
    }
    next(err);
  }
}

export async function verifyLoginOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as VerifyOtpInput;

    if (!input || typeof input !== "object") {
      res.status(400).json({ message: "Invalid or missing request body" });
      return;
    }

    if (!input.userId || !input.otp) {
      res.status(400).json({ message: "User ID and OTP are required" });
      return;
    }

    const result = await authService.verifyLoginOtp(input);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof authService.AppError) {
      res.status(err.statusCode).json({ message: err.message, code: err.code });
      return;
    }
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as RefreshInput;

    if (!input || typeof input !== "object") {
      res.status(400).json({ message: "Invalid or missing request body" });
      return;
    }

    if (!input.refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    const result = await authService.refreshTokensHandler(input);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof authService.AppError) {
      res.status(err.statusCode).json({ message: err.message, code: err.code });
      return;
    }
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as RefreshInput;

    if (!input || typeof input !== "object") {
      res.status(400).json({ message: "Invalid or missing request body" });
      return;
    }

    if (!input.refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    await authService.logoutHandler(input);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
