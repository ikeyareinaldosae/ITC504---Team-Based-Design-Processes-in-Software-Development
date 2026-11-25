# Data dictionary (Rose Budha)

## movies

| Column | Type | Required | Rule |
|---|---|---|---|
| movieId | integer | yes | automatic number, primary key |
| title | text | yes | not blank, unique ignoring letter case |
| genre | text | no | |
| releaseDate | date | no | a real calendar date |
| screeningStatus | enum | yes | `active` (default), `extended`, `ended` |
| extendedWeeks | integer | yes | 0 or more, default 0 |

## performance

| Column | Type | Required | Rule |
|---|---|---|---|
| recordId | integer | yes | automatic number, primary key |
| movieId | integer | yes | must exist in movies; deleted with the movie |
| weekStart | date | yes | must be a Monday; unique with movieId |
| revenue | numeric | yes | AUD, 0 or more, at most 2 decimals |
| ticketsSold | integer | no | 0 or more |
| screenings | integer | no | 0 or more |
| isoWeek | text | calculated | ISO week such as `2026-W40`; cannot be set |

## settings

| Column | Type | Rule |
|---|---|---|
| name | text | primary key: `minRevenue`, `dropPercent` |
| value | numeric | placeholders 5000 and 30 until the team agrees |

## users

| Column | Type | Rule |
|---|---|---|
| userId | integer | automatic number, primary key |
| username | text | unique ignoring letter case |
| passwordHash | text | a hash, never the password |
| role | enum | `employee` (default) or `manager` |

## v_weekly_report (view)

`weekStart`, `isoWeek`, `movieId`, `title`, `revenue`, `ticketsSold`, `screenings`, `screeningStatus`, `previousRevenue`, `difference`, `percentChange`. The last three are empty when the movie has no record seven days earlier.

## v_review_flags (view)

`weekStart`, `movieId`, `title`, `revenue`, `previousRevenue`, `percentChange`, `reason` (`BELOW_MIN_REVENUE` or `SHARP_DROP`).
