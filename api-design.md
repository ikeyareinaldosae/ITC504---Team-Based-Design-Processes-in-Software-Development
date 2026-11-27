# API Design

**Owner:** Chandani Gupta (1035919)
**Contract version:** 1.1.0
**Base URL (local):** `http://localhost:5000/api/v1`

## 1. Design approach

The API follows an API-first approach: the contract (`openapi.yaml`) is agreed and reviewed before code is written, so the frontend, analytics and database work can proceed in parallel against the same definition.

## 2. Request flow

Every request passes through the same layers, so validation and error handling happen in one place.

```
Request
  -> Route (path + method)
  -> Validation (400 on bad input)
  -> Controller (chooses the status code)
  -> Rose's repository functions / Avishek's analytics services
  -> PostgreSQL
Any error at any step -> Error handler -> { code, message }
```

## 3. Design decisions

| Decision | Reason |
| --- | --- |
| Base path `/api/v1` | Allows a future v2 without breaking existing pages |
| Port 5000 | Matches the frontend proxy in `frontend/vite.config.ts` (PR #16) |
| One error format `{ code, message }` | Pages can handle every error the same way |
| Validate in the API and in the database | Clear messages for users; the database rules are a safety net |
| Reporting week = Monday date (`YYYY-MM-DD`) | Matches the database rule and the team's weekly reporting |
| Revenue in AUD, at least 0, at most 2 decimal places | Matches the database rule |
| One record per movie per week; duplicate gives 409 | Matches the unique index in the database |
| Review flags and revenue trend use Avishek's services | One place for the analytics logic; same defaults (5000 AUD, 30%) |
| Login kept in the contract but not implemented | Team scope decision; can be added later without a breaking change |

## 4. Status codes

| Code | When |
| --- | --- |
| 200 | Read, update or action succeeded |
| 201 | Movie or performance record created |
| 204 | Performance record deleted |
| 400 | Invalid input (for example a non-Monday week, negative revenue, three decimal places) |
| 404 | Movie or record does not exist |
| 409 | Duplicate movie and week, duplicate title, or extending an ended screening |
| 500 | Unexpected error (details logged, never returned) |

## 5. Design issues found and resolved

| Issue | Resolution |
| --- | --- |
| `extendScreening` returns null for both a missing and an ended movie | The controller reads the movie first, then returns 404 or 409 |
| The database trend query needs a date range the contract did not have | The trend endpoint uses Avishek's trend service |
| Review-flag logic existed in two places | The API calls Avishek's `getReviewFlags`, which wraps Rose's query |
| The contract on `main` had been replaced by an empty placeholder (v0.1.0) | Restored and updated to v1.1.0 |

## 6. Changes since Assessment 1

- Technology fixed: Node.js, Express, TypeScript, PostgreSQL 16, Prisma, Docker
- Database moved from SQLite to PostgreSQL (PR #15)
- Backend port set to 5000
- Contract updated to v1.1.0 (see `docs/api/api-contract-changelog.md`)
