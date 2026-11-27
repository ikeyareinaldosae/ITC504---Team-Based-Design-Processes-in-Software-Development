# Testing Results: API Module

**Owner:** Chandani Gupta (1035919)
**Last updated:** 27 November 2026

## 1. Environment

| Item | Version |
| --- | --- |
| Operating system | Windows (WSL 2) |
| Node.js | 22 (GitHub CI uses Node 24) |
| Docker Desktop | 4.100.1 (Docker Engine 29.9.3) |
| PostgreSQL | 16 (Docker container `movies-db`) |
| Prisma | 6.19.0 |
| Postman | Desktop app |

## 2. Environment verification (completed 26 November 2026)

Before building the API, I set up the project locally and checked that Rose's database works on my laptop.

| Check | Command | Result |
| --- | --- | --- |
| Database container running | `docker compose up -d db`, `docker info` | 1 container running, 0 stopped |
| Packages installed, client generated | `npm install` | Prisma Client 6.19.0 generated |
| Database tests | `npm run test:db` | **48 tests, 48 passed, 0 failed** (482 ms) |
| Seed data | `npm run db:studio` | Movie 8, Performance 39, Setting 2, User 0 |
| Postman | Collection "Movie Performance API" | `baseUrl` = `http://localhost:5000/api/v1` |

## 3. Issues found during setup

| Issue | Fix |
| --- | --- |
| Docker install failed: "Virtual Machine Platform" not enabled | Re-installed with the All-users option and WSL 2 |
| `npm install` reported 4 high-severity advisories in development tools | Did not run `npm audit fix --force`, to keep Rose's pinned versions; all tests still pass |
| Setup guide suggests `npx prisma migrate dev` | Use `npm run db:migrate`; `migrate dev` would drop Rose's hand-written rules and views |
| Contract on `main` was an empty v0.1.0 placeholder | Restored and updated to v1.1.0 |

## 4. API test plan

API tests will run in two ways:

- **Manual:** Postman, with screenshots of each request and response
- **Automated:** Node's built-in test runner with Supertest, in `tests/integration/`, added to GitHub CI so they run on every pull request

| # | Test | Input | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| 1 | Health check | GET /health | 200 | | |
| 2 | List movies | GET /movies | 200, 8 movies | | |
| 3 | Unknown movie | GET /movies/999 | 404 | | |
| 4 | Invalid ID | GET /movies/abc | 400 | | |
| 5 | Duplicate title, other case | POST /movies "coral kingdom" | 409 | | |
| 6 | Record revenue | POST /performance, movie 8, 2026-10-19, 1234.56 | 201 | | |
| 7 | Same movie and week again | Repeat test 6 | 409 | | |
| 8 | Revenue exactly 0 | revenue 0 | 201 | | |
| 9 | Negative revenue | revenue -0.01 | 400 | | |
| 10 | Three decimals | revenue 10.555 | 400 | | |
| 11 | Week not a Monday | weekStart 2026-10-13 | 400 | | |
| 12 | Unknown movie for a record | movieId 99 | 404 | | |
| 13 | Delete twice | DELETE same record twice | 204, then 404 | | |
| 14 | Weeks with data | GET /reports/weeks | 6 weeks, newest first | | |
| 15 | Weekly report | weekStart 2026-10-12 | 200, 7 movies, total 159550.00 | | |
| 16 | Report without a week | GET /reports/weekly | 400 | | |
| 17 | Empty week | weekStart 2025-01-06 | 200, total 0, empty list | | |
| 18 | Review flags | weekStart 2026-10-12 | Neon Static SHARP_DROP, The Last Ferry BELOW_MIN_REVENUE | | |
| 19 | Ended movie not flagged | Grandma's Gold | Not in flags | | |
| 20 | Extend an ended screening | POST /movies/7/screening/extend | 409 | | |
| 21 | End a screening | POST /movies/1/screening/end | 200, status ended | | |
| 22 | Database stopped | any request | 500, no technical details | | |

Results will be filled in as each endpoint is implemented.
