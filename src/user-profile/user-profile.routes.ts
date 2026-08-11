import { Router } from "express";
import * as userProfileController from "./user-profile.controller.js";

const router = Router();

router.get("/", userProfileController.getUserProfile);

router.post("/update", userProfileController.updateUserProfile);

export default router;
