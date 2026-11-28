# Performance Review Rules

## 1. Introduction

The performance review module identifies movies requiring management attention based on recorded weekly revenue and changes in financial performance.

The module supports management decisions regarding the continuation, extension or termination of movie screenings within a single cinema hall.

The system provides decision-support indicators rather than automatically changing movie screening statuses.

## 2. Objectives

The performance review module has the following objectives:

- Identify movies generating insufficient weekly revenue.
- Detect significant declines in movie revenue.
- Provide consistent performance evaluation criteria.
- Support informed screening management decisions.
- Preserve historical performance information.
- Respond to newly entered, corrected and deleted performance records.

## 3. Implementation Structure

The performance review functionality integrates backend services, shared repository functions, API endpoints and frontend components.

| Component | Responsibility |
|---|---|
| reviewFlags.service.ts | Performance review processing and threshold validation |
| analytics.service.ts | Integration of review flags with consolidated analytics |
| Shared performance repository | Database-backed performance evaluation |
| analytics.types.ts | Review flag and threshold data structures |
| useAnalytics.ts | Retrieval and refresh of review information |
| ReviewFlags.tsx | Presentation of management review indicators |
| ReviewFlags.css | Styling of review indicators and component states |

The implementation reuses the existing database repository functions rather than introducing a separate performance review database.

## 4. Performance Review Thresholds

The current implementation supports two configurable performance review thresholds.

| Threshold | Default Value |
|---|---:|
| Minimum weekly revenue | AUD 5,000.00 |
| Significant revenue decline | 30% |

These values are the current implementation defaults and can be overridden through supported backend and API parameters.

They represent configurable business rules rather than independently established financial viability requirements.

## 5. Minimum Revenue Rule

The minimum revenue rule identifies movies generating revenue below the configured minimum weekly revenue threshold.

Condition:

Current Weekly Revenue < Minimum Revenue Threshold

Default condition:

Current Weekly Revenue < AUD 5,000.00

When this condition is satisfied, the movie receives the following review flag:

BELOW_MIN_REVENUE

The frontend displays this flag as Below Minimum Revenue.

### 5.1 Example

| Metric | The Last Ferry |
|---|---:|
| Current weekly revenue | AUD 3,200.00 |
| Minimum revenue threshold | AUD 5,000.00 |
| Difference below threshold | AUD 1,800.00 |
| Review outcome | Below Minimum Revenue |

The movie requires management attention because its recorded weekly revenue is below the configured minimum.

### 5.2 Boundary Conditions

| Weekly Revenue | Review Outcome |
|---|---|
| AUD 4,999.99 | Below Minimum Revenue |
| AUD 5,000.00 | Minimum revenue rule not triggered |
| AUD 5,000.01 | Minimum revenue rule not triggered |
| AUD 0.00 | Below Minimum Revenue |

A movie that satisfies the minimum revenue threshold may still receive a significant revenue decline flag.

## 6. Significant Revenue Decline Rule

The significant revenue decline rule identifies movies experiencing a substantial reduction in revenue compared with the previous reporting week.

Percentage Change = ((Current Revenue - Previous Revenue) / Previous Revenue) × 100

A review flag is generated when the calculated percentage change is less than or equal to the negative configured decline threshold.

Default condition:

Percentage Change ≤ -30%

When this condition is satisfied, the movie receives the following review flag:

SHARP_DROP

The frontend displays this flag as Sharp Revenue Decline.

### 6.1 Example

| Metric | Neon Static |
|---|---:|
| Current weekly revenue | AUD 5,100.00 |
| Previous weekly revenue | AUD 12,950.00 |
| Revenue difference | AUD -7,850.00 |
| Percentage change | -60.6% |
| Decline threshold | 30% |
| Review outcome | Sharp Revenue Decline |

Although Neon Static generated revenue above the minimum threshold, its significant revenue decline requires management attention.

### 6.2 Boundary Conditions

