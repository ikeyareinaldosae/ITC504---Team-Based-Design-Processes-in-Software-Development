# API Module Overview

**Owner:** Chandani Gupta (1035919)
**Module:** REST API and API contract (`openapi.yaml`)
**Last updated:** 27 November 2026

## Purpose

The API is the layer between the web pages and the database. The pages never talk to the database directly. They send REST requests with JSON bodies to the API, which validates each request, calls the database or analytics functions, and returns a JSON response with a standard status code.

```
Frontend pages (port 5173)  ->  REST API (port 5000)  ->  PostgreSQL database (port 5432)
Prakash, Avishek                Chandani                   Rose
                                    |
                                    +-> Analytics services (Avishek)
```

## Responsibilities

- Own and maintain the API contract, `openapi.yaml`
- Build the REST endpoints under `/api/v1`
- Validate every request before it reaches the database
- Return one standard error format, `{ "code": "...", "message": "..." }`, with 400, 404, 409 and 500
- Test the API manually (Postman) and automatically (Node test runner + Supertest in GitHub CI)
- Document the API for the frontend team

## Files I own

| Folder or file | Contents |
| --- | --- |
| `openapi.yaml` | API contract (v1.1.0) |
| `backend/src/chandani/routes/` | movie, performance, report and management routes |
| `backend/src/chandani/controllers/` | One controller per route file |
| `backend/src/chandani/validators/` | Request validation |
| `backend/src/chandani/middleware/` | `errorHandler.ts`, `validateRequest.ts` |
| `tests/integration/` | `movies.test.ts`, `performance.test.ts`, `reports.test.ts` |
| `docs/api/` | Contract changelog and integration guide |
| `docs/team/chandani/` | This folder |

## Dependencies

| Teammate | Relationship |
| --- | --- |
| Rose (database) | The API calls her repository functions in `backend/src/rose/repositories/` (merged in PR #15) |
| Avishek (analytics) | Report and review-flag endpoints call his services in `backend/src/avishek/services/` (merged in PR #17) |
| Prakash (pages) | His pages call the API through the Vite proxy on port 5000 (merged in PR #16) |
| Reinaldo (Git, UI/UX) | Reviews and merges pull requests into `main` |

## Progress

| Task | Status |
| --- | --- |
| API contract v1.0.0 (merged 1 Nov, PR #3) | Done |
| Reviewed and approved the database pull request #15 | Done (25 Nov) |
| Local environment set up; database verified (48/48 tests passed) | Done (26 Nov) |
| Postman collection set up | Done (26 Nov) |
| API contract v1.1.0, aligned with the database, port 5000 | Done (27 Nov) |
| API skeleton on port 5000 (server, app, error handling, health check) | Next |
| Read endpoints for reports and review flags | Planned |
| Write endpoints for movies, performance and screenings | Planned |
| Automated API tests in CI | Planned |
