import { describe, it, after } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "../../rose/prismaClient.js";

import {
  listWeeks,
} from "../../rose/repositories/performance.repository.js";

import {
  getRevenueSummary,
} from "../services/revenue.service.js";

import {
  getMovieComparison,
} from "../services/comparison.service.js";

import {
  getRevenueTrend,
  getMovieRevenueTrends,
} from "../services/trend.service.js";

import {
  getReviewFlags,
  DEFAULT_REVIEW_THRESHOLDS,
} from "../services/reviewFlags.service.js";

import {
  getWeeklyAnalytics,
  getDashboardAnalytics,
} from "../services/analytics.service.js";

/**
 * Retrieves the available reporting range dynamically.
 */
async function getReportingRange() {
  const weeks = await listWeeks();

  assert.ok(
    weeks.length > 0,
    "Database must contain reporting records.",
  );

  return {
    earliest: weeks[weeks.length - 1].weekStart,
    latest: weeks[0].weekStart,
  };
}

after(async () => {
  await prisma.$disconnect();
});

describe("Analytics service environment", () => {
  it("connects to the database and retrieves reporting weeks", async () => {
    const range = await getReportingRange();

    assert.ok(range.earliest);
    assert.ok(range.latest);
    assert.ok(range.earliest <= range.latest);
  });
});

describe("Revenue service", () => {
  it("calculates total weekly revenue from database records", async () => {
    const { latest } = await getReportingRange();

    const { weeklyReport } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const rows = await weeklyReport({
      weekStart: latest,
    });

    const expectedRevenue =
      rows.reduce(
        (total, row) => total + Math.round(row.revenue * 100),
        0,
      ) / 100;

    const result = await getRevenueSummary(latest);

    assert.equal(result.totalRevenue, expectedRevenue);
  });

  it("calculates previous-week revenue correctly", async () => {
    const { latest } = await getReportingRange();

    const { getPreviousWeek } = await import(
      "../utils/dateUtils.js"
    );

    const { weeklyReport } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const previousRows = await weeklyReport({
      weekStart: getPreviousWeek(latest),
    });

    const expectedRevenue =
      previousRows.length > 0
        ? previousRows.reduce(
            (total, row) =>
              total + Math.round(row.revenue * 100),
            0,
          ) / 100
        : null;

    const result = await getRevenueSummary(latest);

    assert.equal(
      result.previousTotalRevenue,
      expectedRevenue,
    );
  });

  it("calculates revenue difference correctly", async () => {
    const { latest } = await getReportingRange();

    const result = await getRevenueSummary(latest);

    const expectedDifference =
      result.previousTotalRevenue === null
        ? null
        : Math.round(
            (result.totalRevenue -
              result.previousTotalRevenue) * 100,
          ) / 100;

    assert.equal(
      result.revenueDifference,
      expectedDifference,
    );
  });

  it("calculates percentage change correctly", async () => {
    const { latest } = await getReportingRange();

    const result = await getRevenueSummary(latest);

    const previous = result.previousTotalRevenue;

    const expectedChange =
      previous === null || previous === 0
        ? null
        : Math.round(
            ((result.totalRevenue - previous) /
              previous) * 1000,
          ) / 10;

    assert.equal(result.percentChange, expectedChange);
  });

  it("identifies the best-performing movie", async () => {
    const { latest } = await getReportingRange();

    const { weeklyReport } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const rows = await weeklyReport({
      weekStart: latest,
    });

    const expectedMovie =
      [...rows].sort(
        (a, b) =>
          b.revenue - a.revenue ||
          a.movieId - b.movieId,
      )[0]?.title ?? null;

    const result = await getRevenueSummary(latest);

    assert.equal(result.bestMovie, expectedMovie);
  });

  it("rejects invalid reporting dates", async () => {
    await assert.rejects(
      getRevenueSummary("invalid-date"),
      /Invalid date/,
    );
  });

  it("rejects non-Monday reporting dates", async () => {
    await assert.rejects(
      getRevenueSummary("2026-11-26"),
      /Monday/,
    );
  });
});

