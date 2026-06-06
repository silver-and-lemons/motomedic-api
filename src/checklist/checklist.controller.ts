import type { Request, Response, NextFunction } from "express";
import type { MotorcycleQuestionnaire } from "./dto/generate-checklist.dto.js";
import type { EvaluateInput } from "./dto/evaluate-checklist.dto.js";
import * as checklistService from "./checklist.service.js";

/**
 * POST /api/v1/checklist/generate
 * Validates the request body, delegates to the service, and returns
 * the generated checklist with status 201. Returns 400 on invalid input.
 */
export function generate(req: Request, res: Response, next: NextFunction): void {
  try {
    const profile = req.body as MotorcycleQuestionnaire;

    if (!profile || typeof profile !== "object") {
      res.status(400).json({ message: "Invalid or missing profile" });
      return;
    }

    const result = checklistService.generate(profile);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/checklist/evaluate
 * Validates the request body, delegates to the service, and returns
 * the evaluated items with status 200. Returns 400 on invalid input.
 */
export function evaluate(req: Request, res: Response, next: NextFunction): void {
  try {
    const input = req.body as EvaluateInput;

    if (!input || typeof input !== "object") {
      res.status(400).json({ message: "Invalid or missing input" });
      return;
    }

    const result = checklistService.evaluate(input);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
