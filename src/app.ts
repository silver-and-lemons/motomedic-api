import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./shared/middleware/error.middleware.js";
import { requireAuth } from "./shared//middleware/auth.middleware.js";
import { config } from "./shared/config/env.js";
import { openapiSpec } from "./shared/config/openapi.js";
import checklistRoutes from "./checklist/checklist.routes.js";
import bikeProfileRoutes from "./bike-profile/bike-profile.routes.js";
import userProfileRoutes from "./user-profile/user-profile.routes.js";
import authRoutes from "./auth/auth.routes.js";

const app = express();

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

if (!config.isProduction) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
}

app.use("/api/v1/checklist", requireAuth, checklistRoutes);
app.use("/api/v1/user", requireAuth, userProfileRoutes);
app.use("/api/v1/bike", requireAuth, bikeProfileRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/checklist", checklistRoutes);
app.use(errorHandler);

export default app;