describe("Movie comparison service", () => {
  it("includes all movies with weekly performance records", async () => {
    const { latest } = await getReportingRange();

    const { weeklyReport } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const rows = await weeklyReport({
      weekStart: latest,
    });

    const result = await getMovieComparison(latest);

    assert.equal(result.length, rows.length);

    assert.deepEqual(
      result.map(row => row.movieId).sort((a, b) => a - b),
      rows.map(row => row.movieId).sort((a, b) => a - b),
    );
  });

  it("sorts movies by revenue in descending order", async () => {
    const { latest } = await getReportingRange();

    const result = await getMovieComparison(latest);

    for (let i = 1; i < result.length; i++) {
      assert.ok(
        result[i - 1].revenue >= result[i].revenue,
      );
    }
  });

  it("calculates individual movie revenue shares", async () => {
    const { latest } = await getReportingRange();

    const result = await getMovieComparison(latest);

    const totalRevenue =
      result.reduce(
        (sum, row) => sum + Math.round(row.revenue * 100),
        0,
      ) / 100;

    for (const movie of result) {
      const expectedShare =
        totalRevenue === 0
          ? null
          : Math.round(
              (movie.revenue / totalRevenue) * 1000,
            ) / 10;

      assert.equal(movie.revenueShare, expectedShare);
    }
  });

  it("calculates individual movie revenue differences", async () => {
    const { latest } = await getReportingRange();

    const result = await getMovieComparison(latest);

    for (const movie of result) {
      const expectedDifference =
        movie.previousRevenue === null
          ? null
          : Math.round(
              (movie.revenue - movie.previousRevenue) * 100,
            ) / 100;

      assert.equal(movie.difference, expectedDifference);
    }
  });

  it("calculates individual movie percentage changes", async () => {
    const { latest } = await getReportingRange();

    const result = await getMovieComparison(latest);

    for (const movie of result) {
      const previous = movie.previousRevenue;

      const expectedChange =
        previous === null || previous === 0
          ? null
          : Math.round(
              ((movie.revenue - previous) / previous) * 1000,
            ) / 10;

      assert.equal(movie.percentChange, expectedChange);
    }
  });

  it("preserves movie screening statuses", async () => {
    const { latest } = await getReportingRange();

    const { listMovies } = await import(
      "../../rose/repositories/movie.repository.js"
    );

    const movies = await listMovies();

    const result = await getMovieComparison(latest);

    for (const row of result) {
      const movie = movies.find(
        item => item.movieId === row.movieId,
      );

      assert.ok(movie);

      assert.equal(
        row.screeningStatus,
        movie.screeningStatus,
      );
    }
  });

  it("rejects invalid reporting dates", async () => {
    await assert.rejects(
      getMovieComparison("invalid-date"),
      /Invalid date/,
    );
  });

  it("rejects non-Monday reporting dates", async () => {
    await assert.rejects(
      getMovieComparison("2026-11-26"),
      /Monday/,
    );
  });
});

