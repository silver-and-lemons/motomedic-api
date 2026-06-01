import express from "express";
import { errorHandler } from "./shared/middleware/error.middleware.js";

const app = express();

app.use(express.json());
app.use(errorHandler);

export default app;
