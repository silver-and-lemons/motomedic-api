import type { ChecklistItem } from "./evaluate-checklist.dto.js";

/** Motorcycle brand/type categories from the questionnaire. */
export type BikeType = "automatic-scooter" | "underbone" | "sport-naked-big-bike";

/** Engine displacement ranges. */
export type EngineSize = "100-125cc" | "126-155cc" | "156cc-above";

/** Fuel delivery system. */
export type FuelSystem = "carbureted" | "fuel-injected";

/** Engine cooling method. */
export type Cooling = "air-cooled" | "liquid-cooled";

/** Bike age brackets. */
export type BikeAge = "2014-and-older" | "2015-2019" | "2020-present";

/** Input from the rider questionnaire — 5 fields that drive checklist generation. */
export interface MotorcycleQuestionnaire {
  bikeType: BikeType
  engineSize: EngineSize
  fuelSystem: FuelSystem
  cooling: Cooling
  bikeAge: BikeAge
}

/** Output of the generate endpoint — profile mirrored back with generated items. */
export interface ChecklistResult {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
  generatedAt: string
}