describe("Revenue trend service", () => {
  it("calculates total cinema revenue for each reporting week", async () => {
    const { earliest, latest } = await getReportingRange();

    const { revenueTrend } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const rows = await revenueTrend(earliest, latest);

    const totals = new Map<string, number>();

    for (const row of rows) {
      totals.set(
        row.weekStart,
        (totals.get(row.weekStart) ?? 0) +
          Math.round(row.revenue * 100),
      );
    }

    const expected = Array.from(
      totals,
      ([weekStart, cents]) => ({
        weekStart,
        revenue: cents / 100,
      }),
    ).sort((a, b) =>
      a.weekStart.localeCompare(b.weekStart),
    );

    const result = await getRevenueTrend(
      earliest,
      latest,
    );

    assert.deepEqual(result, expected);
  });

  it("sorts cinema revenue trends chronologically", async () => {
    const { earliest, latest } = await getReportingRange();

    const result = await getRevenueTrend(
      earliest,
      latest,
    );

    for (let i = 1; i < result.length; i++) {
      assert.ok(
        result[i - 1].weekStart < result[i].weekStart,
      );
    }
  });

  it("includes all movies with historical performance records", async () => {
    const { earliest, latest } = await getReportingRange();

    const { revenueTrend } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const rows = await revenueTrend(earliest, latest);

    const expectedIds = [
      ...new Set(rows.map(row => row.movieId)),
    ].sort((a, b) => a - b);

    const result = await getMovieRevenueTrends(
      earliest,
      latest,
    );

    assert.deepEqual(
      result.map(movie => movie.movieId)
        .sort((a, b) => a - b),
      expectedIds,
    );
  });

  it("preserves individual movie revenue history", async () => {
    const { earliest, latest } = await getReportingRange();

    const { revenueTrend } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const rows = await revenueTrend(earliest, latest);

    const result = await getMovieRevenueTrends(
      earliest,
      latest,
    );

    for (const movie of result) {
      const expected = rows
        .filter(row => row.movieId === movie.movieId)
        .map(row => ({
          weekStart: row.weekStart,
          revenue: row.revenue,
        }))
        .sort((a, b) =>
          a.weekStart.localeCompare(b.weekStart),
        );

      assert.deepEqual(movie.chartPoints, expected);
    }
  });

  it("filters revenue trends by movie ID", async () => {
    const { earliest, latest } = await getReportingRange();

    const movies = await getMovieRevenueTrends(
      earliest,
      latest,
    );

    assert.ok(movies.length > 0);

    const selectedMovie = movies[0];

    const result = await getMovieRevenueTrends(
      earliest,
      latest,
      selectedMovie.movieId,
    );

    assert.equal(result.length, 1);
    assert.deepEqual(result[0], selectedMovie);
  });

  it("supports a single-week reporting range", async () => {
    const { latest } = await getReportingRange();

    const result = await getRevenueTrend(
      latest,
      latest,
    );

    const summary = await getRevenueSummary(latest);

    assert.equal(result.length, 1);
    assert.equal(result[0].weekStart, latest);
    assert.equal(
      result[0].revenue,
      summary.totalRevenue,
    );
  });

  it("rejects invalid reporting dates", async () => {
    const { latest } = await getReportingRange();

    await assert.rejects(
      getRevenueTrend("invalid-date", latest),
      /Invalid date/,
    );
  });

  it("rejects reversed reporting ranges", async () => {
    await assert.rejects(
      getRevenueTrend("2026-11-30", "2026-11-23"),
      /Start week cannot be after end week/,
    );
  });

  it("rejects invalid movie IDs", async () => {
    const { earliest, latest } = await getReportingRange();

    for (const movieId of [-1, 0, 1.5, NaN]) {
      await assert.rejects(
        getMovieRevenueTrends(
          earliest,
          latest,
          movieId,
        ),
        /Invalid movie ID/,
      );
    }
  });
});

