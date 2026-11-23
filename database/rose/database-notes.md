# Database notes (Rose Budha)

Decisions and open items for the database module. Update this file when one of them changes.

## Decisions

- **PostgreSQL with Prisma, in Docker Compose.** The team's other project uses the same stack. SQLite and Python (the Assessment 1 version) were dropped.
- **Hand-written migration.** Prisma generates the tables, then the migration adds what Prisma cannot describe: CHECK constraints, a calculated `isoWeek` column, a case-insensitive unique index on movie titles and usernames, and the views `v_weekly_report` and `v_review_flags`. Use `prisma migrate deploy` to apply it. Do not run `prisma migrate dev` on this schema, because it would try to remove the hand-written parts.
- **Money as `numeric`.** Revenue is exact (no floating-point rounding) and a CHECK rejects more than 2 decimal places.
- **A week is a `date` that must be a Monday.** The week label `2026-W40` is calculated by the database from the date.
- **Queries are raw SQL through Prisma** (`$queryRaw`), because the weekly report and the review flags come from views. Parameters are always passed as values, never joined into the SQL text.

## Open items for the team

1. **Review thresholds.** `minRevenue = 5000` and `dropPercent = 30` are placeholders in the `settings` table. The team must agree the real values.
2. **Login.** The `users` table exists but is unused (contract v1.0.0 has no login). Decide whether to build it.
3. **Contract differences with openapi.yaml.** Movie update and delete (`PUT` and `DELETE /movies/{movieId}`), a 409 when a movie title already exists, and the report fields `previousRevenue`, `difference` and `percentChange` (empty when there is no previous week) are supported by the database but need to be in the contract. Chandani to confirm.
4. **Shared types.** `shared/types/movie.types.ts` and `performance.types.ts` are still empty. The row shapes are in the two repository files and can be moved there once the team agrees names.

## Not yet verified

- The Docker Compose file and the GitHub workflow have not been run by Rose's tooling here. The tests ran against a local PostgreSQL 16, and the workflow will show the result on the first pull request.
