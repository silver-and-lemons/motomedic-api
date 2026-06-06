# Checklist Module

Generates and evaluates motorcycle-specific checklist items based on a rider's questionnaire profile.

## Directory Structure

```
src/checklist/
  dto/
    generate-checklist.dto.ts
    evaluate-checklist.dto.ts
  types/
    checklist.rules.ts
  tests/
    checklist.service.test.ts
    checklist.controller.test.ts
    checklist.integration.test.ts
  checklist.openapi.ts       — OpenAPI paths + schemas (manual objects)
  checklist.service.ts       — Logic engine
  checklist.controller.ts    — HTTP handlers
  checklist.routes.ts        — Route definitions
  README.md
```

## Questionnaire Fields

| Step | Field | Values |
|---|---|---|
| Bike type | `bikeType` | `automatic-scooter`, `underbone`, `sport-naked-big-bike` |
| Engine size | `engineSize` | `100-125cc`, `126-155cc`, `156cc-above` |
| Fuel system | `fuelSystem` | `carbureted`, `fuel-injected` |
| Cooling | `cooling` | `air-cooled`, `liquid-cooled` |
| Bike age | `bikeAge` | `2014-and-older`, `2015-2019`, `2020-present` |

## Checklist Logic

### Always shown (all bikes)

| ID | Check |
|---|---|
| `tyres` | Tyre pressure & condition |
| `engine-oil` | Engine oil level |
| `brakes` | Front & rear brakes |
| `lights` | Lights |
| `fuel-level` | Fuel level |

### Conditional checks

| ID | Check | Condition |
|---|---|---|
| `chain` | Chain tension & lubrication | `bikeType` ≠ scooter |
| `sprocket` | Sprocket condition | `bikeType` ≠ scooter |
| `choke` | Choke & warm-up | `fuelSystem` = carbureted |
| `fi-light` | FI warning light | `fuelSystem` = fuel injected |
| `coolant` | Coolant level | `cooling` = liquid cooled |
| `battery` | Battery & electricals | `bikeAge` = 2014 and older |
| `brake-fluid` | Brake fluid level | `engineSize` = 156cc+ |
| `abs` | ABS self-check | `engineSize` = 156cc+ AND `fuelSystem` = fuel injected |

Min: 5 checks (scooter, FI, air-cooled, 2020+) — Max: 10 checks (big bike, FI, liquid-cooled, pre-2015)

## API Endpoints

### `POST /api/v1/checklist/generate`

Accepts a `MotorcycleQuestionnaire` and returns a `ChecklistResult` with all applicable items in `pending` status.

### `POST /api/v1/checklist/evaluate`

Accepts an `EvaluateInput` (profile + full items array). For now returns the items as-is with an `evaluatedAt` timestamp.

Interactive API documentation is available at `/api/docs` in development.

OpenAPI paths and schemas are defined in `checklist.openapi.ts` using typed plain objects. As more features are added, each feature module will export its own paths and schemas to be merged in the central OpenAPI config (`src/shared/config/openapi.ts`).

## Testing

25 unit tests across 2 test files:

| File | Tests | Scope |
|---|---|---|
| `tests/checklist.service.test.ts` | 19 | Core logic — `generate()` and `evaluate()` |
| `tests/checklist.controller.test.ts` | 6 | HTTP handlers — status codes, validation, error forwarding |

### Coverage

- Every conditional rule tested with positive and negative assertions
- Item status, profile echo, timestamp format verified
- Controller: 201/200 happy paths, 400 on null body, `next(err)` on service failure

### Run

```bash
npm test
```

## Key Types

| Type | Defined In | Purpose |
|---|---|---|
| `MotorcycleQuestionnaire` | `generate-checklist.dto.ts` | Input from rider questionnaire |
| `ChecklistItem` | `evaluate-checklist.dto.ts` | A single checklist entry |
| `ChecklistResult` | `generate-checklist.dto.ts` | Output of generate |
| `EvaluateInput` | `evaluate-checklist.dto.ts` | Input to evaluate |
| `EvaluateResult` | `evaluate-checklist.dto.ts` | Output of evaluate |
