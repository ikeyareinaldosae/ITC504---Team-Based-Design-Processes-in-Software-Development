# Chart Design and Data Visualisation

## 1. Introduction

The data visualisation module presents financial and operational performance information within the Movie Performance Management System.

The module converts database-backed performance information into interactive charts, summary cards, comparison tables and management review indicators.

The visualisation components support performance monitoring and management decision-making within a single cinema hall.

## 2. Design Objectives

The visualisation module was developed to achieve the following objectives:

- Present financial information clearly and consistently.
- Support weekly movie revenue comparisons.
- Display historical cinema revenue trends.
- Provide individual movie performance analysis.
- Identify revenue growth and decline.
- Highlight movies requiring management attention.
- Support manually entered and corrected performance records.
- Maintain responsive layouts across different screen sizes.
- Provide appropriate loading, error and empty data states.
- Maintain reusable frontend components.

## 3. Technology Stack

| Technology | Responsibility |
|---|---|
| React 18.3.1 | Frontend component development |
| TypeScript | Type safety and structured data handling |
| Recharts 3.11.1 | Interactive chart rendering |
| CSS | Component styling and responsive layouts |
| Vite 5.4.21 | Frontend development and production builds |
| Express API | Retrieval of performance information |
| PostgreSQL | Storage of movie and performance records |
| Prisma ORM | Database access through shared repositories |

Recharts was selected because it provides reusable React chart components, responsive containers, interactive tooltips and configurable visualisation options.

## 4. Frontend File Structure

The visualisation implementation is maintained within frontend/src/avishek/.

| File | Responsibility |
|---|---|
| components/PerformanceCards.tsx | Summary performance indicators |
| components/PerformanceCards.css | Performance card styling |
| components/RevenueBarChart.tsx | Weekly movie revenue comparison |
| components/RevenueTrendChart.tsx | Historical revenue visualisation |
| components/RevenueCharts.css | Shared chart styling |
| components/MovieComparison.tsx | Movie performance comparison table |
| components/MovieComparison.css | Comparison table styling |
| components/ReviewFlags.tsx | Management review indicators |
| components/ReviewFlags.css | Review indicator styling |
| hooks/useAnalytics.ts | Analytics retrieval and state management |
| pages/AnalyticsDashboard.tsx | Consolidated cinema analytics page |
| pages/AnalyticsDashboard.css | Dashboard layout and styling |
| pages/PerformanceAnalysis.tsx | Individual movie performance analysis |
| pages/PerformanceAnalysis.css | Individual analysis page styling |
| types/analytics.types.ts | Analytics data structures |
| utils/chartData.ts | Chart data preparation |
| utils/revenueCalculations.ts | Numerical formatting and change indicators |

The components are maintained separately to support reuse, testing and future maintenance.

## 5. Visualisation Data Flow

The visualisation module retrieves information through the shared API rather than accessing PostgreSQL directly from the frontend.

The data flow follows these operations:

1. Performance information is stored in PostgreSQL.
2. Shared repositories retrieve relevant records.
3. API endpoints return structured performance information.
4. The useAnalytics hook retrieves and manages the responses.
5. Frontend utilities prepare chart and comparison data.
6. React components render the prepared information.
7. User interactions trigger reporting period changes or data refresh.

The visualisation components do not rely on hardcoded revenue figures.

## 6. Analytics Dashboard

The Analytics Dashboard provides a consolidated view of cinema performance.

The dashboard is organised into four main sections.

| Section | Purpose |
|---|---|
| Performance Overview | Display financial and operational summary indicators |
| Revenue Analysis | Present weekly movie revenue and historical cinema revenue |
| Movie Performance | Compare individual movie performance |
| Performance Review | Identify movies requiring management attention |

The dashboard also provides a reporting week selector and Refresh Data function.

The latest available reporting week is selected initially when reporting information is available.

## 7. Performance Summary Cards

Performance summary cards present key financial and operational indicators in a compact format.

The displayed information includes weekly revenue, revenue changes, the best-performing movie, operational performance counts and screening status information.

Summary cards allow users to understand the overall cinema performance before examining detailed charts and tables.

Positive, negative and unavailable values are visually distinguished.

Missing numerical values are displayed as N/A rather than being incorrectly represented as zero.

## 8. Weekly Movie Revenue Bar Chart

### 8.1 Purpose

The weekly movie revenue bar chart compares revenue generated by individual movies during the selected reporting week.

A horizontal bar chart was selected to accommodate movie titles and simplify comparisons between different revenue values.

### 8.2 Data Structure

Each chart entry contains:

- Movie identifier.
- Movie title.
- Current weekly revenue.
- Previous weekly revenue, where available.

### 8.3 Data Preparation