describe("Review flags service", () => {
  it("uses the default review thresholds", async () => {
    const { latest } = await getReportingRange();

    const result = await getReviewFlags(latest);

    const expected = await getReviewFlags(
      latest,
      DEFAULT_REVIEW_THRESHOLDS,
    );

    assert.deepEqual(result, expected);
  });

  it("identifies all movies requiring management review", async () => {
    const { latest } = await getReportingRange();

    const { weeklyReport } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const rows = await weeklyReport({
      weekStart: latest,
    });

    const expected = rows
      .filter(row =>
        row.screeningStatus !== "ended" &&
        (
          row.revenue <
            DEFAULT_REVIEW_THRESHOLDS.minRevenue ||
          (
            row.percentChange !== null &&
            row.percentChange <=
              -DEFAULT_REVIEW_THRESHOLDS.dropPercent
          )
        )
      )
      .map(row => row.movieId)
      .sort((a, b) => a - b);

    const result = await getReviewFlags(latest);

    assert.deepEqual(
      result.map(row => row.movieId)
        .sort((a, b) => a - b),
      expected,
    );
  });

  it("supports custom review thresholds", async () => {
    const { latest } = await getReportingRange();

    const thresholds = {
      minRevenue: 10000,
      dropPercent: 20,
    };

    const { weeklyReport } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const rows = await weeklyReport({
      weekStart: latest,
    });

    const expected = rows
      .filter(row =>
        row.screeningStatus !== "ended" &&
        (
          row.revenue < thresholds.minRevenue ||
          (
            row.percentChange !== null &&
            row.percentChange <= -thresholds.dropPercent
          )
        )
      )
      .map(row => row.movieId)
      .sort((a, b) => a - b);

    const result = await getReviewFlags(
      latest,
      thresholds,
    );

    assert.deepEqual(
      result.map(row => row.movieId)
        .sort((a, b) => a - b),
      expected,
    );
  });

  it("prioritises low revenue over sharp decline", async () => {
    const { latest } = await getReportingRange();

    const thresholds = {
      minRevenue: 10000,
      dropPercent: 20,
    };

    const result = await getReviewFlags(
      latest,
      thresholds,
    );

    for (const flag of result) {
      if (flag.revenue < thresholds.minRevenue) {
        assert.equal(
          flag.reason,
          "BELOW_MIN_REVENUE",
        );
      } else {
        assert.equal(flag.reason, "SHARP_DROP");

        assert.ok(
          flag.percentChange !== null &&
          flag.percentChange <= -thresholds.dropPercent,
        );
      }
    }
  });

  it("excludes movies with ended screenings", async () => {
    const { latest } = await getReportingRange();

    const { listMovies } = await import(
      "../../rose/repositories/movie.repository.js"
    );

    const movies = await listMovies();

    const endedIds = new Set(
      movies
        .filter(movie => movie.screeningStatus === "ended")
        .map(movie => movie.movieId),
    );

    const result = await getReviewFlags(latest, {
      minRevenue: Number.MAX_SAFE_INTEGER,
      dropPercent: 1,
    });

    for (const flag of result) {
      assert.ok(!endedIds.has(flag.movieId));
    }
  });

  it("rejects invalid minimum revenue thresholds", async () => {
    const { latest } = await getReportingRange();

    for (const minRevenue of [-1, NaN, Infinity]) {
      await assert.rejects(
        getReviewFlags(latest, {
          minRevenue,
          dropPercent: 30,
        }),
        /Minimum revenue/,
      );
    }
  });

  it("rejects invalid percentage decline thresholds", async () => {
    const { latest } = await getReportingRange();

    for (const dropPercent of [-1, 0, 101, NaN, Infinity]) {
      await assert.rejects(
        getReviewFlags(latest, {
          minRevenue: 5000,
          dropPercent,
        }),
        /Drop percentage/,
      );
    }
  });

  it("rejects invalid reporting dates", async () => {
    await assert.rejects(
      getReviewFlags("invalid-date"),
      /Invalid date/,
    );
  });

  it("rejects non-Monday reporting dates", async () => {
    await assert.rejects(
      getReviewFlags("2026-11-26"),
      /Monday/,
    );
  });
});

