import { test } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "../../rose/prismaClient.js";

import {
  addMovie,
  listMovies,
  getMovie,
} from "../../rose/repositories/movie.repository.js";

import {
  listWeeks,
  weeklyReport,
  recordRevenue,
  correctRecord,
  deleteRecord,
  revenueTrend,
} from "../../rose/repositories/performance.repository.js";

import type { Db } from "../../rose/dbUtils.js";

import {
  processWeeklyAnalytics,
} from "../processors/weeklyData.processor.js";

import {
  processRevenueChart,
  processRevenueTrend,
} from "../processors/chartData.processor.js";

import {
  processMovieComparison,
} from "../processors/revenue.processor.js";

import {
  getPreviousWeek,
} from "../utils/dateUtils.js";

async function getAnalytics(weekStart: string, db: Db) {
  const current = await weeklyReport({ weekStart }, db);

  const previous = await weeklyReport(
    { weekStart: getPreviousWeek(weekStart) },
    db,
  );

  const movies = await listMovies(db);

  return processWeeklyAnalytics(
    weekStart,
    current,
    previous,
    movies,
  );
}

test("Live manual entry and analytics recalculation", async () => {
  const rollback = new Error("INTENTIONAL_TEST_ROLLBACK");

  let temporaryMovieId: number | undefined;

  try {
    const weeks = await listWeeks();

    assert.ok(weeks.length > 0);

    const weekStart = weeks[0].weekStart;

    const baseline = await getAnalytics(weekStart, prisma);

    const originalRevenue = baseline.revenue.totalRevenue;
    const originalTickets = baseline.totalTicketsSold;
    const originalScreenings = baseline.totalScreenings;

    assert.ok(originalTickets !== null);
    assert.ok(originalScreenings !== null);

    console.log("BASELINE:", {
      revenue: originalRevenue,
      tickets: originalTickets,
      screenings: originalScreenings,
      movies: baseline.screeningSummary.totalMovies,
    });

    await assert.rejects(
      prisma.$transaction(async (tx) => {
        // 1. Register a temporary movie.

        const movie = await addMovie(
          {
            title: `Analytics Test Movie ${Date.now()}`,
            genre: "Drama",
            releaseDate: weekStart,
          },
          tx,
        );

        temporaryMovieId = movie.movieId;

        console.log("PASS: New movie registered");

        // 2. Manually enter weekly performance.

        const record = await recordRevenue(
          {
            movieId: movie.movieId,
            weekStart,
            revenue: 10000,
            ticketsSold: 600,
            screenings: 10,
          },
          tx,
        );

        const inserted = await getAnalytics(weekStart, tx);

        assert.equal(
          inserted.revenue.totalRevenue,
          originalRevenue + 10000,
        );

        assert.equal(
          inserted.totalTicketsSold,
          originalTickets + 600,
        );

        assert.equal(
          inserted.totalScreenings,
          originalScreenings + 10,
        );

        assert.equal(
          inserted.screeningSummary.totalMovies,
          baseline.screeningSummary.totalMovies + 1,
        );

        console.log("PASS: Manual entry included in analytics");

        console.log("AFTER INSERT:", {
          revenue: inserted.revenue.totalRevenue,
          tickets: inserted.totalTicketsSold,
          screenings: inserted.totalScreenings,
          movies: inserted.screeningSummary.totalMovies,
        });

        // 3. Verify charts and movie comparisons.

        const chart = processRevenueChart(inserted.movies);

        assert.equal(
          chart.find((row) => row.movieId === movie.movieId)
            ?.revenue,
          10000,
        );

        const comparison = processMovieComparison(
          inserted.movies,
        );

        const newMovie = comparison.find(
          (row) => row.movieId === movie.movieId,
        );

        assert.ok(newMovie);
        assert.equal(newMovie.revenue, 10000);
        assert.equal(newMovie.previousRevenue, null);
        assert.equal(newMovie.percentChange, null);

        const trend = processRevenueTrend(
          await revenueTrend(weekStart, weekStart, tx),
        );

        assert.equal(
          trend[0].revenue,
          originalRevenue + 10000,
        );

        console.log("PASS: Charts and comparisons updated");

        // 4. Correct the manually entered performance.

        const correctedRecord = await correctRecord(
          record.recordId,
          {
            revenue: 15000,
            ticketsSold: 900,
            screenings: 15,
          },
          tx,
        );

        assert.ok(correctedRecord);

        const corrected = await getAnalytics(weekStart, tx);

        assert.equal(
          corrected.revenue.totalRevenue,
          originalRevenue + 15000,
        );

        assert.equal(
          corrected.totalTicketsSold,
          originalTickets + 900,
        );

        assert.equal(
          corrected.totalScreenings,
          originalScreenings + 15,
        );

        console.log("PASS: Corrected entry recalculated");

        console.log("AFTER CORRECTION:", {
          revenue: corrected.revenue.totalRevenue,
          tickets: corrected.totalTicketsSold,
          screenings: corrected.totalScreenings,
        });

        // 5. Delete the temporary performance record.

        const deleted = await deleteRecord(
          record.recordId,
          tx,
        );

        assert.equal(deleted, true);

        const afterDeletion = await getAnalytics(
          weekStart,
          tx,
        );

        assert.equal(
          afterDeletion.revenue.totalRevenue,
          originalRevenue,
        );

        assert.equal(
          afterDeletion.totalTicketsSold,
          originalTickets,
        );

        assert.equal(
          afterDeletion.totalScreenings,
          originalScreenings,
        );

        assert.equal(
          afterDeletion.movies.some(
            (row) => row.movieId === movie.movieId,
          ),
          false,
        );

        console.log("PASS: Deleted entry removed from analytics");

        // 6. Roll back all temporary database changes.

        throw rollback;
      }),
      (error: unknown) => error === rollback,
    );

    // 7. Verify original database state.

    assert.ok(temporaryMovieId !== undefined);

    assert.equal(
      await getMovie(temporaryMovieId),
      null,
    );

    const restored = await getAnalytics(weekStart, prisma);

    assert.deepEqual(restored, baseline);

    console.log("PASS: Transaction rolled back");
    console.log("PASS: Original database records preserved");

    console.log("FINAL DATABASE STATE:", {
      revenue: restored.revenue.totalRevenue,
      tickets: restored.totalTicketsSold,
      screenings: restored.totalScreenings,
      movies: restored.screeningSummary.totalMovies,
    });
  } finally {
    await prisma.$disconnect();
  }
});