| Percentage Change | Review Outcome |
|---|---|
| -29.9% | Significant decline rule not triggered |
| -30.0% | Sharp Revenue Decline |
| -30.1% | Sharp Revenue Decline |
| 0.0% | Significant decline rule not triggered |
| Positive percentage | Significant decline rule not triggered |

These conditions are evaluated using the calculated percentage change.

## 7. Review Flag Priority

A movie may satisfy both the minimum revenue rule and the significant revenue decline rule.

When both conditions are satisfied, the minimum revenue rule takes priority.

The system returns one review reason for each flagged movie.

| Minimum Revenue Rule | Significant Decline Rule | Review Outcome |
|---|---|---|
| Triggered | Triggered | Below Minimum Revenue |
| Triggered | Not triggered | Below Minimum Revenue |
| Not triggered | Triggered | Sharp Revenue Decline |
| Not triggered | Not triggered | No review flag |

This approach avoids duplicate review entries for the same movie.

## 8. Screening Status Eligibility

Performance review flags are generated according to the movie's current screening status.

| Screening Status | Eligible for Review |
|---|---|
| Active | Yes |
| Extended | Yes |
| Ended | No |

Movies with ended screenings are excluded from management review because they are no longer undergoing active screening management.

However, their historical performance records remain available for revenue calculations, historical charts and individual movie analysis.

Ending a movie screening does not remove its historical financial information.

## 9. Missing Data Handling

The performance review module distinguishes between missing records and actual recorded revenue.

| Condition | Review Behaviour |
|---|---|
| Missing current-week performance record | No review flag |
| Missing previous-week revenue | Evaluate minimum revenue rule only |
| Previous-week revenue is zero | Percentage decline unavailable |
| Current recorded revenue is zero | Evaluate minimum revenue rule |
| Empty reporting week | Return no review flags |
| Ended movie screening | Exclude from review |

Previous-week comparisons use the reporting week exactly seven days before the selected reporting week.

The system does not generate a decline indicator by treating missing performance records as zero revenue.

## 10. Performance Review Workflow

The performance review workflow consists of the following operations:

1. The user selects a reporting week.
2. The system validates the selected reporting date.
3. The configured review thresholds are applied.
4. Relevant movie performance records are retrieved.
5. Movies with ended screenings are excluded.
6. Current weekly revenue is evaluated.
7. Previous-week revenue and percentage changes are evaluated where available.
8. The applicable review reason is assigned.
9. The review results are returned to the frontend.
10. Management reviews the identified movies and determines the appropriate action.

The review process is repeated when updated information is requested.

## 11. API Integration

The frontend retrieves performance review information through the following endpoint:

GET /api/v1/management/review-flags

The endpoint supports the following query parameters:

| Parameter | Required | Description |
|---|---|---|
| weekStart | Yes | Monday reporting date in YYYY-MM-DD format |
| minRevenue | No | Minimum weekly revenue threshold |
| dropPercent | No | Significant revenue decline threshold |

Example request:

GET /api/v1/management/review-flags?weekStart=2026-10-12

Example request with custom thresholds:

GET /api/v1/management/review-flags?weekStart=2026-10-12&minRevenue=6000&dropPercent=25

The response contains the following information for each flagged movie:

- Movie identifier.
- Movie title.
- Current weekly revenue.
- Previous weekly revenue.
- Revenue percentage change.
- Review reason.

Invalid reporting dates and unsupported threshold values are rejected through validation.

## 12. Frontend Presentation

The Management Review component is integrated into the Analytics Dashboard.

The component displays movies requiring attention for the selected reporting week.

Each review entry provides:

- Movie title.
- Review reason.
- Current weekly revenue.
- Previous weekly revenue.
- Revenue percentage change.
- Explanation of the identified performance issue.

The component uses different visual indicators to distinguish review reasons.

| Review Reason | Visual Indicator |
|---|---|
| Below Minimum Revenue | Amber warning indicator |
| Sharp Revenue Decline | Red decline indicator |

The component also supports loading, error and empty data states.