describe("Central analytics service", () => {
  it("retrieves complete weekly analytics", async () => {
    const { latest } = await getReportingRange();

    const result = await getWeeklyAnalytics(latest);
    const revenue = await getRevenueSummary(latest);

    assert.equal(result.weekStart, latest);
    assert.equal(result.hasData, true);
    assert.deepEqual(result.revenue, revenue);
    assert.ok(result.movies.length > 0);
  });

  it("calculates total tickets and screenings correctly", async () => {
    const { latest } = await getReportingRange();

    const result = await getWeeklyAnalytics(latest);

    const expectedTickets = result.movies.some(
      row => row.ticketsSold === null,
    )
      ? null
      : result.movies.reduce(
          (sum, row) => sum + (row.ticketsSold ?? 0),
          0,
        );

    const expectedScreenings = result.movies.some(
      row => row.screenings === null,
    )
      ? null
      : result.movies.reduce(
          (sum, row) => sum + (row.screenings ?? 0),
          0,
        );

    assert.equal(
      result.totalTicketsSold,
      expectedTickets,
    );

    assert.equal(
      result.totalScreenings,
      expectedScreenings,
    );
  });

  it("calculates screening status counts correctly", async () => {
    const { latest } = await getReportingRange();

    const { listMovies } = await import(
      "../../rose/repositories/movie.repository.js"
    );

    const movies = await listMovies();
    const result = await getWeeklyAnalytics(latest);

    assert.deepEqual(result.screeningSummary, {
      totalMovies: movies.length,

      activeMovies: movies.filter(
        movie => movie.screeningStatus === "active",
      ).length,

      extendedMovies: movies.filter(
        movie => movie.screeningStatus === "extended",
      ).length,

      endedMovies: movies.filter(
        movie => movie.screeningStatus === "ended",
      ).length,
    });
  });

  it("retrieves all dashboard components", async () => {
    const { earliest, latest } = await getReportingRange();

    const result = await getDashboardAnalytics(
      latest,
      earliest,
      latest,
    );

    assert.ok(result.weeklyAnalytics);
    assert.ok(Array.isArray(result.revenueChart));
    assert.ok(Array.isArray(result.revenueTrend));
    assert.ok(Array.isArray(result.movieComparison));
    assert.ok(Array.isArray(result.reviewFlags));
  });

  it("maintains consistency between weekly revenue and bar charts", async () => {
    const { earliest, latest } = await getReportingRange();

    const result = await getDashboardAnalytics(
      latest,
      earliest,
      latest,
    );

    const chartRevenue =
      result.revenueChart.reduce(
        (sum, row) =>
          sum + Math.round(row.revenue * 100),
        0,
      ) / 100;

    assert.equal(
      chartRevenue,
      result.weeklyAnalytics.revenue.totalRevenue,
    );

    assert.equal(
      result.revenueChart.length,
      result.weeklyAnalytics.movies.length,
    );
  });

  it("maintains consistency between weekly revenue and historical trends", async () => {
    const { earliest, latest } = await getReportingRange();

    const result = await getDashboardAnalytics(
      latest,
      earliest,
      latest,
    );

    const latestTrend = result.revenueTrend.find(
      row => row.weekStart === latest,
    );

    assert.ok(latestTrend);

    assert.equal(
      latestTrend.revenue,
      result.weeklyAnalytics.revenue.totalRevenue,
    );
  });

  it("returns consistent movie comparison data", async () => {
    const { earliest, latest } = await getReportingRange();

    const result = await getDashboardAnalytics(
      latest,
      earliest,
      latest,
    );

    const expected = await getMovieComparison(latest);

    assert.deepEqual(
      result.movieComparison,
      expected,
    );
  });

  it("returns consistent management review flags", async () => {
    const { earliest, latest } = await getReportingRange();

    const result = await getDashboardAnalytics(
      latest,
      earliest,
      latest,
    );

    const expected = await getReviewFlags(latest);

    assert.deepEqual(result.reviewFlags, expected);
  });

  it("supports custom dashboard review thresholds", async () => {
    const { earliest, latest } = await getReportingRange();

    const thresholds = {
      minRevenue: 10000,
      dropPercent: 20,
    };

    const result = await getDashboardAnalytics(
      latest,
      earliest,
      latest,
      thresholds,
    );

    const expected = await getReviewFlags(
      latest,
      thresholds,
    );

    assert.deepEqual(result.reviewFlags, expected);
  });

  it("rejects invalid dashboard reporting dates", async () => {
    const { earliest, latest } = await getReportingRange();

    await assert.rejects(
      getDashboardAnalytics(
        "invalid-date",
        earliest,
        latest,
      ),
      /Invalid date/,
    );
  });

  it("rejects reversed dashboard reporting ranges", async () => {
    const { latest } = await getReportingRange();

    await assert.rejects(
      getDashboardAnalytics(
        latest,
        "2026-11-30",
        "2026-11-23",
      ),
      /Start week cannot be after end week/,
    );
  });

  it("rejects invalid dashboard review thresholds", async () => {
    const { earliest, latest } = await getReportingRange();

    await assert.rejects(
      getDashboardAnalytics(
        latest,
        earliest,
        latest,
        {
          minRevenue: -100,
          dropPercent: 30,
        },
      ),
      /Minimum revenue/,
    );
  });
});

