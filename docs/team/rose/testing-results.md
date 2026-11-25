# Testing results: database (Rose Budha)

**Date:** 23 November 2026
**Command:** `npm run test:db` (from `backend`). It applies the migration, loads the dummy data and runs `tests/integration/database.test.ts`.
**Result:** 48 tests, 48 passed, 0 failed.

## Environment

| Item | Value |
|---|---|
| Database | PostgreSQL 16.15 (local server; Docker uses the `postgres:16` image) |
| Runtime | Node.js 22.23.5 |
| Prisma | 6.19.0 |
| TypeScript runner | tsx 4.20.6 |
| Test runner | Node's built-in test runner (`node --test`) |
| Machine | Linux cloud workspace |

## Results by group

| Group | Tests | Passed | What it checks |
|---|---|---|---|
| Database rules | 16 | 16 | Duplicate week, non-Monday, impossible dates, negative or 3-decimal revenue, unknown movie, bad status, duplicate or blank title, negative tickets and screenings, optional fields, duplicate username, placeholder thresholds |
| Seed data and week label | 8 | 8 | 8 movies, 39 records, tickets and screenings filled, ISO week labels including the 2026-W53 and 2027-W01 year boundary |
| Report views | 6 | 6 | Weekly report rows, difference and percent change, missing previous week, review flags, ended movies never flagged, delete cascades |
| Queries Q1 to Q15 | 18 | 18 | Every API query: normal case, not-found case and the 409, 400 and 404 error mapping |

Every test that changes data runs inside a transaction that is rolled back, and the last test confirms the seed data is unchanged afterwards.

## Not yet tested

- Running the tests on Rose's own computer, and starting PostgreSQL with Docker Compose.
- The GitHub workflow `database-tests.yml` (it runs on the first pull request that changes the database).
- The API calling the repositories end to end (needs Chandani's controllers).