Movie revenue records are sorted in descending revenue order.

The movie identifier provides a consistent secondary sorting criterion when revenue values are equal.

The highest positive revenue value is highlighted using a darker navy colour. Movies sharing the highest positive revenue receive the same highlighting.

Other movie revenue bars use a lighter blue colour.

### 8.4 Chart Configuration

| Property | Configuration |
|---|---|
| Chart type | Horizontal bar chart |
| Category axis | Movie titles |
| Numerical axis | Weekly revenue |
| Revenue format | Australian dollars |
| Sorting | Highest to lowest revenue |
| Tooltip | Movie title and recorded revenue |
| Chart height | Adjusted according to the number of movie records |
| Animation | Enabled |
| Responsive container | Enabled |

The numerical axis begins at zero to maintain accurate visual comparisons.

Compact currency formatting is used for axis labels, while tooltips display detailed currency values.

### 8.5 Verified Example

The following records were used to validate the chart for the reporting week commencing 12 October 2026.

| Movie | Weekly Revenue (AUD) |
|---|---:|
| Coral Kingdom | 66,800.00 |
| Midnight Harbour | 28,750.00 |
| Outback Run | 27,050.00 |
| Paper Lanterns | 18,750.00 |
| Southern Cross | 9,900.00 |
| Neon Static | 5,100.00 |
| The Last Ferry | 3,200.00 |

The chart correctly identifies Coral Kingdom as the highest-performing movie for the selected reporting week.

## 9. Historical Cinema Revenue Trend

### 9.1 Purpose

The historical cinema revenue trend displays changes in total recorded cinema revenue across reporting weeks.

An area chart with a visible revenue line was selected to communicate historical financial movement.

### 9.2 Data Preparation

Individual movie performance records are grouped by reporting week.

Revenue values belonging to the same reporting week are aggregated using integer cents to reduce rounding errors.

The resulting weekly totals are sorted chronologically.

### 9.3 Chart Configuration

| Property | Configuration |
|---|---|
| Chart type | Area chart with revenue trend line |
| Horizontal axis | Reporting week |
| Vertical axis | Total cinema revenue |
| Line colour | Navy blue |
| Area fill | Blue gradient |
| Data markers | Enabled |
| Tooltip | Reporting date and recorded revenue |
| Missing data connection | Disabled |
| Responsive container | Enabled |

The chart uses unique gradient identifiers to avoid conflicts when multiple revenue chart instances are rendered.

### 9.4 Verified Historical Revenue

| Reporting Week | Revenue (AUD) |
|---|---:|
| 7 September 2026 | 147,950.50 |
| 14 September 2026 | 163,070.00 |
| 21 September 2026 | 169,500.00 |
| 28 September 2026 | 164,950.00 |
| 5 October 2026 | 167,850.00 |
| 12 October 2026 | 159,550.00 |
| Total | 972,870.50 |

These values were verified against the existing database records.

## 10. Missing Reporting Weeks

Missing reporting weeks are handled separately from recorded zero-revenue weeks.

The chart preparation utility identifies weekly reporting intervals within the selected historical range.

When a reporting week has no corresponding performance record, the revenue value is represented as null.

The chart does not connect the trend line across missing values.

| Data Condition | Visual Representation |
|---|---|
| Recorded positive revenue | Revenue point at the recorded value |
| Recorded zero revenue | Revenue point at zero |
| Missing reporting week | Gap in the trend |
| No historical records | Empty data message |

This approach prevents the visualisation from suggesting financial activity that was not recorded.

## 11. Movie Performance Comparison Table

The movie performance comparison table provides detailed numerical information that complements the revenue charts.

The table contains the following columns:

| Column | Description |
|---|---|
| Movie | Registered movie title |
| Weekly Revenue | Revenue for the selected reporting week |
| Previous Revenue | Revenue from the previous reporting week |
| Difference | Monetary revenue change |
| Change (%) | Percentage revenue change |
| Revenue Share | Contribution to total weekly cinema revenue |
| Screening Status | Current screening status |

The table supports movie title searching and column sorting.

Revenue share indicators provide a visual representation of each movie's contribution to the total weekly revenue.

Positive and negative revenue changes are distinguished using colour and numerical signs.

Unavailable values are displayed as N/A and placed after available values during numerical sorting.

The table provides horizontal scrolling within its container on smaller screens.

## 12. Management Review Visualisation

The Management Review component displays movies identified by the performance review rules.

Each review entry contains the movie title, review reason, current revenue, previous revenue and percentage change.

| Review Reason | Visual Treatment |
|---|---|
| Below Minimum Revenue | Amber warning indicator |
| Sharp Revenue Decline | Red decline indicator |

The review component displays explanatory information alongside the financial indicators.

