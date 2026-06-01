# Checklist Module

Generates and evaluates motorcycle-specific checklist items based on a rider's questionnaire profile.

## Directory Structure

```
src/checklist/
  dto/
    generate-checklist.dto.ts   — MotorcycleQuestionnaire (input), ChecklistResult (output)
    evaluate-checklist.dto.ts   — ChecklistItem, EvaluateInput, EvaluateResult types
  tests/
    checklist.service.test.ts
    checklist.controller.test.ts
    checklist.integration.test.ts
  checklist.service.ts          — Logic engine: generate + evaluate
  checklist.controller.ts       — HTTP handlers
  checklist.routes.ts           — Route definitions
```

## API Endpoints

### `POST /api/checklist/generate`

Accepts a `MotorcycleQuestionnaire` and returns a `ChecklistResult` with all items in `pending` status.

### `POST /api/checklist/evaluate`

Accepts an `EvaluateInput` (profile + full items array) and returns an `EvaluateResult` with updated statuses.

## Key Types

| Type | Defined In | Purpose |
|---|---|---|
| `MotorcycleQuestionnaire` | `generate-checklist.dto.ts` | Input from rider questionnaire |
| `ChecklistItem` | `evaluate-checklist.dto.ts` | A single checklist entry |
| `ChecklistResult` | `generate-checklist.dto.ts` | Output of generate |
| `EvaluateInput` | `evaluate-checklist.dto.ts` | Input to evaluate |
| `EvaluateResult` | `evaluate-checklist.dto.ts` | Output of evaluate |
