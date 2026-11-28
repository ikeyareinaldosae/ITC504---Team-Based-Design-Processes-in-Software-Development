# Data Handling and Analytics Module

## 1. Introduction

The Data Handling and Analytics module is a component of the Movie Performance Management System developed for ITC504 Team-Based Design Processes in Software Development. The module supports the monitoring and evaluation of movie performance within a single cinema hall.

Its primary purpose is to process weekly revenue records, calculate performance indicators, identify changes in movie performance and provide meaningful information to support management decisions.

The completed implementation includes backend analytics services, data processing utilities, frontend visualisation components and integration with the shared database and API.

## 2. Module Responsibilities

The module is responsible for the following functions:

- Processing movie and weekly performance records retrieved from the database.
- Calculating total weekly revenue and revenue differences.
- Measuring percentage changes between consecutive reporting weeks.
- Comparing individual movie performance.
- Preparing historical revenue trends.
- Calculating individual movie performance statistics.
- Identifying movies that require management review.
- Preparing data for frontend charts and performance indicators.
- Presenting financial and operational performance information.
- Supporting analytics updates following manual data entry, corrections and record deletions.
- Handling missing information and data retrieval errors.
- Maintaining technical documentation and testing evidence for the assigned implementation.

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend execution environment |
| TypeScript | Type-safe application development |
| Express | Backend API framework |
| PostgreSQL | Persistent data storage |
| Prisma ORM | Database access through the repository layer |
| React | Frontend component development |
| Recharts | Revenue and performance visualisation |
| Vite | Frontend development and production build |
| CSS | Component styling and responsive layouts |
| Docker | Local database environment |
| Node.js Test Runner | Backend testing and validation |
| Supertest | HTTP API integration testing |
| Git and GitHub | Version control and team collaboration |

## 4. Backend Implementation

The backend analytics implementation is organised into utilities, processors, services, types and tests.

The utilities provide reusable calculation and reporting date functions. The processors transform database records into structured analytics results. The service layer retrieves records through the existing database repositories and coordinates the calculation and processing operations.

The module does not maintain a separate database or duplicate the database repository implementation. Analytics are calculated using records retrieved from the shared PostgreSQL database.

This approach ensures that existing records and newly entered performance data are included in subsequent analytics requests.

### 4.1 Calculation Utilities

The calculation utilities provide reusable functions for:

- Currency rounding and revenue aggregation.
- Revenue difference calculations.
- Percentage change calculations.
- Individual movie revenue share calculations.
- Aggregation of operational performance counts.
- Reporting date validation.
- Previous and subsequent reporting week calculations.
- Reporting range validation.

Monetary values are maintained to two decimal places, while percentage indicators are rounded to one decimal place.

### 4.2 Data Processors

The data processors prepare structured information for financial analysis, weekly performance reporting and historical visualisation.

The implemented processors include:

- Revenue processor.
- Weekly data processor.
- Chart data processor.

These processors maintain consistent calculation rules and distinguish missing performance information from recorded zero values.

### 4.3 Analytics Services

The implemented analytics services include:

| Service | Responsibility |
|---|---|
| Revenue service | Weekly revenue and performance calculations |
| Comparison service | Individual movie performance comparisons |
| Trend service | Historical cinema and movie revenue trends |
| Review flags service | Identification of movies requiring management attention |
| Central analytics service | Consolidation of analytics results |

The central analytics service uses a database transaction with repeatable-read isolation to maintain a consistent view of database records during consolidated analytics processing.

The current frontend uses the available shared API endpoints rather than directly accessing this consolidated service.

## 5. Frontend Implementation

The frontend analytics module presents movie performance information through summary cards, revenue charts, comparison tables and management review indicators.

The frontend environment, analytics data types, currency formatting utilities, chart data preparation functions and analytics components have been completed.

### 5.1 Implemented Components

| Component | Responsibility |
|---|---|
| PerformanceCards | Display financial and operational summary indicators |
| RevenueBarChart | Compare weekly revenue between movies |
| RevenueTrendChart | Display historical cinema and individual movie revenue |
| MovieComparison | Present detailed movie performance comparisons |
| ReviewFlags | Display movies requiring management attention |
| useAnalytics | Manage analytics retrieval, loading, errors and refresh operations |

The components retrieve actual database-backed information through the shared API rather than relying on hardcoded revenue figures or temporary frontend datasets.

### 5.2 Analytics Dashboard

The Analytics Dashboard provides a consolidated view of cinema performance.

The page includes:

- Reporting week selection.
- Financial and operational performance indicators.
- Weekly movie revenue bar chart.
- Historical cinema revenue trend chart.
- Searchable and sortable movie comparison table.
- Management review indicators.
- Manual data refresh.

The dashboard enables users to monitor weekly cinema performance and identify movies requiring further evaluation.

### 5.3 Performance Analysis Page

