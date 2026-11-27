# Data Handling and Analytics Module

## 1. Introduction

The Data Handling and Analytics module is a component of the Movie Performance Management System developed for ITC504 Team-Based Design Processes in Software Development. The module supports the monitoring and evaluation of movie performance within a single cinema hall.

Its primary purpose is to process weekly revenue records, calculate performance indicators, identify changes in movie performance and provide meaningful information to support management decisions.

## 2. Module Responsibilities

The module is responsible for the following functions:

- Processing movie and weekly performance records retrieved from the database.
- Calculating total weekly revenue and revenue differences.
- Measuring percentage changes between consecutive reporting weeks.
- Comparing individual movie performance.
- Preparing historical revenue trends.
- Identifying movies that require management review.
- Preparing data for frontend charts and performance indicators.
- Supporting analytics updates following manual data entry, corrections and record deletions.

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend execution environment |
| TypeScript | Type-safe application development |
| PostgreSQL | Persistent data storage |
| Prisma ORM | Database access through the repository layer |
| React | Frontend component development |
| Recharts | Revenue and performance visualisation |
| Vite | Frontend development and production build |
| Docker | Local database environment |
| Node.js Test Runner | Backend testing and validation |

## 4. Backend Implementation

The backend analytics implementation is organised into utilities, processors, services, types and tests.

The utilities provide reusable calculation and reporting date functions. The processors transform database records into structured analytics results. The service layer retrieves records through the existing database repositories and coordinates the calculation and processing operations.

The module does not maintain a separate database or duplicate the database repository implementation. Analytics are calculated using records retrieved from the shared PostgreSQL database.

This approach ensures that existing records and newly entered performance data are included in subsequent analytics requests.

## 5. Frontend Implementation

The frontend analytics module is designed to present movie performance information through summary cards, revenue charts, comparison tables and management review indicators.

The frontend environment, analytics data types, currency formatting utilities and chart data preparation functions have been completed.

The following frontend components are planned:

- Performance cards
- Weekly revenue bar chart
- Historical revenue trend chart
- Movie comparison table
- Management review flags
- Analytics dashboard
- Performance analysis page

The development of these components is pending the availability of the backend API. The final implementation will retrieve actual database records through the API rather than relying on hardcoded revenue figures or temporary datasets.

## 6. Integration with Other Modules

The analytics module depends on the database repository layer for retrieving movie and performance records.

The API layer will provide communication between the backend analytics services and the frontend application.

The data entry and reporting module allows users to create movies and manage weekly performance records. Changes made through these functions must be reflected in subsequent analytics results.

The frontend analytics pages will be integrated with the shared application layout and navigation.

## 7. Testing and Validation

Independent backend testing has been completed using unit tests and database integration tests.

A total of 133 analytics tests were executed successfully with no reported failures. The tests covered calculation utilities, date validation, data processing, analytics services, review rules, missing data and database record changes.

Database integration testing also verified that newly created, corrected and deleted performance records were reflected in analytics calculations. Temporary test transactions were rolled back to preserve existing database records.

Frontend TypeScript compilation, development server startup, browser rendering of the existing application and production build validation were completed successfully.

End-to-end API integration and analytics component testing remain pending.

## 8. Current Development Status

| Development Area | Status |
|---|---|
| Backend calculation utilities | Completed |
| Data processors | Completed |
| Analytics services | Completed |
| Backend independent testing | Completed |
| Frontend environment setup | Completed |
| Frontend analytics types | Completed |
| Frontend formatting utilities | Completed |
| Chart data preparation utilities | Completed |
| Analytics components | Pending |
| Analytics dashboard | Pending |
| API integration | Pending |
| End-to-end testing | Pending |

## 9. Scope and Limitations

The system is designed for a single cinema hall. Revenue calculations are based on weekly reporting periods beginning