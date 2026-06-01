import type { ChecklistItem } from "./evaluate-checklist.dto.js";

export interface MotorcycleQuestionnaire {
  brand: string
  model: string
  year: number
  engineType: "chain" | "belt" | "shaft"
  displacement: number
  mileage: number
  usageType: "daily" | "track" | "offroad" | "occasional"
  lastServiceDate?: string
  lastServiceMileage?: number
  lastServiceItems?: string[]
}

export interface ChecklistResult {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
  generatedAt: string
}
