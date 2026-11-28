# Testing Results

## 1. Introduction

This document presents the testing and validation results for the data handling, backend analytics and frontend visualisation components of the Movie Performance Management System.

Testing was conducted throughout development and following integration with the shared database, API and frontend components.

The objective was to verify calculation accuracy, data integrity, functional behaviour, API compatibility and system reliability within the single cinema hall environment.

## 2. Testing Objectives

The testing process focused on the following objectives:

- Verify revenue calculation accuracy.
- Validate reporting dates and reporting periods.
- Confirm correct processing of database records.
- Verify historical revenue calculations.
- Validate individual movie performance comparisons.
- Confirm management review rules.
- Verify manually entered performance information.
- Confirm recalculation following record correction and deletion.
- Validate API integration and response compatibility.
- Verify frontend visualisation and user interactions.
- Confirm database integrity following testing.
- Evaluate error handling and recovery behaviour.

## 3. Testing Environment

| Component | Technology |
|---|---|
| Operating system | Windows |
| Runtime environment | Node.js 24.15.0 |
| Package manager | npm 11.8.0 |
| Backend language | TypeScript |
| Backend framework | Express |
| Database | PostgreSQL 16 |
| Database access | Prisma ORM 6.19.0 |
| Database environment | Docker |
| Frontend framework | React 18.3.1 |
| Frontend build tool | Vite 5.4.21 |
| Chart library | Recharts 3.11.1 |
| Automated testing framework | Node.js Test Runner |
| API testing library | Supertest |
| Backend address | http://localhost:5000/api/v1 |
| Frontend address | http://localhost:5173 |

Testing was performed using the local development environment and the shared database structure.

## 4. Testing Methodology

The testing process combined automated and manual testing methods.

| Testing Method | Purpose |
|---|---|
| Unit testing | Validate individual calculation and date functions |
| Processor testing | Validate data transformation and aggregation |
| Service testing | Validate database-backed analytics operations |
| Database integration testing | Verify repository operations and data integrity |
| API integration testing | Verify HTTP responses and performance record management |
| Regression testing | Confirm existing functionality after integration |
| Functional testing | Verify frontend behaviour and user interactions |
| Error handling testing | Verify invalid input handling and connection recovery |
| Production build validation | Confirm successful frontend compilation and packaging |

Automated tests were executed independently of frontend functional testing.

## 5. Automated Testing Summary

The recorded automated testing results are presented below.

| Testing Category | Total | Passed | Failed |
|---|---:|---:|---:|
| Revenue and date utilities | 39 | 39 | 0 |
| Data processors | 34 | 34 | 0 |
| Analytics services | 59 | 59 | 0 |
| Live database integration | 1 | 1 | 0 |
| Shared database integration | 48 | 48 | 0 |
| Performance API integration | 19 | 19 | 0 |
| Total | 200 | 200 | 0 |

Overall recorded automated test pass rate: 100%.

The results represent separate testing runs rather than a single execution of all 200 tests.

The 133 analytics tests and 19 performance API tests were executed following integration on 28 November 2026. The 48 shared database integration tests were completed during an earlier development stage.

## 6. Revenue and Date Utility Testing

The utility testing suite contained 39 tests.

### 6.1 Revenue Calculation Utilities

| Test Area | Result |
|---|---|
| Currency rounding | Passed |
| Percentage rounding | Passed |
| Revenue aggregation | Passed |
| Decimal currency precision | Passed |
| Empty revenue records | Passed |
| Positive revenue differences | Passed |
| Negative revenue differences | Passed |
| Missing previous revenue | Passed |
| Revenue growth | Passed |
| Revenue decline | Passed |
| Complete revenue decline | Passed |
| Unchanged revenue | Passed |
| Division by zero prevention | Passed |
| Revenue share calculations | Passed |
| Zero total revenue | Passed |
| Operational count aggregation | Passed |
| Missing operational counts | Passed |

Revenue calculation utility tests: 20 passed.

### 6.2 Date Utilities

Date utility testing verified calendar validation, Monday reporting boundaries, previous and next reporting weeks, leap years, year transitions and reporting range validation.

Date utility tests: 19 passed.

Total utility tests: 39 passed, zero failed.

## 7. Data Processor Testing

The processor testing suite contained 34 tests.

| Processor | Tests | Passed | Failed |
|---|---:|---:|---:|
| Revenue processor | 14 | 14 | 0 |
| Weekly data processor | 10 | 10 | 0 |
| Chart data processor | 10 | 10 | 0 |
| Total | 34 | 34 | 0 |

### 7.1 Revenue Processor

Testing verified weekly revenue aggregation, percentage changes, identification of the best-performing movie, revenue shares and recalculation following changes to performance records.

Missing previous revenue and actual zero-revenue records were also tested.