The Performance Analysis page provides detailed historical information for individual movies.

The page includes:

- Individual movie selection.
- Total recorded revenue.
- Latest weekly revenue.
- Average weekly revenue.
- Highest weekly revenue.
- Individual movie revenue trend.
- Weekly performance history.
- Revenue difference and percentage change indicators.

Historical performance information remains available for movies with ended screenings.

### 5.4 Frontend Data Handling

The frontend uses the shared API client to retrieve performance information.

The analytics hook manages reporting week selection, data retrieval, loading states, error states and manual refresh operations.

Frontend calculation and formatting utilities prepare the retrieved information for presentation.

Missing numerical values are displayed as N/A, and missing historical reporting weeks are represented as gaps in revenue charts.

## 6. Integration with Other Modules

The analytics module integrates with the shared database, API, data entry and frontend application components.

### 6.1 Database Integration

The analytics module uses the shared PostgreSQL database and existing repository functions for retrieving movie information, weekly performance records, historical revenue and screening statuses.

No separate analytics database is required.

### 6.2 API Integration

The frontend analytics components retrieve information through the following implemented API endpoints:

| Endpoint | Purpose |
|---|---|
| GET /api/v1/movies | Movie information and screening statuses |
| GET /api/v1/reports/weeks | Available reporting weeks |
| GET /api/v1/reports/weekly | Weekly performance information |
| GET /api/v1/reports/charts/revenue-trend | Historical revenue information |
| GET /api/v1/management/review-flags | Management review indicators |

API connectivity and response compatibility were verified during integration testing.

The frontend combines information from these endpoints to prepare the dashboard and individual performance analysis results.

### 6.3 Data Entry and Reporting Integration

The shared data entry and reporting module allows users to create movies and manage weekly performance records.

Newly entered performance information contributes to subsequent analytics calculations.

Corrected performance records replace previous values, and deleted records are excluded from subsequent calculations.

Manual data entry, performance record correction and deletion were verified through integrated functional testing and automated database and API tests.

The Refresh Data function retrieves updated information from the shared API.

### 6.4 Shared Application Integration

The Analytics Dashboard and Performance Analysis pages are accessible through the local integrated React application.

| Page | Route |
|---|---|
| Analytics Dashboard | /dashboard |
| Performance Analysis | /performance-analysis |

The routes were added to the shared application for integration and functional testing.

Final shared navigation, sidebar styling and overall application layout remain subject to team coordination.

### 6.5 Screening Management Integration

The analytics module identifies movies requiring management attention using configurable revenue thresholds.

The current default thresholds are AUD 5,000 in minimum weekly revenue and a 30% significant revenue decline.

Movies with ended screenings are excluded from management review while their historical revenue information remains available.

The analytics module provides decision-support information. Screening extension and termination operations are handled through the shared management workflow.

## 7. Testing and Validation

Backend and frontend testing has been completed for the assigned analytics implementation.

### 7.1 Automated Testing

| Testing Category | Passed | Failed |
|---|---:|---:|
| Revenue and date utilities | 39 | 0 |
| Data processors | 34 | 0 |
| Analytics services | 59 | 0 |
| Live database integration | 1 | 0 |
| Analytics testing subtotal | 133 | 0 |
| Shared database integration | 48 | 0 |
| Performance API integration | 19 | 0 |
| Total recorded tests | 200 | 0 |

The recorded results represent separate testing runs.

The final analytics and performance API regression testing completed 152 successful tests. The additional 48 shared database integration tests were completed during an earlier development stage.

These results represent the recorded testing activities rather than complete automated coverage of every team component.

### 7.2 Database Validation

Database integration testing verified that newly created, corrected and deleted performance records were reflected in analytics calculations.

Temporary analytics test transactions were rolled back, and temporary API test records were removed through controlled cleanup operations.

Final database verification confirmed:

| Metric | Verified Result |
|---|---:|
| Registered movies | 8 |
| Weekly performance records | 39 |
| Available reporting weeks | 6 |
| Total historical revenue | AUD 972,870.50 |
| Remaining temporary API test records | 0 |

The final database counts and revenue total matched the original dataset.

### 7.3 Frontend Functional Testing

Frontend functional testing verified the operation of the Analytics Dashboard and Performance Analysis pages.

The testing covered:

- Reporting week selection.
- Individual movie selection.
- Performance summary cards.
- Weekly revenue charts.
- Historical revenue charts.
- Movie comparison sorting and searching.
- Management review indicators.
- Historical information for ended movies.
- Manual data refresh.
- Responsive layouts.
- Missing information handling.
- Simulated network failure and recovery.

Frontend functional testing was performed manually.

### 7.4 Compilation and Build Validation

Backend TypeScript validation, frontend TypeScript validation and frontend production build validation completed successfully.

The final frontend production build transformed 676 modules and completed in 3.28 seconds.

