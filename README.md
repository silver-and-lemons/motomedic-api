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
-   `npm run db:seed`: Seeds bike catalog data from `data/bikes_raw.json`.

## Database Setup

### Option A — Docker (recommended)

Spin up a PostgreSQL container:

```bash
docker compose up -d
cp .env.example .env
npm run db:push
```

Docker Compose uses default credentials (`postgres:postgres@localhost:5432/motomedic`) unless overridden in `.env`.

### Option B — Local PostgreSQL

**Prerequisites:**
- PostgreSQL 14+ running locally or remotely.
- A database already created (e.g., `CREATE DATABASE motomedic;`).

Copy the environment template and set your connection string:

```bash
cp .env.example .env
```

Then edit `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/motomedic
```

### Push Schema (Development)

```bash
npm run db:push
```

### Seed Data

Place your `bikes_raw.json` in `data/` and run:

```bash
npm run db:seed
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

Re-exported via `src/shared/infrastructure/database/index.ts`.

Includes 4 PostgreSQL enums (`bike_type`, `fuel_system`, `cooling_system`, `checklist_status`) and 5 tables (`users`, `bikes`, `bike_owned`, `bike_statuses`, `bike_service_history`) with indexes and foreign keys.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Language**: TypeScript
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
Typed config object with `port`, `nodeEnv`, `isProduction` derived from environment variables.

### Logger — `src/shared/utils/logger.ts`
Winston logger with console transport — JSON format in production, colorized in development.

### Express App — `src/app.ts`
Express application with `express.json()` body parser and global error handler mounted.

### Server Entry — `server.ts`
Entry point that imports the configured app and listens on the port from env config.

### Error Middleware — `src/shared/middleware/error.middleware.ts`
Centralized error handler that logs the error via Winston and returns a 500 JSON response.

### OpenAPI Documentation — `src/shared/config/openapi.ts`
Interactive Swagger UI served at `/api/docs` in non-production environments via swagger-jsdoc annotations in DTO and controller files.

### Checklist Logic Engine — `src/checklist/`
Generates and evaluates motorcycle-specific checklist items from a rider's questionnaire profile. Rules engine with 5 always-shown and 8 conditional checks based on bike type, engine size, fuel system, cooling, and age. 25 unit tests covering all rules, controller handlers, and edge cases.