### 7.2 Weekly Data Processor

Testing verified screening status counts, operational performance totals, missing ticket sales, missing screening counts, empty reporting weeks and reporting date validation.

### 7.3 Chart Data Processor

Testing verified revenue sorting, chronological trend ordering, historical revenue aggregation, individual movie grouping and handling of missing reporting weeks.

The processor correctly grouped movie histories using movie identifiers rather than movie titles.

## 8. Analytics Service Testing

The analytics service testing suite contained 59 tests.

| Service Test Category | Passed | Failed |
|---|---:|---:|
| Analytics service environment | 1 | 0 |
| Revenue service | 7 | 0 |
| Movie comparison service | 8 | 0 |
| Revenue trend service | 9 | 0 |
| Review flags service | 9 | 0 |
| Central analytics service | 12 | 0 |
| Empty data and edge cases | 12 | 0 |
| Manual data changes through analytics services | 1 | 0 |
| Total | 59 | 0 |

Testing confirmed that the analytics services retrieve and process information from the shared database correctly.

The consolidated analytics service maintained consistency between weekly revenue, revenue charts, historical trends, movie comparisons and management review results.

Invalid reporting dates, unsupported reporting ranges and invalid review thresholds were rejected successfully.

## 9. Live Database Integration Testing

Live database integration testing verified that analytics calculations respond to actual changes in PostgreSQL records.

Temporary records were inserted, corrected and deleted within a controlled test transaction.

### 9.1 Original Database State

| Metric | Original Value |
|---|---:|
| Weekly revenue | AUD 159,550.00 |
| Tickets sold | 9,667 |
| Screenings | 85 |
| Registered movies | 8 |

### 9.2 Manual Record Insertion

A temporary movie and performance record were inserted into the database.

| Metric | After Insertion |
|---|---:|
| Weekly revenue | AUD 169,550.00 |
| Tickets sold | 10,267 |
| Screenings | 95 |
| Registered movies | 9 |

The analytics calculations correctly included the newly entered performance information.

Revenue charts and movie comparisons were updated using the inserted records.

### 9.3 Performance Record Correction

The temporary performance record was corrected.

| Metric | After Correction |
|---|---:|
| Weekly revenue | AUD 174,550.00 |
| Tickets sold | 10,567 |
| Screenings | 100 |

The corrected information replaced the previous values without duplicate revenue aggregation.

### 9.4 Record Deletion and Transaction Rollback

The temporary performance record was deleted, and the test transaction was rolled back.

| Metric | Final Value |
|---|---:|
| Weekly revenue | AUD 159,550.00 |
| Tickets sold | 9,667 |
| Screenings | 85 |
| Registered movies | 8 |

The original database state was restored successfully.

Additional analytics service testing confirmed that corrected revenue can remove an existing management review flag and that ended movies retain historical revenue while being excluded from review results.

## 10. Shared Database Integration Testing

The shared database integration tests developed by Rose were executed during an earlier development stage.

| Test Category | Passed | Failed |
|---|---:|---:|
| Database rules | 16 | 0 |
| Seed data and reporting weeks | 8 | 0 |
| Reporting views | 6 | 0 |
| Repository queries | 18 | 0 |
| Total | 48 | 0 |

These tests established the database and repository foundation used by the analytics module.

The shared database integration suite was not rerun during final regression testing because its preparation process includes database reseeding.

Database integrity was instead verified through read-only queries following the final analytics and API tests.

## 11. Performance API Integration Testing

The existing performance API integration tests developed by Chandani were executed following frontend and backend integration.

The tests used Supertest to send HTTP requests directly to the Express application.

| API Operation | Tests | Passed | Failed |
|---|---:|---:|---:|
| POST /performance | 14 | 14 | 0 |
| PUT /performance/{recordId} | 3 | 3 | 0 |
| DELETE /performance/{recordId} | 2 | 2 | 0 |
| Total | 19 | 19 | 0 |

### 11.1 Performance Record Creation

Testing verified successful revenue entry, ISO week calculation, zero revenue acceptance and duplicate record prevention.

Invalid dates, negative revenue, unsupported decimal precision, missing revenue and invalid operational counts were rejected.

### 11.2 Performance Record Correction

Testing verified successful revenue correction, rejection of invalid revenue and appropriate responses for nonexistent performance records.

### 11.3 Performance Record Deletion

Testing verified successful record deletion, rejection of repeated deletion requests and validation of invalid record identifiers.

### 11.4 Test Data Cleanup

The database was inspected before execution to ensure that the API test cleanup range contained no existing performance records.

Following testing, database queries confirmed that all temporary API test records had been removed.

## 12. API Connectivity and Response Validation

The running API was tested using HTTP requests during integration.