When no movies require review, the component displays an appropriate empty review message.

## 13. Verified Performance Review Results

The reporting week commencing 12 October 2026 was used to verify the default performance review rules.

| Movie | Current Revenue (AUD) | Previous Revenue (AUD) | Change | Review Outcome |
|---|---:|---:|---:|---|
| Coral Kingdom | 66,800.00 | 63,400.00 | +5.4% | No flag |
| Midnight Harbour | 28,750.00 | 31,200.00 | -7.9% | No flag |
| Outback Run | 27,050.00 | 26,800.00 | +0.9% | No flag |
| Paper Lanterns | 18,750.00 | 19,800.00 | -5.3% | No flag |
| Southern Cross | 9,900.00 | 9,400.00 | +5.3% | No flag |
| Neon Static | 5,100.00 | 12,950.00 | -60.6% | Sharp Revenue Decline |
| The Last Ferry | 3,200.00 | 4,300.00 | -25.6% | Below Minimum Revenue |

Two movies were identified as requiring management attention.

Grandma's Gold was excluded from management review because its screening status was ended.

## 14. Management Decision Support

The review module provides information to assist management in determining appropriate screening actions.

Possible management decisions include:

| Decision | Description |
|---|---|
| Continue screening | Maintain the existing screening arrangement |
| Extend screening | Increase the screening duration |
| End screening | Terminate further screenings |

A performance review flag does not automatically require screening termination.

Management may consider additional information, including historical revenue, audience demand, screening availability and operational requirements.

Screening extension and termination operations are handled through the shared management workflow.

The analytics module does not independently modify movie screening statuses.

## 15. Response to Manual Data Changes

Performance review results are generated from current database information.

When performance records are inserted, corrected or deleted, subsequent review requests evaluate the updated information.

A corrected revenue record may remove an existing review flag or generate a new review flag depending on the updated values.

Automated integration testing verified that:

- Newly entered performance records are included in review calculations.
- Corrected revenue can remove an existing review flag.
- Deleted performance records are excluded from subsequent analytics.
- Ended movies are excluded from review results.
- Historical revenue remains available after screening termination.

The frontend Refresh Data function retrieves updated review results from the API.

## 16. Testing and Validation

Performance review rules were verified through automated analytics service tests and integrated frontend testing.

The dedicated review flags service completed nine successful tests covering:

- Default review thresholds.
- Identification of movies requiring management attention.
- Custom review thresholds.
- Minimum revenue rule priority.
- Exclusion of ended movies.
- Invalid minimum revenue thresholds.
- Invalid percentage decline thresholds.
- Invalid reporting dates.
- Non-Monday reporting dates.

Additional consolidated analytics and live database tests verified review result consistency and recalculation following manual performance record changes.

All 133 backend analytics regression tests passed without failures.

API integration and frontend functional testing also confirmed successful retrieval and presentation of management review information.

## 17. Limitations and Future Improvements

The current review module evaluates revenue and percentage changes rather than complete financial profitability.

Operating expenses, licensing costs and cinema capacity are not included in the review calculations.

The system does not predict future revenue or audience demand.

Review flags are generated using current screening statuses rather than reconstructed historical screening statuses.

Threshold values can be overridden through supported backend and API parameters, but the current analytics frontend does not provide a dedicated threshold configuration interface.

Future improvements may include:

- Management-controlled threshold configuration.
- Multiple-week performance decline analysis.
- Cinema occupancy and audience demand indicators.
- Operating cost and profitability analysis.
- Historical management decision tracking.
- Revenue forecasting and advanced performance recommendations.

These improvements are outside the current implementation scope.

## 18. Conclusion

The performance review module provides consistent and configurable rules for identifying underperforming movies.

The implementation supports minimum revenue evaluation, significant revenue decline detection, screening status eligibility and management decision support.

Integration with the shared database, API and frontend enables review results to respond to updated performance information.

Automated testing has verified the implemented review rules and their integration with the broader analytics module.