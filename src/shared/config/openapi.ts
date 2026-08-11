import { checklistOpenapi } from "../../checklist/checklist.openapi.js";
import { userProfileOpenapi } from "../../user-profile/user-profile.openapi.js";
import { authOpenapi } from "../../auth/auth.openapi.js";
import { bikeProfileOpenapi } from "../../bike-profile/bike-profile.openapi.js";
import { checklistHistoryOpenapi } from "../../checklist-history/checklist-history.openapi.js";

export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "MotoMedic API",
    version: "1.0.0",
    description:
      "Motorcycle checklist generation and evaluation engine — accepts a rider's bike profile and produces condition-based maintenance checks.",
  },
  servers: [{ url: "http://localhost:3000", description: "Development" }],
  paths: {
    ...checklistOpenapi.paths,
    ...userProfileOpenapi.paths,
    ...authOpenapi.paths,
    ...bikeProfileOpenapi.paths,
    ...checklistHistoryOpenapi.paths,
  },
  components: {
    schemas: {
      ...checklistOpenapi.schemas,
      ...userProfileOpenapi.schemas,
      ...authOpenapi.schemas,
      ...bikeProfileOpenapi.schemas,
      ...checklistHistoryOpenapi.schemas,
    },
  },
};
