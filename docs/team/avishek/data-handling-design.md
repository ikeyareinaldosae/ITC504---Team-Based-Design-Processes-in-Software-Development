# Data Handling Design

## 1. Introduction

The data handling module processes movie performance information for revenue analysis and management decisions within a single cinema hall. It uses the shared PostgreSQL database, Prisma repositories, backend analytics services and integrated React frontend.

The module supports existing database records and manually entered performance information without relying on hardcoded analytics values.

## 2. Data Sources

Movie records contain movie identifiers, titles, genres, release dates, screening statuses and extended screening weeks.

Performance records contain record identifiers, movie identifiers, reporting dates, revenue, ticket sales, screening counts and calculated ISO reporting weeks.

Each movie can have only one performance record per reporting week.

The analytics module uses the shared database as its primary data source.

## 3. Data Handling Workflow

The data handling workflow consists of the following operations:

1. Movie and performance information is entered through the system.
2. The API validates the submitted information.
3. Repository functions store valid records in PostgreSQL.
4. Analytics services retrieve and process relevant database records.
5. Revenue calculations and performance indicators are generated.
6. API responses provide the required information to the frontend.
7. Frontend utilities prepare the information for cards, charts and comparison tables.
8. Management review flags identify movies requiring further attention.

Newly inserted, corrected and deleted records are reflected in subsequent analytics requests.

## 4. Database Access

The module reuses existing repository functions, including `listMovies`, `weeklyReport`, `revenueTrend` and `reviewFlags`.

The analytics services primarily perform read operations without duplicating database queries.

Database creation, performance record management and screening status updates are handled through the shared repositories and API endpoints.

## 5. Reporting Date Validation

Reporting weeks begin on Monday and use the YYYY-MM-DD format. Date calculations use UTC to maintain consistent reporting boundaries.

Previous-week comparisons use the date exactly seven days before the selected reporting week.

Invalid calendar dates, non-Monday reporting dates and reversed reporting ranges are rejected where applicable.

## 6. Data Processing

The revenue processor calculates revenue totals, differences, percentage changes and revenue shares.

The weekly data processor calculates screening summaries and operational totals.

The chart data processor prepares revenue comparisons and historical trends.

Revenue aggregation uses integer cents to reduce floating-point rounding errors. Currency values are rounded to two decimal places, while percentage values are rounded to one decimal place.

Historical revenue is grouped by reporting week and movie identifier to maintain accurate comparisons.

## 7. Manual Data Entry

New movie and performance records are included in subsequent analytics requests.

Corrected records replace previous values without double counting. Deleted records are excluded from subsequent calculations.

Screening status changes are reflected in current screening summaries.

Ended movies are excluded from management review flags, but their historical revenue remains available.

The frontend provides a Refresh Data function that retrieves updated information from the API. Reporting week changes also trigger retrieval of the relevant weekly analytics.

Continuous real-time synchronisation between different user sessions is not implemented.

Manual data insertion, correction, deletion and subsequent analytics recalculation have been verified through automated and functional testing.

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

Missing performance records are not treated as recorded zero revenue.

## 9. Data Integrity and Consistency

Database constraints maintain valid relationships and prevent duplicate weekly performance records.

The consolidated backend analytics service uses Repeatable Read transaction isolation to maintain a consistent database snapshot.

The integrated frontend retrieves information through the existing API endpoints. These separate API requests do not share the consolidated service's database transaction.

Screening summaries represent current screening statuses rather than historical statuses.

Revenue calculations, comparison tables and chart preparation follow consistent aggregation and rounding rules.

## 10. Frontend Data Preparation

Frontend analytics types, currency formatting functions and chart preparation utilities have been implemented and integrated into the Analytics Dashboard and Performance Analysis pages.

The frontend uses React, TypeScript and Recharts to present the processed information.

The Analytics Dashboard provides:

- Weekly revenue and performance indicators.
- Movie revenue comparisons.
- Historical cinema revenue trends.
- Movie performance comparison tables.
- Management review flags.
- Reporting week selection and data refresh.

The Performance Analysis page provides:

- Individual movie selection.
- Total recorded revenue.
- Latest weekly revenue.
- Average weekly revenue.
- Highest weekly revenue.
- Individual historical revenue trends.
- Weekly performance history and percentage changes.

Frontend utilities support Australian dollar formatting, percentage formatting, revenue sorting, chronological ordering and missing reporting weeks.

Loading, empty data and API error states are handled within the relevant frontend components.

## 11. Testing and Validation

All 133 backend analytics regression tests passed successfully following API and frontend integration.

An additional 19 performance API integration tests passed, covering record creation, correction, deletion and input validation.

The earlier database integration testing completed 48 successful tests.

| Testing Category | Passed | Failed |
|---|---:|---:|
| Revenue and date utilities | 39 | 0 |
| Data processors | 34 | 0 |
| Analytics services | 59 | 0 |
| Live database integration | 1 | 0 |
| Database integration tests | 48 | 0 |
| Performance API integration tests | 19 | 0 |
| Total | 200 | 0 |

These results represent separate recorded testing runs.

Live database testing verified that newly entered, corrected and deleted performance records were reflected in analytics calculations.

Temporary analytics test transactions were rolled back, and temporary API test records were removed.

Final database verification confirmed the following results:

| Metric | Verified Result |
|---|---:|
| Registered movies | 8 |
| Weekly performance records | 39 |
| Reporting weeks | 6 |
| Total historical revenue | AUD 972,870.50 |
| Remaining API test records | 0 |

Backend and frontend TypeScript compilation completed successfully. The frontend production build also completed successfully.

Frontend functional testing verified reporting week selection, movie selection, chart rendering, data refresh and simulated network failure recovery.

## 12. Limitations

The current implementation supports a single cinema hall.

Historical screening status reconstruction is outside the current scope.

Analytics updates require subsequent API requests or manual frontend refresh rather than continuous real-time synchronisation.

The frontend retrieves analytics through multiple API requests, which may produce temporary inconsistencies if records are modified between requests.

Frontend recovery testing simulated a network connection failure rather than an actual backend process shutdown.

The production build reports a non-blocking JavaScript bundle size warning. Future optimisation may include component-level code splitting.

Previously identified dependency security warnings require further team review.

## 13. Conclusion

The data handling implementation supports existing and manually entered performance records through the shared PostgreSQL database.

Revenue calculations, historical trends, movie comparisons and management review indicators have been implemented and integrated with the frontend.

Backend development, frontend visualisation, API integration and the planned module testing have been completed successfully.

The module provides a functional foundation for monitoring movie performance and supporting management decisions within a single cinema hall.