A non-blocking JavaScript bundle size warning was reported. No compilation errors prevented the production build.

### 7.5 Verified Analytics Results

The reporting week commencing 12 October 2026 was used to validate integrated analytics calculations.

| Metric | Verified Result |
|---|---:|
| Total weekly revenue | AUD 159,550.00 |
| Previous weekly revenue | AUD 167,850.00 |
| Revenue difference | AUD -8,300.00 |
| Percentage change | -4.9% |
| Best-performing movie | Coral Kingdom |
| Tickets sold | 9,667 |
| Screenings | 85 |
| Movies requiring management review | 2 |

The results were consistent with the recorded database information and integrated frontend presentation.

Detailed testing evidence is maintained in testing-results.md.

## 8. Current Development Status

| Development Area | Status |
|---|---|
| Shared repository review | Completed |
| Analytics data structures | Completed |
| Backend calculation utilities | Completed |
| Data processors | Completed |
| Analytics services | Completed |
| Backend independent testing | Completed |
| Frontend environment setup | Completed |
| Frontend analytics types | Completed |
| Frontend formatting utilities | Completed |
| Chart data preparation utilities | Completed |
| Performance summary cards | Completed |
| Revenue visualisation components | Completed |
| Movie comparison component | Completed |
| Management review component | Completed |
| Analytics Dashboard | Completed |
| Performance Analysis page | Completed |
| API integration | Completed |
| Manual data integration | Completed |
| Backend regression testing | Completed |
| Performance API testing | Completed |
| Frontend functional testing | Completed |
| Error handling and recovery validation | Completed |
| Production build validation | Completed |
| Final database integrity verification | Completed |

The assigned implementation and planned local testing activities have been completed.

Technical documentation is undergoing final review before the development changes are submitted through the team's version control and pull request workflow.

## 9. Scope and Limitations

The system is designed for a single cinema hall. Revenue calculations are based on weekly reporting periods beginning on Monday.

The analytics module processes recorded revenue rather than calculating complete business profitability.

The current implementation has the following limitations:

- Multiple cinema hall management is outside the project scope.
- Operating expenses and licensing costs are excluded from revenue calculations.
- Revenue forecasting is outside the current implementation scope.
- Historical screening status reconstruction is unavailable.
- Individual movie analysis requires recorded performance information.
- Continuous real-time synchronisation between separate user sessions is unavailable.
- Frontend analytics information is retrieved through multiple API requests.
- Frontend functional testing was conducted manually.
- Concurrent user and production deployment testing were outside the completed validation activities.
- Final shared application navigation requires team coordination.

The production build also generated a JavaScript bundle size warning.

Previously reported dependency security warnings and the local Prisma client generation workaround require further coordinated team review.

These limitations do not prevent the verified analytics functionality from operating within the local development environment.

## 10. Future Improvements

Potential future improvements include:

- Consolidated dashboard API integration.
- Automated browser testing.
- Improved frontend bundle optimisation.
- Dedicated data retrieval hooks for individual analytics pages.
- Management-controlled performance review threshold configuration.
- Historical reporting range selection.
- Additional operational performance indicators.
- Profitability and operating cost analysis.
- Revenue forecasting.
- Exportable analytics reports.
- Improved concurrent user and production environment testing.

These improvements are outside the completed implementation and are documented as potential future development opportunities.

## 11. Technical Documentation

The module is supported by seven technical documentation files.

| Document | Purpose |
|---|---|
| module-overview.md | Module responsibilities, implementation and development status |
| analytics-architecture.md | Technical architecture and component relationships |
| data-handling-design.md | Database integration and data processing design |
| revenue-calculations.md | Financial calculation formulas and business rules |
| performance-review-rules.md | Performance evaluation thresholds and management review logic |
| testing-results.md | Testing evidence, validation results and known limitations |
| chart-design.md | Frontend visualisation design and implementation |

The documentation is maintained within docs/team/avishek/.

## 12. Team Integration and Contribution Boundaries

The assigned contribution covers data handling, backend analytics, calculation logic, performance review processing, frontend analytics components and associated technical documentation.

The implementation reuses the shared database repositories, API endpoints and application components developed by other team members.

Shared configuration and application routing changes introduced during integration are subject to team review.

The analytics implementation does not replace the responsibilities of the database, API, data entry, reporting or shared application layout modules.

## 13. Conclusion

The Data Handling and Analytics module provides a structured approach to monitoring and evaluating movie performance within a single cinema hall.

The completed implementation supports weekly revenue calculations, historical performance analysis, individual movie comparisons, management review indicators and interactive frontend visualisations.

Integration with the shared database and API enables analytics results to reflect newly entered, corrected and deleted performance information.

The recorded testing results demonstrate successful operation of the assigned functionality within the local development environment.

The module is prepared for final documentation verification, version control submission and coordinated team integration.