describe("Empty data and edge cases", () => {
  async function getEmptyWeeks() {
    const { latest } = await getReportingRange();

    const { getNextWeek } = await import(
      "../utils/dateUtils.js"
    );

    const nextWeek = getNextWeek(latest);
    const emptyWeek = getNextWeek(nextWeek);

    return { latest, nextWeek, emptyWeek };
  }

  it("returns zero revenue for an empty reporting week", async () => {
    const { emptyWeek } = await getEmptyWeeks();

    const result = await getRevenueSummary(emptyWeek);

    assert.deepEqual(result, {
      totalRevenue: 0,
      previousTotalRevenue: null,
      revenueDifference: null,
      percentChange: null,
      bestMovie: null,
    });
  });

  it("does not report a false decline when current records are missing", async () => {
    const { latest, nextWeek } = await getEmptyWeeks();

    const previous = await getRevenueSummary(latest);
    const result = await getRevenueSummary(nextWeek);

    assert.equal(result.totalRevenue, 0);

    assert.equal(
      result.previousTotalRevenue,
      previous.totalRevenue,
    );

    assert.equal(result.revenueDifference, null);
    assert.equal(result.percentChange, null);
    assert.equal(result.bestMovie, null);
  });

  it("returns an empty movie comparison", async () => {
    const { emptyWeek } = await getEmptyWeeks();

    const result = await getMovieComparison(emptyWeek);

    assert.deepEqual(result, []);
  });

  it("returns an empty cinema revenue trend", async () => {
    const { emptyWeek } = await getEmptyWeeks();

    const result = await getRevenueTrend(
      emptyWeek,
      emptyWeek,
    );

    assert.deepEqual(result, []);
  });

  it("returns empty individual movie trends", async () => {
    const { emptyWeek } = await getEmptyWeeks();

    const result = await getMovieRevenueTrends(
      emptyWeek,
      emptyWeek,
    );

    assert.deepEqual(result, []);
  });

  it("returns no review flags for an empty week", async () => {
    const { emptyWeek } = await getEmptyWeeks();

    const result = await getReviewFlags(emptyWeek);

    assert.deepEqual(result, []);
  });

  it("preserves missing weekly performance metrics", async () => {
    const { emptyWeek } = await getEmptyWeeks();

    const result = await getWeeklyAnalytics(emptyWeek);

    assert.equal(result.hasData, false);
    assert.equal(result.totalTicketsSold, null);
    assert.equal(result.totalScreenings, null);
    assert.deepEqual(result.movies, []);
  });

  it("preserves registered movies during empty reporting weeks", async () => {
    const { emptyWeek } = await getEmptyWeeks();

    const { listMovies } = await import(
      "../../rose/repositories/movie.repository.js"
    );

    const movies = await listMovies();
    const result = await getWeeklyAnalytics(emptyWeek);

    assert.equal(
      result.screeningSummary.totalMovies,
      movies.length,
    );
  });

  it("returns a valid empty dashboard response", async () => {
    const { emptyWeek } = await getEmptyWeeks();

    const result = await getDashboardAnalytics(
      emptyWeek,
      emptyWeek,
      emptyWeek,
    );

    assert.equal(result.weeklyAnalytics.hasData, false);

    assert.equal(
      result.weeklyAnalytics.revenue.totalRevenue,
      0,
    );

    assert.deepEqual(result.revenueChart, []);
    assert.deepEqual(result.revenueTrend, []);
    assert.deepEqual(result.movieComparison, []);
    assert.deepEqual(result.reviewFlags, []);
  });

  it("rejects impossible calendar dates", async () => {
    await assert.rejects(
      getWeeklyAnalytics("2026-02-30"),
      /Invalid date/,
    );
  });

  it("rejects empty reporting dates", async () => {
    await assert.rejects(
      getWeeklyAnalytics(""),
      /Invalid date/,
    );
  });

  it("rejects non-Monday trend boundaries", async () => {
    await assert.rejects(
      getRevenueTrend("2026-11-24", "2026-11-30"),
      /Monday/,
    );
  });
});

