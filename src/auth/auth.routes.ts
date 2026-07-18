/**
 * Auth module routes.
 * Maps HTTP endpoints to controller handlers.
 */
import { Router } from "express";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/verify-login", authController.verifyLoginOtp);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
