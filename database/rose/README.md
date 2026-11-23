# Database (Rose Budha)

PostgreSQL 16 database for the Movie Performance Management System, managed with Prisma. It follows the same method as the team's other project: Node.js, TypeScript, PostgreSQL, Prisma and Docker Compose. No Python.

## Where things are

| Path | What it holds |
|---|---|
| `database/prisma/schema.prisma` | Tables and relations (Prisma models). |
| `database/prisma/migrations/` | The SQL that builds the database, including the rules Prisma cannot express (CHECK constraints, the calculated week label, two report views). |
| `database/prisma/seed.ts` | Dummy data: 8 movies and 39 weekly records (weeks 2026-09-07 to 2026-10-12). |
| `backend/src/rose/prismaClient.ts` | The one shared Prisma client. |
| `backend/src/rose/repositories/` | The data-access functions the API calls (Q1 to Q15). |
| `tests/integration/database.test.ts` | 48 tests for the rules, the seed data, the views and every query. |
| `docs/team/rose/` | Design, data dictionary, ER diagram and test results. |

## Run it

From the project root:

1. `cp .env.example .env` (the values match `docker-compose.yml`).
2. `docker compose up -d db` starts PostgreSQL.
3. `cd backend`, then `npm install`.
4. `npm run test:db` creates the tables, loads the dummy data and runs the 48 tests. The last lines should show `pass 48` and `fail 0`.

Other commands (from `backend`): `npm run db:seed` resets the dummy data. `npm run db:studio` opens Prisma Studio to look at the tables in a browser.

## How the API calls the database

Import the functions from the repositories. Each takes an optional database client as its last argument, so a transaction can be passed in.

```ts
import { listMovies, addMovie } from "../rose/repositories/movie.repository.js";
import { recordRevenue, weeklyReport } from "../rose/repositories/performance.repository.js";
import { httpStatusForDbError } from "../rose/dbUtils.js";

try {
  await recordRevenue({ movieId: 1, weekStart: "2026-10-19", revenue: 1234.56 });
} catch (e) {
  res.status(httpStatusForDbError(e)).json({ code: "DB_ERROR", message: "..." }); // 409, 400 or 404
}
```

Dates go in and come out as `YYYY-MM-DD` text. Revenue goes in and comes out as a number. Do not add `@prisma/client` to another package: the generated client lives in `backend/node_modules`.

## Rules that change how the API behaves

| Situation | Database result | Status for the API |
|---|---|---|
| Same movie and week recorded twice | unique error | 409 |
| Movie title already used (any letter case) | unique error | 409 |
| Week is not a Monday, revenue below 0 or with more than 2 decimals, blank title, negative tickets or screenings | check error | 400 |
| Record for a movie that does not exist | foreign key error | 404 |
| Delete a movie | its weekly records are deleted too | 204 |

`httpStatusForDbError(e)` returns the status for these cases.
