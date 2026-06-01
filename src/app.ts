import express from "express";
import { errorHandler } from "./shared/middleware/error.middleware.js";
import checklistRoutes from "./checklist/checklist.routes.js";

const app = express();

app.use(express.json());
app.use("/api/checklist", checklistRoutes);
app.use(errorHandler);

export default app;
