import type { MotorcycleQuestionnaire } from "./generate-checklist.dto.js";

export type ChecklistCategory = "engine" | "brakes" | "suspension" | "drivetrain" | "electrical" | "tires";

export type ChecklistStatus = "pending" | "pass" | "fail" | "skipped";

export interface ChecklistItem {
  id: string
  label: string
  category: ChecklistCategory
  condition: string
  required: boolean
  status: ChecklistStatus
}

export interface EvaluateInput {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
}

export interface EvaluateResult {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
  evaluatedAt: string
}
