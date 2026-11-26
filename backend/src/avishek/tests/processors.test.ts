
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type {
  MovieRow,
} from "../../rose/repositories/movie.repository.js";

import type {
  WeeklyReportRow,
} from "../../rose/repositories/performance.repository.js";

import {
  processRevenueSummary,
  processMovieComparison,
} from "../processors/revenue.processor.js";

import {
  processScreeningSummary,
  processWeeklyAnalytics,
} from "../processors/weeklyData.processor.js";

import {
  processRevenueChart,
  processRevenueTrend,
  processMovieRevenueTrends,
  type RevenueTrendRow,
} from "../processors/chartData.processor.js";

// Reusable test fixtures.

function record(
  overrides: Partial<WeeklyReportRow> = {},
): WeeklyReportRow {
  return {
    movieId: 1,
    title: "Movie A",
    revenue: 10000,
    previousRevenue: null,
    difference: null,
    percentChange: null,
    ticketsSold: 500,
    screenings: 20,
    screeningStatus: "active",
    ...overrides,
  };
}

function movie(
  overrides: Partial<MovieRow> = {},
): MovieRow {
  return {
    movieId: 1,
    title: "Movie A",
    genre: null,
    releaseDate: null,
    screeningStatus: "active",
    extendedWeeks: 0,
    ...overrides,
  };
}

const week = "2026-11-23";

// Revenue processor tests.

describe("Revenue processor", () => {
  it("calculates total weekly revenue", () => {
    const result = processRevenueSummary(
      [
        record({ revenue: 12000 }),
        record({ movieId: 2, revenue: 8000 }),
      ],
      [],
    );

    assert.equal(result.totalRevenue, 20000);
  });

  it("calculates weekly revenue growth", () => {
    const result = processRevenueSummary(
      [record({ revenue: 12000 })],
      [record({ revenue: 10000 })],
    );

    assert.equal(result.revenueDifference, 2000);
    assert.equal(result.percentChange, 20);
  });

  it("calculates weekly revenue decline", () => {
    const result = processRevenueSummary(
      [record({ revenue: 6500 })],
      [record({ revenue: 10000 })],
    );

    assert.equal(result.revenueDifference, -3500);
    assert.equal(result.percentChange, -35);
  });

  it("identifies the highest-performing movie", () => {
    const result = processRevenueSummary(
      [
        record({ revenue: 5000 }),
        record({
          movieId: 2,
          title: "Movie B",
          revenue: 15000,
        }),
      ],
      [],
    );

    assert.equal(result.bestMovie, "Movie B");
  });

  it("handles missing previous-week records", () => {
    const result = processRevenueSummary(
      [record()],
      [],
    );

    assert.equal(result.previousTotalRevenue, null);
    assert.equal(result.revenueDifference, null);
    assert.equal(result.percentChange, null);
  });

  it("handles empty current-week records", () => {
    const result = processRevenueSummary(
      [],
      [record()],
    );

    assert.equal(result.totalRevenue, 0);
    assert.equal(result.bestMovie, null);
    assert.equal(result.revenueDifference, null);
    assert.equal(result.percentChange, null);
  });

  it("handles an actual zero-revenue record", () => {
    const result = processRevenueSummary(
      [record({ revenue: 0 })],
      [record({ revenue: 10000 })],
    );

    assert.equal(result.percentChange, -100);
  });

  it("includes newly added performance records", () => {
    const original = [record()];

    const updated = [
      ...original,
      record({ movieId: 2, revenue: 8000 }),
    ];

    assert.equal(
      processRevenueSummary(original, []).totalRevenue,
      10000,
    );

    assert.equal(
      processRevenueSummary(updated, []).totalRevenue,
      18000,
    );
  });

  it("recalculates corrected revenue records", () => {
    const original = [record({ revenue: 10000 })];

    const corrected = original.map((row) => ({
      ...row,
      revenue: 15000,
    }));

    assert.equal(
      processRevenueSummary(corrected, []).totalRevenue,
      15000,
    );
  });

  it("recalculates after performance record deletion", () => {
    const original = [
      record(),
      record({ movieId: 2, revenue: 8000 }),
    ];

    const remaining = original.filter(
      (row) => row.movieId !== 2,
    );

    assert.equal(
      processRevenueSummary(remaining, []).totalRevenue,
      10000,
    );
  });

  it("calculates and sorts movie revenue shares", () => {
    const result = processMovieComparison([
      record({ movieId: 2, revenue: 8000 }),
      record({ movieId: 1, revenue: 12000 }),
    ]);

    assert.equal(result[0].movieId, 1);
    assert.equal(result[0].revenueShare, 60);
    assert.equal(result[1].revenueShare, 40);
  });

  it("preserves missing movie revenue history", () => {
    const result = processMovieComparison([
      record({ previousRevenue: null }),
    ]);

    assert.equal(result[0].difference, null);
    assert.equal(result[0].percentChange, null);
  });

  it("handles zero total revenue in comparisons", () => {
    const result = processMovieComparison([
      record({ revenue: 0 }),
    ]);

    assert.equal(result[0].revenueShare, null);
  });

  it("handles empty movie comparisons", () => {
    assert.deepEqual(processMovieComparison([]), []);
  });
});

// Weekly data processor tests.

