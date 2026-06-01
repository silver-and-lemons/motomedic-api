# motomedic-api

This project was generated using the `create-lscs-api` scaffolder, based on the official La Salle Computer Society (LSCS) Backend Standards.

It is set up with the **Domain-Driven (Vertical Slicing)** architecture.

## Getting Started

All dependencies are installed during the project setup. To start the development server, run:

```bash
npm run dev
```

The server will start with hot-reloading, meaning it will automatically restart when you save a file.

## Available Scripts

-   `npm start`: Starts the production server (builds the project first).
-   `npm run dev`: Starts the development server with hot-reloading.
-   `npm run build`: Compiles the TypeScript code to JavaScript in the `dist` directory.
-   `npm run lint`: Lints the codebase for potential errors.
-   `npm run format`: Formats the code using Prettier.

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
Generates and evaluates motorcycle-specific checklist items from a rider's questionnaire profile. Rules engine with 5 always-shown and 8 conditional checks based on bike type, engine size, fuel system, cooling, and age.