When no movies require management review, the component displays an appropriate empty state.

The component provides decision-support information without automatically extending or ending movie screenings.

Screening management actions remain part of the shared management workflow.

## 13. Individual Movie Performance Analysis

The Performance Analysis page provides detailed historical analysis for an individual movie.

The page includes:

- Movie selection control.
- Total recorded revenue.
- Latest weekly revenue.
- Average weekly revenue.
- Highest weekly revenue.
- Individual historical revenue chart.
- Weekly performance history table.
- Data refresh control.

The movie selection control lists movies with available historical performance records.

Changing the selected movie updates the summary statistics, historical chart and weekly performance table.

The existing RevenueTrendChart component is reused for individual movie visualisation.

Configurable chart titles, subtitles and revenue labels allow the same component to support both cinema-wide and individual movie analysis.

## 14. Individual Movie Statistics

The individual movie statistics are calculated using the selected movie's recorded performance history.

| Indicator | Calculation |
|---|---|
| Total recorded revenue | Sum of recorded weekly revenue |
| Average weekly revenue | Total recorded revenue divided by recorded reporting weeks |
| Highest weekly revenue | Maximum recorded weekly revenue |
| Latest weekly revenue | Revenue from the most recent recorded reporting week |
| Latest percentage change | Comparison with the immediately preceding reporting week |

The average excludes reporting weeks without performance records.

The following results were verified for Paper Lanterns.

| Indicator | Verified Result |
|---|---:|
| Recorded reporting weeks | 5 |
| Total recorded revenue | AUD 103,050.00 |
| Average weekly revenue | AUD 20,610.00 |
| Highest weekly revenue | AUD 22,100.00 |
| Latest weekly revenue | AUD 18,750.00 |
| Latest percentage change | -5.3% |

Historical information remains available for movies with ended screenings.

## 15. Weekly Performance History

The individual movie history table presents recorded weekly revenue in reverse chronological order.

| Column | Description |
|---|---|
| Reporting Week | Recorded reporting date |
| Weekly Revenue | Revenue for the recorded week |
| Previous Revenue | Revenue exactly seven days earlier |
| Difference | Monetary revenue change |
| Change (%) | Percentage revenue change |

Previous-week comparisons are unavailable when the immediately preceding reporting week has no performance record.

The table does not substitute an earlier available record for a missing previous-week record.

## 16. Visual Design

The visualisation components use a consistent light dashboard design with navy and blue financial indicators.

The design separates summary information, charts, detailed comparisons and management review information into distinct sections.

### 16.1 Colour Scheme

| Colour | Purpose |
|---|---|
| Navy blue | Primary controls and revenue indicators |
| Medium blue | Supporting revenue chart values |
| White | Cards and component backgrounds |
| Light grey | Dashboard background and secondary surfaces |
| Green | Positive performance changes |
| Red | Negative performance changes and sharp decline indicators |
| Amber | Minimum revenue warnings |
| Grey | Neutral or unavailable information |

Colour is supported by text labels, numerical signs and review descriptions to communicate meaning.

### 16.2 Component Styling

The visualisation components use consistent spacing, rounded borders, readable typography and clearly separated content areas.

Component-specific CSS classes use the av- prefix to reduce conflicts with other team members' frontend components.

The visualisation pages provide their own internal layouts while the shared application navigation and overall application layout remain part of the team integration responsibilities.

## 17. Responsive Design

The visualisation components support different viewport sizes.

| Screen Category | Layout Behaviour |
|---|---|
| Desktop | Multiple summary cards and side-by-side revenue charts where space permits |
| Tablet | Reduced card columns and stacked chart sections |
| Mobile | Single-column cards and vertically arranged content |
| Narrow table container | Internal horizontal scrolling |

The chart containers adapt to their available width using Recharts ResponsiveContainer.

Responsive CSS rules adjust component spacing, typography and grid layouts.

The dashboard revenue chart grid changes to a single-column layout at viewport widths of 1,200 pixels or below.

The individual performance summary cards change from four columns to two columns and subsequently to one column on smaller screens.

## 18. User Interaction

The visualisation module provides several interactive features.

| Interaction | Behaviour |
|---|---|
| Reporting week selection | Retrieves analytics for the selected week |
| Movie selection | Updates individual movie statistics and history |
| Chart hover | Displays detailed revenue information |
| Table sorting | Changes the ordering of movie performance records |
| Movie search | Filters comparison records by movie title |
| Refresh Data | Retrieves updated analytics information |
| Responsive resizing | Adjusts component layouts to available space |

The interactions support exploration of recorded performance information without modifying database records.

## 19. Loading, Empty and Error States

The visualisation components handle different data retrieval conditions.

