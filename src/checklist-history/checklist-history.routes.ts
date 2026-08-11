/**
 * Checklist module routes.
 * Maps HTTP endpoints to controller handlers.
 */
import { Router } from "express";
import * as checklistController from "./checklist-history.controller.js";

const router = Router();

router.post("/history", checklistController.getChecklistHistory);
router.post("/save-checklist", checklistController.saveChecklistHistory);

export default router;
