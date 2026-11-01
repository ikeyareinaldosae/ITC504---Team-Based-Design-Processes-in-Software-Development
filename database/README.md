# Movie Performance Management System: database

This package contains the relational database for the Movie Performance Management System. It is a SQLite file with dummy data, built from plain SQL scripts. Owner: Rose Budha.

## Contents

| File | Purpose |
|---|---|
| `schema.sql` | Tables, rules, indexes, and views. |
| `seed.sql` | Dummy data: 8 movies and 39 weekly records (with tickets and screenings) (weeks 2026-09-07 to 2026-10-12). |
| `queries.sql` | One tested query for each API operation, with `:name` parameters. |
| `build_and_test.py` | Rebuilds `movies.db` and runs the constraint and query tests. |
| `movies.db` | The ready-made database file. |

## Build and test

Requires Python 3 only.

```
python3 build_and_test.py
```

The script deletes and recreates `movies.db`, then prints `PASS` or `FAIL` for each check. Expected last line: `ALL PASSED`.

Every connection must run `PRAGMA foreign_keys = ON;`. SQLite leaves foreign keys off by default.

## Tables

- `movies`: `movieId`, `title` (unique, case-insensitive), `genre`, `releaseDate`, `screeningStatus` (`active`, `extended`, or `ended`), `extendedWeeks`.
- `performance`: `recordId`, `movieId`, `weekStart` (Monday date), `revenue`, optional `ticketsSold` and `screenings`, and `isoWeek` (calculated label such as `2026-W40`). One record per movie per week.
- `settings`: review thresholds `minRevenue` (default 5000) and `dropPercent` (default 30). These defaults are placeholders until the team confirms the values.
- `users`: optional login. Stores `passwordHash` only, never a plain password.

## Rules enforced by the database

- `weekStart` must be a valid date and a Monday (`YYYY-MM-DD`). The database always stores the Monday date. The API can accept `YYYY-Www` and filter on `isoWeek`, so both formats work.
- `ticketsSold` and `screenings`, when given, must be whole numbers of zero or more.
- `revenue` must be zero or more, with at most two decimal places (AUD).
- A repeated movie and week raises a `UNIQUE` error. The API should return `409 Conflict`.
- An unknown `movieId` raises a foreign key error. The API should return `404` or `400`.
- Deleting a movie deletes its performance records (`ON DELETE CASCADE`).

Column names are camelCase, so query results match the field names in `openapi.yaml` without renaming.

## Views

- `v_weekly_report`: revenue, previous week's revenue, difference, and percent change for each movie and week. "Previous week" means exactly 7 days earlier. If that week has no record, the previous-week fields are `NULL`.
- `v_review_flags`: movies below `minRevenue` or down by `dropPercent` or more. Ended movies are excluded. The `reason` column is `BELOW_MIN_REVENUE` or `SHARP_DROP`.

The API can also pass thresholds as query parameters (Q11 in `queries.sql`) instead of reading `settings`.

## Dummy data highlights

The seed data covers each case the report must handle: a growing movie (Coral Kingdom), a collapsing one (The Last Ferry, below the minimum), a sudden drop (Neon Static), a steady extended movie (Outback Run), an ended movie (Grandma's Gold), and a new release with missing earlier weeks (Southern Cross).

## Open items

- Confirm `minRevenue` and `dropPercent` with the team, then update `settings`.
- Confirm with Chandani which week format the API contract uses. The database supports both.
- Confirm that SQLite is the agreed database. The schema uses standard SQL, so a move to PostgreSQL or MySQL needs only small type changes.
- Seed `users` only if the login feature is built.
