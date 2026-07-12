import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./shared/middleware/error.middleware.js";
import { config } from "./shared/config/env.js";
import { openapiSpec } from "./shared/config/openapi.js";
import checklistRoutes from "./checklist/checklist.routes.js";
import userProfileRoutes from "./user-profile/user-profile.routes.js";

const app = express();

app.use(express.json());

if (!config.isProduction) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
}

app.use("/api/v1/checklist", checklistRoutes);
app.use("/api/v1/user", userProfileRoutes);
app.use(errorHandler);

export default app;
