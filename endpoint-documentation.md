# Endpoint Documentation

**Contract:** `openapi.yaml` v1.1.0
**Base URL (local):** `http://localhost:5000/api/v1`
**Status:** contract agreed; implementation in progress. Full schemas are in `openapi.yaml` (open it in https://editor.swagger.io).

## Summary

| Method | Path | Purpose | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/health` | Check the API is running | 200 | 500 |
| GET | `/movies` | List all movies | 200 | 500 |
| POST | `/movies` | Add a movie | 201 | 400, 409 |
| GET | `/movies/{movieId}` | Get one movie | 200 | 400, 404 |
| POST | `/performance` | Record weekly revenue | 201 | 400, 404, 409 |
| PUT | `/performance/{recordId}` | Correct a record | 200 | 400, 404 |
| DELETE | `/performance/{recordId}` | Delete a record | 204 | 400, 404 |
| GET | `/reports/weeks` | List weeks that have data | 200 | 500 |
| GET | `/reports/weekly?weekStart=` | Weekly report | 200 | 400 |
| GET | `/reports/charts/revenue-trend` | Trend data for charts | 200 | 400 |
| GET | `/management/review-flags?weekStart=` | Movies needing review | 200 | 400 |
| POST | `/movies/{movieId}/screening/extend` | Extend a screening | 200 | 400, 404, 409 |
| POST | `/movies/{movieId}/screening/end` | End a screening | 200 | 400, 404 |
| POST | `/auth/login` | Login (not implemented in v1.1.0) | - | - |

## Examples (using the team's seed data)

### Record weekly revenue

`POST /performance`

```json
{ "movieId": 8, "weekStart": "2026-10-19", "revenue": 1234.56 }
```

201 Created:

```json
{ "recordId": 40, "movieId": 8, "weekStart": "2026-10-19", "isoWeek": "2026-W43", "revenue": 1234.56, "ticketsSold": null, "screenings": null }
```

Sending the same movie and week again gives 409:

```json
{ "code": "CONFLICT", "message": "A record for this movie and week already exists." }
```

### Weekly report

`GET /reports/weekly?weekStart=2026-10-12` returns 200 with `totalRevenue` 159550.00, `bestMovie` "Coral Kingdom", and one row per movie including `previousRevenue`, `difference` and `percentChange`.

### Review flags

`GET /management/review-flags?weekStart=2026-10-12` (defaults: minRevenue 5000 AUD, dropPercent 30; some fields shortened here):

```json
[
  { "movieId": 6, "title": "Neon Static", "revenue": 5100.00, "previousRevenue": 12950.00, "percentChange": -60.6, "reason": "SHARP_DROP" },
  { "movieId": 3, "title": "The Last Ferry", "revenue": 3200.00, "reason": "BELOW_MIN_REVENUE" }
]
```

Rules: revenue below minRevenue, or a drop of dropPercent or more from the previous week. Ended movies are never flagged. A movie with no previous week is checked against minRevenue only.

### Extend a screening

`POST /movies/2/screening/extend` with optional body `{ "weeks": 2 }` returns the updated movie plus a message. An ended movie returns 409.
