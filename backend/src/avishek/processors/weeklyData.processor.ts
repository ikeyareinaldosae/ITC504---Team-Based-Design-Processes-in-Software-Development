
// Weekly performance data processor.
// Aggregates current database records into weekly analytics.

import type {
  MovieRow,
} from "../../rose/repositories/movie.repository.js";

import type {
  WeeklyReportRow,
} from "../../rose/repositories/performance.repository.js";

import type {
  ScreeningSummary,
  WeeklyAnalytics,
} from "../types/analytics.types.js";

import {
  sumNullableCounts,
} from "../utils/calculations.js";

import {
  validateWeekStart,
} from "../utils/dateUtils.js";

import {
  processRevenueSummary,
} from "./revenue.processor.js";

export function processScreeningSummary(
  movies: readonly MovieRow[],
): ScreeningSummary {
  const summary: ScreeningSummary = {
    totalMovies: movies.length,
    activeMovies: 0,
    extendedMovies: 0,
    endedMovies: 0,
  };

  for (const movie of movies) {
    switch (movie.screeningStatus) {
      case "active":
        summary.activeMovies++;
        break;

      case "extended":
        summary.extendedMovies++;
        break;

      case "ended":
        summary.endedMovies++;
        break;
    }
  }

  return summary;
}

export function processWeeklyAnalytics(
  weekStart: string,
  currentRows: readonly WeeklyReportRow[],
  previousRows: readonly WeeklyReportRow[],
  movies: readonly MovieRow[],
): WeeklyAnalytics {
  validateWeekStart(weekStart);

  return {
    weekStart,

    hasData: currentRows.length > 0,

    revenue: processRevenueSummary(
      currentRows,
      previousRows,
    ),

    totalTicketsSold: sumNullableCounts(
      currentRows.map((row) => row.ticketsSold),
    ),

    totalScreenings: sumNullableCounts(
      currentRows.map((row) => row.screenings),
    ),

    screeningSummary: processScreeningSummary(movies),

    movies: [...currentRows].sort(
      (a, b) =>
        b.revenue - a.revenue ||
        a.movieId - b.movieId,
    ),
  };
}
