/**
 * Checklist module routes.
 * Maps HTTP endpoints to controller handlers.
 */
import { Router } from "express";
import * as checklistController from "./checklist.controller.js";

const router = Router();

router.post("/generate", checklistController.generate);
router.post("/evaluate", checklistController.evaluate);

export default router;
