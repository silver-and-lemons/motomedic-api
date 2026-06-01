import type { MotorcycleQuestionnaire } from "./dto/generate-checklist.dto.js";
import type { ChecklistItem } from "./dto/evaluate-checklist.dto.js";
import { rules } from "./types/checklist.rules.js";

/**
 * Generates a checklist of motorcycle maintenance items based on the rider's profile.
 * Iterates over all rules, evaluates each condition against the profile,
 * and returns only the matching items — all initially set to "pending".
 */
export function generate(profile: MotorcycleQuestionnaire): {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
  generatedAt: string
} {
  const items: ChecklistItem[] = rules
    .filter((rule) => rule.condition(profile))
    .map((rule) => ({
      id: rule.id,
      label: rule.label,
      description: rule.description,
      category: rule.category,
      condition: rule.conditionLabel,
      required: rule.required,
      status: "pending" as const,
    }));

  return {
    profile,
    items,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Evaluates the provided checklist items against the given profile.
 * Currently a pass-through that stamps the current timestamp.
 * Will later apply business rules to determine pass/fail/skipped status.
 */
export function evaluate(input: {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
}): {
  profile: MotorcycleQuestionnaire
  items: ChecklistItem[]
  evaluatedAt: string
} {
  return {
    profile: input.profile,
    items: input.items,
    evaluatedAt: new Date().toISOString(),
  };
}
