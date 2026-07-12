import { Router } from "express";
import { getUserProfile, updateUserProfile } from "./user-profile.controller.js";

const router = Router();

router.get("/", getUserProfile);

router.post("/update", updateUserProfile);

export default router;
