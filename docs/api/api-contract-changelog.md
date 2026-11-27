# API Contract Changelog

Owner: Chandani Gupta (API module). Every change to `openapi.yaml` is recorded here, newest first.
Versioning rule (team charter, Section 6): a breaking change raises the major version; a compatible addition raises the minor version.

## v1.1.0 (26 November 2026)

Aligns the contract with Rose's PostgreSQL database (pull request #15) and the Team Development Setup Guide (20 November 2026).
Validated in Swagger Editor and with OpenAPI 3.0.3 schema validation: 12 paths, 14 operations, no errors.

**Why:** v1.0.0 was merged to `main` on 1 November (pull request #3) but was replaced by an empty template (`version: 0.1.0`, `paths: {}`) in the folder upload of 20 November. This version restores it and adds what the new database supports.

### Added

| Change | Where | Reason |
| --- | --- | --- |
| Server URL set to `http://localhost:5000/api/v1` | servers | Team agreed backend port 5000, matching the frontend proxy in `frontend/vite.config.ts` (PR #16) |
| `GET /health` returning `{ "status": "ok" }` | Health | The setup guide asks for a backend health endpoint |
| `extendedWeeks` field | Movie | Stored in the database; counts weeks added by extend |
| Optional `ticketsSold` and `screenings` | PerformanceRecordCreate, PerformanceRecordUpdate, PerformanceRecord | Optional columns in the database |
| `isoWeek` (for example `2026-W42`) | PerformanceRecord | Calculated by the database from `weekStart` |
| `previousRevenue`, `difference`, `percentChange`, `ticketsSold`, `screenings`, `screeningStatus` | MovieRevenue (weekly report rows) | Returned by the database view `v_weekly_report` |
| `bestMovie` | WeeklyReport | Returned by the weekly summary query |
| `previousRevenue`, `percentChange`; `reason` limited to `BELOW_MIN_REVENUE` or `SHARP_DROP` | ReviewFlag | Matches the database review-flag query |
| Optional body `{ "weeks": 1 }` | POST /movies/{movieId}/screening/extend | The database adds a number of weeks; default 1 |
| `409 Conflict` for a title that already exists | POST /movies | Titles are unique ignoring letter case in the database |
| `400 Bad Request` for an invalid ID or query value | GET /movies/{movieId}, PUT and DELETE /performance/{recordId}, revenue-trend, extend, end | Invalid IDs are rejected before reaching the database |
| `operationId` on every operation; tag descriptions; example error bodies | Whole file | Easier Postman import and clearer documentation |

### Changed

| Change | Reason |
| --- | --- |
| `genre` and `releaseDate` are optional (only `title` is required) when creating a movie | The database allows them to be empty; the setup guide lists them as optional |
| Extend and end now return the full updated Movie plus a `message` (ScreeningActionResponse) | Prakash's pages expect a Movie back; the old short reply is still included. To be confirmed with Prakash |
| Review-flag rules written out: ended movies are never flagged; a movie with no previous week is checked against `minRevenue` only; defaults 5000 AUD and 30% | Matches the database; thresholds still to be confirmed by the team |
| `Error.code` limited to `BAD_REQUEST`, `UNAUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `SERVER_ERROR` | One standard error format for every module |
| `/auth/login` marked as not implemented in v1.1.0 | No one is building login; kept so it can be added later without a breaking change |

### Not breaking
Every v1.0.0 request is still accepted and every v1.0.0 response field is still returned, so this is a minor version.

### Open items for the team
1. Review thresholds: 5000 AUD and 30% are placeholders.
2. Login: confirm it is out of scope.
3. Extend and end response shape: confirm with Prakash.

## v1.0.0 (October 2026, merged 1 November 2026 in pull request #3)

First full contract from Assessment 1: 13 operations on 11 paths under `/api/v1` for movies, performance records, reports, management review and optional login.
