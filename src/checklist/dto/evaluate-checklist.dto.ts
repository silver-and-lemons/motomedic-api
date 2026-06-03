import type { MotorcycleQuestionnaire } from "./generate-checklist.dto.js";

/** Functional groups a checklist item can belong to. */
export type ChecklistCategory = "engine" | "brakes" | "suspension" | "drivetrain" | "electrical" | "tires";

/** Lifecycle state of a checklist item. */
export type ChecklistStatus = "pending" | "pass" | "fail" | "skipped";

/** A single checklist entry returned to the client. */
export interface ChecklistItem {
  id: string
  label: string
  description: string
  category: ChecklistCategory
  condition: string
  required: boolean
  status: ChecklistStatus
}

/** Input to the evaluate endpoint — profile paired with items to evaluate. */
export interface EvaluateInput {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
}

/** Output of the evaluate endpoint — same structure with an evaluation timestamp. */
export interface EvaluateResult {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
  evaluatedAt: string
}