| State | Behaviour |
|---|---|
| Loading | Displays a loading message |
| Successful retrieval | Displays available analytics information |
| Empty dataset | Displays an appropriate no-data message |
| No review flags | Displays a message indicating no movies require review |
| API failure | Displays an error message |
| Connection restored | Allows data retrieval through Refresh Data |

The useAnalytics hook manages loading, error and refresh states.

Request cancellation is used to prevent outdated requests from updating the interface after relevant selections change or components are removed.

The visualisation components distinguish unavailable information from valid zero values.

## 20. API Integration

The visualisation module retrieves information from the following shared API endpoints.

| Endpoint | Purpose |
|---|---|
| GET /api/v1/movies | Movie information and current screening statuses |
| GET /api/v1/reports/weeks | Available reporting weeks |
| GET /api/v1/reports/weekly | Weekly performance information |
| GET /api/v1/reports/charts/revenue-trend | Historical movie revenue information |
| GET /api/v1/management/review-flags | Management review indicators |

The frontend aggregates historical movie revenue information to prepare the cinema-wide revenue trend.

Weekly performance information is combined with previous-week records and current screening statuses to prepare dashboard indicators.

The visualisation module uses the existing shared API client rather than implementing a separate communication mechanism.

## 21. Data Refresh and Manual Record Changes

The charts and performance indicators are generated from information retrieved through the API.

New performance records are included in subsequent analytics requests.

Corrected revenue records replace previous values, and deleted records are excluded from subsequent results.

The Refresh Data function retrieves updated reporting weeks, weekly performance information, historical revenue and management review flags.

The current implementation does not provide continuous real-time synchronisation between separate user sessions.

## 22. Visualisation Testing

The visualisation components were verified through automated data processing tests, TypeScript validation and manual frontend functional testing.

| Test Area | Result |
|---|---|
| Weekly revenue sorting | Passed |
| Historical revenue aggregation | Passed |
| Chronological trend ordering | Passed |
| Individual movie grouping | Passed |
| Missing reporting week preparation | Passed |
| Weekly revenue chart rendering | Passed |
| Historical cinema revenue chart rendering | Passed |
| Individual movie revenue chart rendering | Passed |
| Movie comparison sorting and searching | Passed |
| Management review presentation | Passed |
| Reporting week selection | Passed |
| Individual movie selection | Passed |
| Data refresh | Passed |
| Responsive layout | Passed |
| Simulated connection failure recovery | Passed |
| Frontend TypeScript validation | Passed |
| Frontend production build | Passed |

The chart data processor completed ten successful automated tests.

Additional analytics service tests verified consistency between weekly revenue totals, movie comparisons and historical revenue information.

Frontend visualisation behaviour was verified manually rather than through an automated browser testing framework.

## 23. Production Build Results

The final frontend production build completed successfully on 28 November 2026.

| Build Metric | Result |
|---|---:|
| Modules transformed | 676 |
| Build duration | 3.28 seconds |
| CSS bundle size | 21.59 kB |
| JavaScript bundle size | 663.10 kB |
| Compressed JavaScript bundle size | 194.79 kB |
| TypeScript errors | 0 |

The build generated a non-blocking warning because the JavaScript bundle exceeded the default 500 kB chunk size threshold.

No shared build configuration changes were introduced solely to suppress this warning.

## 24. Limitations and Future Improvements

The current visualisation module has the following limitations:

- The implementation supports a single cinema hall.
- Historical charts display recorded revenue rather than future forecasts.
- The individual movie selector lists movies with available historical performance records.
- Continuous real-time data synchronisation is not implemented.
- The shared analytics hook retrieves some information that is not required by every individual page.
- The frontend retrieves information through multiple API requests rather than a single consolidated dashboard endpoint.
- Frontend functional testing is performed manually.
- The production JavaScript bundle requires future optimisation.
- Final shared navigation and application layout integration require team coordination.

Potential future improvements include:

- Component-level code splitting.
- Dedicated data retrieval hooks for individual analytics pages.
- Historical reporting date range filters.
- Automated browser and accessibility testing.
- Additional operational performance charts.
- Revenue forecasting visualisations.
- Exportable analytics reports.
- Consolidated dashboard API integration.

These improvements are not included in the current implementation.

## 25. Conclusion

The visualisation module provides a structured and interactive interface for monitoring movie performance within a single cinema hall.

The implementation includes weekly revenue comparisons, historical cinema revenue trends, individual movie performance analysis, comparison tables and management review indicators.

Reusable React components, TypeScript data structures and Recharts visualisations support consistent presentation and maintainability.

Integration with the shared API enables the visualisation components to reflect current database information, including manually entered, corrected and deleted performance records.

The completed functional testing, TypeScript validation and production build confirm successful operation of the assigned visualisation components within the local development environment.