describe("Weekly data processor", () => {
  it("counts all screening statuses", () => {
    const result = processScreeningSummary([
      movie(),
      movie({
        movieId: 2,
        screeningStatus: "extended",
      }),
      movie({
        movieId: 3,
        screeningStatus: "ended",
      }),
    ]);

    assert.deepEqual(result, {
      totalMovies: 3,
      activeMovies: 1,
      extendedMovies: 1,
      endedMovies: 1,
    });
  });

  it("handles an empty movie list", () => {
    assert.deepEqual(processScreeningSummary([]), {
      totalMovies: 0,
      activeMovies: 0,
      extendedMovies: 0,
      endedMovies: 0,
    });
  });

  it("aggregates weekly performance metrics", () => {
    const result = processWeeklyAnalytics(
      week,
      [
        record(),
        record({
          movieId: 2,
          revenue: 8000,
          ticketsSold: 400,
          screenings: 16,
        }),
      ],
      [],
      [movie(), movie({ movieId: 2 })],
    );

    assert.equal(result.hasData, true);
    assert.equal(result.revenue.totalRevenue, 18000);
    assert.equal(result.totalTicketsSold, 900);
    assert.equal(result.totalScreenings, 36);
  });

  it("includes movies without performance records", () => {
    const result = processWeeklyAnalytics(
      week,
      [record()],
      [],
      [movie(), movie({ movieId: 2 })],
    );

    assert.equal(result.screeningSummary.totalMovies, 2);
    assert.equal(result.movies.length, 1);
  });

  it("preserves missing ticket totals", () => {
    const result = processWeeklyAnalytics(
      week,
      [record({ ticketsSold: null })],
      [],
      [],
    );

    assert.equal(result.totalTicketsSold, null);
  });

  it("preserves missing screening totals", () => {
    const result = processWeeklyAnalytics(
      week,
      [record({ screenings: null })],
      [],
      [],
    );

    assert.equal(result.totalScreenings, null);
  });

  it("preserves valid zero ticket and screening counts", () => {
    const result = processWeeklyAnalytics(
      week,
      [record({ ticketsSold: 0, screenings: 0 })],
      [],
      [],
    );

    assert.equal(result.totalTicketsSold, 0);
    assert.equal(result.totalScreenings, 0);
  });

  it("handles empty reporting weeks", () => {
    const result = processWeeklyAnalytics(
      week,
      [],
      [],
      [],
    );

    assert.equal(result.hasData, false);
    assert.equal(result.revenue.totalRevenue, 0);
    assert.equal(result.totalTicketsSold, null);
    assert.equal(result.totalScreenings, null);
  });

  it("rejects invalid reporting weeks", () => {
    assert.throws(() =>
      processWeeklyAnalytics(
        "2026-11-26",
        [],
        [],
        [],
      ),
    );
  });

  it("sorts weekly records by revenue", () => {
    const result = processWeeklyAnalytics(
      week,
      [
        record({ revenue: 5000 }),
        record({ movieId: 2, revenue: 15000 }),
      ],
      [],
      [],
    );

    assert.equal(result.movies[0].movieId, 2);
  });
});

// Chart data processor tests.

describe("Chart data processor", () => {
  const trend: RevenueTrendRow[] = [
    {
      movieId: 1,
      title: "Movie A",
      weekStart: "2026-11-23",
      revenue: 12000,
    },
    {
      movieId: 2,
      title: "Movie B",
      weekStart: "2026-11-23",
      revenue: 8000,
    },
    {
      movieId: 1,
      title: "Movie A",
      weekStart: "2026-11-09",
      revenue: 9000,
    },
  ];

  it("sorts revenue bar chart data", () => {
    const result = processRevenueChart([
      record({ revenue: 8000 }),
      record({ movieId: 2, revenue: 12000 }),
    ]);

    assert.equal(result[0].revenue, 12000);
    assert.equal(result[1].revenue, 8000);
  });

  it("preserves missing previous revenue", () => {
    const result = processRevenueChart([record()]);

    assert.equal(result[0].previousRevenue, null);
  });

  it("aggregates cinema revenue by reporting week", () => {
    const result = processRevenueTrend(trend);

    assert.deepEqual(result, [
      { weekStart: "2026-11-09", revenue: 9000 },
      { weekStart: "2026-11-23", revenue: 20000 },
    ]);
  });

  it("sorts trend data chronologically", () => {
    const result = processRevenueTrend(trend);

    assert.equal(result[0].weekStart, "2026-11-09");
    assert.equal(result[1].weekStart, "2026-11-23");
  });

  it("does not fabricate missing reporting weeks", () => {
    const result = processRevenueTrend(trend);

    assert.equal(
      result.some(
        (point) => point.weekStart === "2026-11-16",
      ),
      false,
    );
  });

  it("groups individual movie revenue trends", () => {
    const result = processMovieRevenueTrends(trend);

    assert.equal(result.length, 2);
    assert.equal(result[0].chartPoints.length, 2);
    assert.equal(result[1].chartPoints.length, 1);
  });

  it("sorts individual movie trend points", () => {
    const result = processMovieRevenueTrends(trend);

    assert.equal(
      result[0].chartPoints[0].weekStart,
      "2026-11-09",
    );

    assert.equal(
      result[0].chartPoints[1].weekStart,
      "2026-11-23",
    );
  });

  it("groups movies by ID rather than title", () => {
    const result = processMovieRevenueTrends([
      trend[0],
      {
        ...trend[0],
        movieId: 2,
      },
    ]);

    assert.equal(result.length, 2);
  });

  it("includes newly entered weekly revenue in trends", () => {
    const result = processRevenueTrend([
      ...trend,
      {
        movieId: 3,
        title: "Movie C",
        weekStart: "2026-11-23",
        revenue: 5000,
      },
    ]);

    assert.equal(result[1].revenue, 25000);
  });

  it("handles empty chart datasets", () => {
    assert.deepEqual(processRevenueChart([]), []);
    assert.deepEqual(processRevenueTrend([]), []);
    assert.deepEqual(processMovieRevenueTrends([]), []);
  });
});
