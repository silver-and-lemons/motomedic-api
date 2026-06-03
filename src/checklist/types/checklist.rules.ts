import type { MotorcycleQuestionnaire } from "../dto/generate-checklist.dto.js";
import type { ChecklistCategory } from "../dto/evaluate-checklist.dto.js";

/** A single checklist rule: defines when an item appears and its metadata. */
export interface Rule {
  id: string
  label: string
  description: string
  category: ChecklistCategory
  condition: (profile: MotorcycleQuestionnaire) => boolean
  conditionLabel: string
  required: boolean
}

/**
 * All checklist rules for the motorcycle profile questionnaire.
 * Rules with `condition: () => true` are always shown.
 * Conditional rules filter based on profile fields.
 */
export const rules: Rule[] = [
  {
    id: "tyres",
    label: "Tyre pressure & condition",
    description: "Check for cuts, cracks, or low pressure on both tyres.",
    category: "tires",
    condition: () => true,
    conditionLabel: "Always check",
    required: true,
  },
  {
    id: "engine-oil",
    label: "Engine oil level",
    description: "Check the sight glass or dipstick — top up if below the minimum line.",
    category: "engine",
    condition: () => true,
    conditionLabel: "Always check",
    required: true,
  },
  {
    id: "brakes",
    label: "Front & rear brakes",
    description: "Squeeze levers and press foot brake — confirm firm resistance.",
    category: "brakes",
    condition: () => true,
    conditionLabel: "Always check",
    required: true,
  },
  {
    id: "lights",
    label: "Lights",
    description: "Headlight, brake light, and signal lights — check all are working.",
    category: "electrical",
    condition: () => true,
    conditionLabel: "Always check",
    required: true,
  },
  {
    id: "fuel-level",
    label: "Fuel level",
    description: "Enough fuel for the trip — don't rely on reserve.",
    category: "engine",
    condition: () => true,
    conditionLabel: "Always check",
    required: true,
  },
  {
    id: "chain",
    label: "Chain tension & lubrication",
    description: "Chain should have ~20–30mm of slack. Dry or stiff links? Lubricate before riding.",
    category: "drivetrain",
    condition: (p) => p.bikeType !== "automatic-scooter",
    conditionLabel: "Bikes with chains need regular tension and lube checks",
    required: true,
  },
  {
    id: "sprocket",
    label: "Sprocket condition",
    description: "Check teeth for wear — hooked or uneven teeth mean it's time to replace.",
    category: "drivetrain",
    condition: (p) => p.bikeType !== "automatic-scooter",
    conditionLabel: "Sprockets wear alongside the chain",
    required: true,
  },
  {
    id: "choke",
    label: "Choke & warm-up",
    description: "Set choke before starting. Let the engine warm for 1–2 minutes before riding.",
    category: "engine",
    condition: (p) => p.fuelSystem === "carbureted",
    conditionLabel: "Carbureted engines need choke and warm-up",
    required: true,
  },
  {
    id: "fi-light",
    label: "FI warning light",
    description: "The FI light should turn off a few seconds after starting. If it stays on, don't ride.",
    category: "electrical",
    condition: (p) => p.fuelSystem === "fuel-injected",
    conditionLabel: "Fuel-injected bikes have an FI indicator",
    required: true,
  },
  {
    id: "coolant",
    label: "Coolant level",
    description: "Check the reservoir — fluid should be between MIN and MAX lines.",
    category: "engine",
    condition: (p) => p.cooling === "liquid-cooled",
    conditionLabel: "Liquid-cooled bikes need proper coolant levels",
    required: true,
  },
  {
    id: "battery",
    label: "Battery & electricals",
    description: "Older bikes lose battery charge faster. Check that all electrics respond before leaving.",
    category: "electrical",
    condition: (p) => p.bikeAge === "2014-and-older",
    conditionLabel: "Pre-2015 bikes have weaker charging systems",
    required: true,
  },
  {
    id: "brake-fluid",
    label: "Brake fluid level",
    description: "Check both front and rear reservoirs — fluid should be above the MIN line.",
    category: "brakes",
    condition: (p) => p.engineSize === "156cc-above",
    conditionLabel: "Big bikes have hydraulic brakes that need fluid checks",
    required: true,
  },
  {
    id: "abs",
    label: "ABS self-check",
    description: "At low speed after starting, confirm the ABS indicator light clears before hitting the road.",
    category: "brakes",
    condition: (p) => p.engineSize === "156cc-above" && p.fuelSystem === "fuel-injected",
    conditionLabel: "Fuel-injected big bikes typically have ABS",
    required: true,
  },
];
