import { checklistOpenapi } from "../../checklist/checklist.openapi.js";
import { authOpenapi } from "../../auth/auth.openapi.js";

export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "MotoMedic API",
    version: "1.0.0",
    description:
      "Motorcycle checklist generation and evaluation engine — accepts a rider's bike profile and produces condition-based maintenance checks.",
  },
  servers: [{ url: "http://localhost:3000", description: "Development" }],
  paths: { ...authOpenapi.paths, ...checklistOpenapi.paths },
  components: {
    schemas: {
      ...authOpenapi.schemas,
      ...checklistOpenapi.schemas,
    },
  },
};