describe("Manual data changes through analytics services", () => {
  it("recalculates analytics after inserting, correcting and deleting performance records", async () => {
    const { earliest, latest } = await getReportingRange();

    const {
      addMovie,
      getMovie,
      endScreening,
    } = await import(
      "../../rose/repositories/movie.repository.js"
    );

    const {
      recordRevenue,
      correctRecord,
      deleteRecord,
    } = await import(
      "../../rose/repositories/performance.repository.js"
    );

    const baseline = await getDashboardAnalytics(
      latest,
      earliest,
      latest,
    );

    const originalRevenue =
      baseline.weeklyAnalytics.revenue.totalRevenue;

    const originalMovieCount =
      baseline.weeklyAnalytics.screeningSummary.totalMovies;

    const rollback = new Error("ROLLBACK_SERVICE_TEST");

    let temporaryMovieId: number | undefined;

    await assert.rejects(
      prisma.$transaction(async (tx) => {
        const movie = await addMovie(
          {
            title: `Service Test Movie ${Date.now()}`,
            genre: "Drama",
            releaseDate: latest,
          },
          tx,
        );

        temporaryMovieId = movie.movieId;

        const record = await recordRevenue(
          {
            movieId: movie.movieId,
            weekStart: latest,
            revenue: 3000,
            ticketsSold: 200,
            screenings: 5,
          },
          tx,
        );

        const inserted = await getRevenueSummary(
          latest,
          tx,
        );

        assert.equal(
          Math.round(inserted.totalRevenue * 100),
          Math.round(originalRevenue * 100) + 300000,
        );

        const weekly = await getWeeklyAnalytics(
          latest,
          tx,
        );

        assert.equal(
          weekly.screeningSummary.totalMovies,
          originalMovieCount + 1,
        );

        const comparison = await getMovieComparison(
          latest,
          tx,
        );

        const addedMovie = comparison.find(
          row => row.movieId === movie.movieId,
        );

        assert.ok(addedMovie);
        assert.equal(addedMovie.revenue, 3000);
        assert.equal(addedMovie.previousRevenue, null);
        assert.equal(addedMovie.percentChange, null);

        const trends = await getMovieRevenueTrends(
          earliest,
          latest,
          movie.movieId,
          tx,
        );

        assert.equal(trends.length, 1);

        assert.deepEqual(trends[0].chartPoints, [
          {
            weekStart: latest,
            revenue: 3000,
          },
        ]);

        const flags = await getReviewFlags(
          latest,
          DEFAULT_REVIEW_THRESHOLDS,
          tx,
        );

        assert.equal(
          flags.find(
            flag => flag.movieId === movie.movieId,
          )?.reason,
          "BELOW_MIN_REVENUE",
        );

        console.log(
          "PASS: Manual entry included in all relevant services",
        );

        await correctRecord(
          record.recordId,
          {
            revenue: 15000,
            ticketsSold: 900,
            screenings: 15,
          },
          tx,
        );

        const corrected = await getRevenueSummary(
          latest,
          tx,
        );

        assert.equal(
          Math.round(corrected.totalRevenue * 100),
          Math.round(originalRevenue * 100) + 1500000,
        );

        const correctedFlags = await getReviewFlags(
          latest,
          DEFAULT_REVIEW_THRESHOLDS,
          tx,
        );

        assert.ok(
          !correctedFlags.some(
            flag => flag.movieId === movie.movieId,
          ),
        );

        console.log(
          "PASS: Corrected revenue recalculated and review flag removed",
        );

        await correctRecord(
          record.recordId,
          {
            revenue: 3000,
            ticketsSold: 200,
            screenings: 5,
          },
          tx,
        );

        await endScreening(movie.movieId, tx);

        const endedFlags = await getReviewFlags(
          latest,
          DEFAULT_REVIEW_THRESHOLDS,
          tx,
        );

        assert.ok(
          !endedFlags.some(
            flag => flag.movieId === movie.movieId,
          ),
        );

        const endedTrends = await getMovieRevenueTrends(
          earliest,
          latest,
          movie.movieId,
          tx,
        );

        assert.equal(
          endedTrends[0].chartPoints[0].revenue,
          3000,
        );

        console.log(
          "PASS: Ended movie excluded from review but historical revenue preserved",
        );

        const deleted = await deleteRecord(
          record.recordId,
          tx,
        );

        assert.equal(deleted, true);

        const restored = await getRevenueSummary(
          latest,
          tx,
        );

        assert.equal(
          restored.totalRevenue,
          originalRevenue,
        );

        const finalComparison = await getMovieComparison(
          latest,
          tx,
        );

        assert.ok(
          !finalComparison.some(
            row => row.movieId === movie.movieId,
          ),
        );

        console.log(
          "PASS: Deleted performance removed from analytics",
        );

        throw rollback;
      }),
      (error: unknown) => error === rollback,
    );

    assert.ok(temporaryMovieId !== undefined);

    assert.equal(
      await getMovie(temporaryMovieId),
      null,
    );

    const finalDashboard = await getDashboardAnalytics(
      latest,
      earliest,
      latest,
    );

    assert.deepEqual(finalDashboard, baseline);

    console.log("PASS: Transaction rolled back");
    console.log("PASS: Original dashboard data preserved");
  });
});