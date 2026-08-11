# Auth Module

Phone-number-based OTP authentication with JWT token issuance and refresh.

## Directory Structure

```
src/auth/
  dto/
    register.dto.ts
    verify-otp.dto.ts
    login.dto.ts
    refresh.dto.ts
  types/
    auth.types.ts
  tests/
    auth.service.test.ts
    auth.controller.test.ts
    auth.integration.test.ts
  auth.openapi.ts       — OpenAPI paths + schemas
  auth.service.ts       — OTP generation, verification, JWT issuance
  auth.controller.ts    — HTTP handlers
  auth.routes.ts        — Route definitions
  README.md
```

## Auth Flow

### Registration

1. `POST /api/v1/auth/register` — `{ phone, email, fullName }` → creates user, sends OTP
2. `POST /api/v1/auth/verify-otp` — `{ userId, otp }` → verifies OTP, returns token pair

### Login

1. `POST /api/v1/auth/login` — `{ identifier }` → sends OTP to existing user (email or phone)
2. `POST /api/v1/auth/verify-login` — `{ userId, otp }` → verifies OTP, returns token pair

### Token Management

- `POST /api/v1/auth/refresh` — `{ refreshToken }` → rotates tokens
- `POST /api/v1/auth/logout` — `{ refreshToken }` → revokes refresh token

## API Endpoints

### `POST /api/v1/auth/register`

Creates a new rider account. Returns `{ userId, message }`. Returns 409 if phone or email already exists.

### `POST /api/v1/auth/verify-otp`

Verifies the OTP for registration. Returns `{ accessToken, refreshToken, expiresIn, user, hasBikeProfile }`. The `hasBikeProfile` boolean tells the frontend to route to bike selection (false) or dashboard (true).

### `POST /api/v1/auth/login`

Sends an OTP to an existing rider's email or phone. Returns `{ userId, message }`. Returns 404 if the identifier is not found.

### `POST /api/v1/auth/verify-login`

Verifies the OTP for login. Same response as verify-otp.

### `POST /api/v1/auth/refresh`

Rotates the refresh token. Returns new `{ accessToken, refreshToken, expiresIn }`. Returns 401 if token is invalid, expired, or already used.

### `POST /api/v1/auth/logout`

Revokes the refresh token. Returns 204 No Content.

## Key Types

| Type | Defined In | Purpose |
|---|---|---|
| `RegisterInput` | `dto/register.dto.ts` | Registration request body |
| `VerifyOtpInput` | `dto/verify-otp.dto.ts` | OTP verification request body |
| `LoginInput` | `dto/login.dto.ts` | Login request body |
| `RefreshInput` | `dto/refresh.dto.ts` | Token refresh request body |
| `AuthTokens` | `types/auth.types.ts` | Access + refresh token pair |
| `AuthUser` | `types/auth.types.ts` | Authenticated user shape |
| `OtpPurpose` | `types/auth.types.ts` | `"register"` or `"login"` |

## JWT Configuration

| Token | Expiry | Storage |
|---|---|---|
| Access token | 15 minutes | Client-side (memory/localStorage) |
| Refresh token | 7 days | Server-side DB (`refresh_tokens` table) + client |

## OTP Security

- 6-digit numeric code
- Stored as SHA-256 hash (never plaintext)
- 5-minute expiry
- Only one active unverified OTP per user (previous deleted on new request)
- Purpose-scoped (`register` or `login`) to prevent cross-use

## Testing

| File | Scope |
|---|---|
| `tests/auth.service.test.ts` | OTP generation, hashing, verification, token issuance, refresh rotation |
| `tests/auth.controller.test.ts` | Request validation, response shapes, error codes |
| `tests/auth.integration.test.ts` | Full HTTP flow with supertest |

### Run

```bash
npm test
```