| Endpoint | Result |
|---|---|
| GET /api/v1/health | Passed |
| GET /api/v1/movies | Passed |
| GET /api/v1/reports/weeks | Passed |
| GET /api/v1/reports/weekly | Passed |
| GET /api/v1/reports/charts/revenue-trend | Passed |
| GET /api/v1/management/review-flags | Passed |

Additional requests verified previous-week reporting, individual movie revenue trends and empty reporting weeks.

API responses were compatible with the frontend analytics data structures.

## 13. Revenue Calculation Verification

The reporting week commencing 12 October 2026 was used as a reference for validating integrated analytics results.

| Metric | Verified Result |
|---|---:|
| Current weekly revenue | AUD 159,550.00 |
| Previous weekly revenue | AUD 167,850.00 |
| Revenue difference | AUD -8,300.00 |
| Percentage change | -4.9% |
| Best-performing movie | Coral Kingdom |
| Best-performing movie revenue | AUD 66,800.00 |
| Tickets sold | 9,667 |
| Screenings | 85 |
| Registered movies | 8 |
| Active movies | 6 |
| Extended movies | 1 |
| Ended movies | 1 |

The weekly revenue figures were consistent with the revenue charts and movie comparison results.

## 14. Management Review Validation

The default management review thresholds were verified using the existing database records.

| Movie | Weekly Revenue | Percentage Change | Review Result |
|---|---:|---:|---|
| Neon Static | AUD 5,100.00 | -60.6% | Sharp Revenue Decline |
| The Last Ferry | AUD 3,200.00 | -25.6% | Below Minimum Revenue |

Testing confirmed that two movies required management attention for the selected reporting week.

Additional automated tests verified custom thresholds, review rule priority and exclusion of ended screenings.

## 15. Frontend Functional Testing

Frontend functional testing was performed through the integrated React application.

### 15.1 Analytics Dashboard

| Test | Result |
|---|---|
| Dashboard loading | Passed |
| Reporting week selection | Passed |
| Weekly revenue cards | Passed |
| Operational performance indicators | Passed |
| Movie revenue bar chart | Passed |
| Historical cinema revenue chart | Passed |
| Movie comparison table | Passed |
| Management review indicators | Passed |
| Manual data refresh | Passed |
| Newly entered performance information | Passed |
| Removal of deleted test information | Passed |
| Responsive layout | Passed |

### 15.2 Performance Analysis

| Test | Result |
|---|---|
| Individual movie selection | Passed |
| Total recorded revenue | Passed |
| Latest weekly revenue | Passed |
| Average weekly revenue | Passed |
| Highest weekly revenue | Passed |
| Individual historical revenue chart | Passed |
| Weekly performance history | Passed |
| Positive and negative percentage changes | Passed |
| Unavailable comparison values | Passed |
| Historical information for ended movies | Passed |
| Refresh and selection preservation | Passed |
| Responsive layout | Passed |

These results were confirmed through manual functional testing rather than an automated browser testing framework.

## 16. Manual Data Entry Through the Integrated System

A temporary movie named Avenger Doomsday was registered through the integrated movie input workflow.

Two temporary performance records were entered.

| Reporting Week | Revenue (AUD) |
|---|---:|
| 23 November 2026 | 50,000.00 |
| 30 November 2026 | 87,465.00 |
| Total | 137,465.00 |

The temporary movie and performance records were retrieved successfully from the database.

The frontend was tested using the newly entered information.

Following testing, the two temporary performance records and temporary movie were removed through a controlled PostgreSQL transaction.

The frontend was refreshed to confirm restoration of the original reporting weeks and movie information.

API-based performance correction and deletion were separately verified through the automated performance API tests.

## 17. Error Handling and Recovery Testing

### 17.1 API Error Handling

| Test Scenario | Expected Response | Actual Response | Result |
|---|---:|---:|---|
| Invalid reporting date | 400 | 400 | Passed |
| Missing reporting date | 400 | 400 | Passed |
| Nonexistent movie identifier | 404 | 404 | Passed |
| API health following invalid requests | 200 | 200 | Passed |

The API returned structured error messages and remained operational following invalid requests.

### 17.2 Frontend Connection Failure

Network unavailability was simulated using browser developer tools.

The Analytics Dashboard and Performance Analysis pages were tested while the browser network connection was disabled.

The network connection was subsequently restored, and the Refresh Data function was used to retrieve the available information.

Both pages passed the manual error handling and recovery checks.

This test simulated a network connection failure rather than an actual backend process shutdown.

## 18. TypeScript and Production Build Validation

Backend and frontend TypeScript validation completed successfully.

| Validation | Result |
|---|---|
| Backend TypeScript compilation | Passed |
| Frontend TypeScript compilation | Passed |
| Frontend production build | Passed |
| TypeScript compilation errors | 0 |

The final frontend production build generated the following output.

