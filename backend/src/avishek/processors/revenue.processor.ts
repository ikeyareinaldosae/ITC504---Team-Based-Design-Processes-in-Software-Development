
// Revenue data processor.
// Processes current database records without modifying them.

import type {
  WeeklyReportRow,
} from "../../rose/repositories/performance.repository.js";

import type {
  RevenueSummary,
  MovieComparison,
} from "../types/analytics.types.js";

import {
  sumRevenue,
  calculateDifference,
  calculatePercentageChange,
  calculateRevenueShare,
} from "../utils/calculations.js";

export function processRevenueSummary(
  currentRows: readonly WeeklyReportRow[],
  previousRows: readonly WeeklyReportRow[],
): RevenueSummary {
  const totalRevenue = sumRevenue(
    currentRows.map((row) => row.revenue),
  );

  const previousTotalRevenue =
    previousRows.length > 0
      ? sumRevenue(previousRows.map((row) => row.revenue))
      : null;

  const bestMovie =
    [...currentRows].sort(
      (a, b) =>
        b.revenue - a.revenue ||
        a.movieId - b.movieId,
    )[0]?.title ?? null;

  const hasCurrentData = currentRows.length > 0;

  return {
    totalRevenue,
    previousTotalRevenue,
    revenueDifference: hasCurrentData
      ? calculateDifference(
          totalRevenue,
          previousTotalRevenue,
        )
      : null,
    percentChange: hasCurrentData
      ? calculatePercentageChange(
          totalRevenue,
          previousTotalRevenue,
        )
      : null,
    bestMovie,
  };
}

export function processMovieComparison(
  rows: readonly WeeklyReportRow[],
): MovieComparison[] {
  const totalRevenue = sumRevenue(
    rows.map((row) => row.revenue),
  );

  return rows
    .map((row): MovieComparison => ({
      movieId: row.movieId,
      title: row.title,
      revenue: row.revenue,
      previousRevenue: row.previousRevenue,
      difference: calculateDifference(
        row.revenue,
        row.previousRevenue,
      ),
      percentChange: calculatePercentageChange(
        row.revenue,
        row.previousRevenue,
      ),
      revenueShare: calculateRevenueShare(
        row.revenue,
        totalRevenue,
      ),
      screeningStatus: row.screeningStatus,
    }))
    .sort(
      (a, b) =>
        b.revenue - a.revenue ||
        a.movieId - b.movieId,
    );
}
