# Data Handling Design

## 1. Introduction

The data handling module processes movie performance information for revenue analysis and management decisions within a single cinema hall. It uses the shared PostgreSQL database and existing Prisma repositories.

## 2. Data Sources

Movie records contain movie identifiers, titles, genres, release dates and screening statuses.

Performance records contain record identifiers, movie identifiers, reporting dates, revenue, ticket sales and screening counts.

Each movie can have only one performance record per reporting week.

## 3. Data Handling Workflow

The analytics services validate reporting parameters, retrieve database records, process performance information, calculate indicators and return structured analytics results.

## 4. Database Access

The module reuses existing repository functions, including listMovies, weeklyReport, revenueTrend and reviewFlags.

The analytics services primarily perform read operations without duplicating database queries.

## 5. Reporting Date Validation

Reporting weeks begin on Monday and use the YYYY-MM-DD format. Date calculations use UTC.

Previous-week comparisons use the date exactly seven days before the selected reporting week.

## 6. Data Processing

The revenue processor calculates revenue totals, differences, percentage changes and revenue shares.

The weekly data processor calculates screening summaries and operational totals.

The chart data processor prepares revenue comparisons and historical trends.

Revenue aggregation uses integer cents to reduce rounding errors.

## 7. Manual Data Entry

New movie and performance records are included in subsequent analytics requests.

Corrected records replace previous values without double counting. Deleted records are excluded from subsequent calculations.

Screening status changes are reflected in current screening summaries.

Ended movies are excluded from management review flags, but their historical revenue remains available.

Automatic frontend refresh remains an integration requirement.

## 8. Missing Data Handling

| Condition | Handling |
|---|---|
| No weekly records | Zero total revenue with hasData false |
| Recorded zero revenue | Valid recorded value |
| Missing previous revenue | Comparison unavailable |
| Previous revenue is zero | Percentage change unavailable |
| Missing current records | Revenue change unavailable |
| Missing ticket sales | Ticket total unavailable |
| Missing screening counts | Screening total unavailable |
| Zero total revenue | Revenue shares unavailable |
| Missing historical week | Gap in frontend trend data |

Unavailable numerical values are represented as null and displayed as N/A by frontend formatting utilities.

## 9. Data Integrity and Consistency

Database constraints maintain valid relationships and prevent duplicate weekly performance records.

The consolidated dashboard service uses Repeatable Read transaction isolation to maintain a consistent database snapshot.

Screening summaries represent current screening statuses rather than historical statuses.

## 10. Frontend Data Preparation

Frontend analytics types, currency formatting functions and chart preparation utilities have been implemented.

These utilities support Australian dollar formatting, percentage formatting, revenue sorting, chronological ordering and missing reporting weeks.

TypeScript compilation has passed. Component integration remains pending.

## 11. Testing and Validation

All 133 backend analytics tests passed successfully.

Database integration tests verified record creation, revenue corrections, record deletions and screening status changes.

Temporary test transactions were rolled back.

Final database verification confirmed eight movies, 39 performance records and no remaining temporary analytics test movies.

## 12. Limitations

The implementation supports a single cinema hall.

Historical screening status reconstruction is outside the current scope.

API integration, automatic frontend refresh and end-to-end testing remain pending.

## 13. Conclusion

The data handling implementation supports existing and manually entered performance records through the shared database.

Backend development and independent testing are complete. The remaining work involves API integration, frontend visualisation and final validation.