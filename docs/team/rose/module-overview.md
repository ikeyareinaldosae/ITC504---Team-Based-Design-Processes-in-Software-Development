# Module overview: database (Rose Budha)

**Purpose.** Store movies and their weekly revenue, enforce the data rules in one place, and give the API a ready set of tested functions.

**Technology.** PostgreSQL 16, Prisma 6.19, TypeScript, Node.js 22, Docker Compose (the same stack as the team's other project).

**Inputs.** Calls from the API controllers (Chandani) through the repository functions.

**Outputs.** Movies, weekly records, weekly reports with previous week and percent change, revenue trends and review flags, as plain objects with `YYYY-MM-DD` dates and numeric revenue.

**Files.** `database/prisma/` (schema, migration, seed), `backend/src/rose/` (client and repositories), `tests/integration/database.test.ts`, `docs/team/rose/`.

**Depends on.** Nothing. Other modules depend on it: Chandani (API), Avishek (analytics reads weekly data through the report functions).

**How to run and test.** See `database/rose/README.md`.
