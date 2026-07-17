/**
 * Checklist module routes.
 * Maps HTTP endpoints to controller handlers.
 */
import { Router } from "express";
import * as checklistController from "./bike-profile.controller.js";

const router = Router();

// Bike profile surface
router.get("/profile", checklistController.getBikeProfile);
router.post("/profile", checklistController.postBikeProfile);


export default router;
