import { checklistOpenapi } from "../../checklist/checklist.openapi.js";

export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "MotoMedic API",
    version: "1.0.0",
    description:
      "Motorcycle checklist generation and evaluation engine — accepts a rider's bike profile and produces condition-based maintenance checks.",
  },
  servers: [{ url: "http://localhost:3000", description: "Development" }],
  paths: { ...checklistOpenapi.paths },
  components: { schemas: { ...checklistOpenapi.schemas } },
};