| Build Metric | Result |
|---|---:|
| Modules transformed | 676 |
| Build duration | 3.28 seconds |
| HTML bundle | 0.43 kB |
| CSS bundle | 21.59 kB |
| JavaScript bundle | 663.10 kB |
| Compressed JavaScript bundle | 194.79 kB |

The build completed successfully with a non-blocking JavaScript chunk size warning.

No build configuration changes were introduced solely to suppress the warning.

## 19. Final Database Integrity Verification

Database integrity was verified following the analytics regression tests and performance API tests.

| Verification | Expected | Actual | Result |
|---|---:|---:|---|
| Registered movies | 8 | 8 | Passed |
| Performance records | 39 | 39 | Passed |
| Reporting weeks | 6 | 6 | Passed |
| Historical revenue | AUD 972,870.50 | AUD 972,870.50 | Passed |
| Remaining API test records | 0 | 0 | Passed |
| API health | Operational | Operational | Passed |

The final results matched the original database counts and historical revenue total.

The automated analytics tests used transaction rollback, while the performance API tests used controlled record cleanup.

## 20. Test Execution Evidence

### 20.1 Backend Analytics Regression Testing

Execution date: 28 November 2026.

Command executed from the backend directory:

```cmd
npx tsc --noEmit && npx dotenv -e ../.env -- node --import tsx --test --test-concurrency=1 src/avishek/tests/utilities.test.ts src/avishek/tests/processors.test.ts src/avishek/tests/liveAnalytics.test.ts src/avishek/tests/services.test.ts
```

Recorded output:

```text
tests 133
suites 13
pass 133
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 2005.8118
```

### 20.2 Performance API Integration Testing

Execution date: 28 November 2026.

Command executed from the backend directory:

```cmd
npx dotenv -e ../.env -- node --import tsx --test --test-concurrency=1 ../tests/integration/performance.test.ts
```

Recorded output:

```text
tests 19
suites 3
pass 19
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 3394.6327
```

### 20.3 Frontend Production Build

Command executed from the frontend directory:

```cmd
npx tsc --noEmit && npm run build
```

Recorded output:

```text
vite v5.4.21 building for production...
676 modules transformed.
built in 3.28s
```

### 20.4 Final Database Verification

Recorded database results:

```text
total_movies: 8
total_performance_records: 39
total_revenue: 972870.5
remaining_test_records: 0
API health: {"status":"ok"}
```

The recorded outputs provide evidence of successful compilation, automated testing and database restoration.

## 21. Known Issues and Testing Limitations

| Issue or Limitation | Status | Description |
|---|---|---|
| JavaScript bundle size | Non-blocking warning | The production JavaScript bundle exceeds the default 500 kB warning threshold |
| Dependency security warnings | Further review required | Previously reported npm dependency vulnerabilities require coordinated team review |
| Prisma client generation | Local workaround applied | Generated Prisma client files required local alignment between package locations |
| Frontend test automation | Not implemented | Frontend functional testing was performed manually |
| Backend shutdown recovery | Not directly tested | Network failure was simulated through browser developer tools |
| Production deployment testing | Outside current validation | Testing was performed in the local development environment |
| Concurrent user testing | Not performed | Multi-user load and simultaneous record modification were not evaluated |
| Complete API regression suite | Not rerun | Final API testing focused on the performance record endpoints |

The identified limitations do not prevent the tested analytics functionality from operating in the local development environment.

A successful functional test result does not establish that the application is free from security vulnerabilities or suitable for production deployment.

## 22. Final Testing Outcome

| Testing Area | Final Status |
|---|---|
| Backend utility testing | Completed |
| Data processor testing | Completed |
| Analytics service testing | Completed |
| Live database integration testing | Completed |
| Performance API integration testing | Completed |
| Frontend functional testing | Completed |
| Manual data lifecycle testing | Completed |
| Revenue calculation validation | Completed |
| Management review validation | Completed |
| Simulated network failure recovery | Completed |
| TypeScript validation | Completed |
| Production build validation | Completed |
| Database integrity verification | Completed |

A total of 200 automated tests passed across the recorded testing runs, with no reported automated test failures.

The final analytics and performance API regression runs accounted for 152 of these successful tests.

## 23. Conclusion

The testing process verified the implemented data handling, backend analytics and frontend visualisation functionality of the Movie Performance Management System.

The results confirmed accurate revenue calculations, historical performance analysis, movie comparisons, management review rules and recalculation following changes to performance records.

Integration with the shared database and performance API was successful.

Frontend functional testing confirmed the operation of the Analytics Dashboard and Performance Analysis pages, including data refresh and simulated network failure recovery.

The final database verification confirmed restoration of the original dataset following temporary test operations.

The assigned analytics module has successfully completed its planned local development and validation activities. The identified technical limitations and future improvement opportunities remain documented for subsequent team review.