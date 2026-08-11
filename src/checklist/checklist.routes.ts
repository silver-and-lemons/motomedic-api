/**
 * Checklist module routes.
 * Maps HTTP endpoints to controller handlers.
 */
import { Router } from "express";
import * as checklistController from "./checklist.controller.js";
import { authenticate } from "../shared/middleware/auth.middleware.js";

const router = Router();

router.post("/generate", authenticate, checklistController.generate);
router.post("/evaluate", authenticate, checklistController.evaluate);

export default router;
