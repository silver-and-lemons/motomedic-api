import { Router } from "express";
import { getUserProfile } from "./user-profile.controller.js";

const router = Router();

router.get("/", getUserProfile);

export default router;
