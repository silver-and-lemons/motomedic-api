# motomedic-api

This project was generated using the `create-lscs-api` scaffolder, based on the official La Salle Computer Society (LSCS) Backend Standards.

It is set up with the **Domain-Driven (Vertical Slicing)** architecture.

## Getting Started

All dependencies are installed during the project setup. To start the development server, run:

```bash
npm run dev
```

The server will start with hot-reloading, meaning it will automatically restart when you save a file.

> **Prerequisite:** Set `DATABASE_URL` in `.env` before running. See [Database Setup](#database-setup).

## Available Scripts

-   `npm start`: Starts the production server (builds the project first).
-   `npm run dev`: Starts the development server with hot-reloading.
-   `npm run build`: Compiles the TypeScript code to JavaScript in the `dist` directory.
-   `npm run lint`: Lints the codebase for potential errors.
-   `npm run format`: Formats the code using Prettier.
-   `npm test`: Runs all unit tests via Vitest.
-   `npm run db:push`: Push the Drizzle schema directly to the database (development).
-   `npm run db:generate`: Generate SQL migration files from schema changes.
-   `npm run db:migrate`: Apply pending migrations to the database.
-   `npm run db:studio`: Open Drizzle Studio browser UI to inspect data.

## Database Setup

### Prerequisites

- PostgreSQL 14+ running locally or remotely.
- A database already created (e.g., `CREATE DATABASE motomedic;`).

### Docker Setup (Recommended)

Spin up a PostgreSQL container with Docker Compose:

```bash
docker compose up -d
```

This starts PostgreSQL 16 on `localhost:5433` with default credentials (`motomedic/motomedic/motomedic`).

Then push the schema:

```bash
npm run db:push
```

To stop the container:

```bash
docker compose down
```

To stop and remove all data:

```bash
docker compose down -v
```

### Configuration

Copy the environment template and set your connection string:

```bash
cp .env.example .env
```

Then edit `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/motomedic
```

### Quick Start (Development)

Push the schema directly — no migration files needed:

```bash
npm run db:push
```

### Migration Workflow (Production / Team)

Generate migration files from schema changes, then apply them:

```bash
npm run db:generate
npm run db:migrate
```

Commit the generated files in `drizzle/` to version control so other devs can replay the same migrations.

### Schema

All tables and enums are defined in:

```
src/shared/infrastructure/database/schema.ts
```

Includes 6 PostgreSQL enums (`bike_type`, `fuel_system`, `cooling_system`, `checklist_status`) and 7 tables (`users`, `bikes`, `bike_owned`, `bike_statuses`, `bike_service_history`, `otp_tokens`, `refresh_tokens`) with indexes and foreign keys.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Language**: TypeScript
-   **JWT**: jose
-   **CORS**: cors
-   **Logger**: Winston
-   **Linter**: ESLint
-   **Formatter**: Prettier
-   **Testing**: Vitest
-   **Development Runner**: `tsx`
-   **API Docs**: Swagger UI (swagger-jsdoc)

## Git Workflow

### Branch Strategy

```
main        production — merges only from staging
  ↑
staging     pre-production QA — merges only from dev
  ↑
dev         integration — feature branches merge here
  ↑
feature/*   individual work — created from dev, merged back to dev
```

### Workflow

1. Start from the latest `dev`:
   ```
   git checkout dev && git pull
   ```

2. Create a feature branch:
   ```
   git checkout -b feat/my-feature
   ```

3. Work, commit (Conventional Commits), push.

4. Open a PR into `dev`. Squash-merge on approval.

5. When `dev` has a stable set of features, open a PR into `staging`.

6. After QA on `staging`, open a PR into `main`.

### Branch Naming

```
<type>/<kebab-case-description>
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`

Examples:
- `feat/add-auth-flow`
- `fix/user-login-redirect`
- `chore/update-deps`

### Module Conventions

Each feature module under `src/` must include a `README.md` documenting:
- Purpose and scope
- Directory structure
- Key types and DTOs
- API endpoints (if applicable)

## Features

### Environment Configuration — `src/shared/config/env.ts`
Typed config object with `port`, `nodeEnv`, `isProduction`, `corsOrigin` derived from environment variables. See `.env.example` for the full list of required variables.

### Logger — `src/shared/utils/logger.ts`
Winston logger with console transport — JSON format in production, colorized in development.

### Express App — `src/app.ts`
Express application with CORS, `express.json()` body parser, and global error handler mounted.

### Server Entry — `server.ts`
Entry point that imports the configured app and listens on the port from env config.

### Error Middleware — `src/shared/middleware/error.middleware.ts`
Centralized error handler that logs the error via Winston and returns a 500 JSON response.

### Auth Middleware — `src/shared/middleware/auth.middleware.ts`
JWT verification middleware using `jose`. Extracts and validates the Bearer token, attaches the authenticated user to `req.user`. Returns 401 on missing, invalid, or expired tokens.

### Authentication — `src/auth/`
Phone-number-based OTP authentication with JWT access/refresh token issuance. Riders register with phone, email, and full name; log in with phone only. OTP codes are generated, hashed (SHA-256), and stored with a 5-minute TTL. Access tokens expire in 15 minutes; refresh tokens in 7 days with rotation on use. Mock SMS delivery via console log — swap in a real provider later.

### OpenAPI Documentation — `src/shared/config/openapi.ts`
Interactive Swagger UI served at `/api/docs` in non-production environments via swagger-jsdoc annotations in DTO and controller files.

### Checklist Logic Engine — `src/checklist/`
Generates and evaluates motorcycle-specific checklist items from a rider's questionnaire profile. Rules engine with 5 always-shown and 8 conditional checks based on bike type, engine size, fuel system, cooling, and age. 25 unit tests covering all rules, controller handlers, and edge cases.
