
// Chart data processor.
// Transforms database records into chart-ready analytics.

import type {
  WeeklyReportRow,
} from "../../rose/repositories/performance.repository.js";

import type {
  RevenueChartData,
  RevenueTrendPoint,
  MovieRevenueTrend,
} from "../types/analytics.types.js";

import {
  sumRevenue,
} from "../utils/calculations.js";

export interface RevenueTrendRow {
  movieId: number;
  title: string;
  weekStart: string;
  revenue: number;
}

// Prepare weekly movie revenue for the bar chart.

export function processRevenueChart(
  rows: readonly WeeklyReportRow[],
): RevenueChartData[] {
  return rows
    .map((row) => ({
      movieId: row.movieId,
      title: row.title,
      revenue: row.revenue,
      previousRevenue: row.previousRevenue,
    }))
    .sort(
      (a, b) =>
        b.revenue - a.revenue ||
        a.movieId - b.movieId,
    );
}

// Aggregate total cinema revenue for each recorded week.

export function processRevenueTrend(
  rows: readonly RevenueTrendRow[],
): RevenueTrendPoint[] {
  const weeklyRevenue = new Map<string, number[]>();

  for (const row of rows) {
    const revenues = weeklyRevenue.get(row.weekStart) ?? [];

    revenues.push(row.revenue);

    weeklyRevenue.set(row.weekStart, revenues);
  }

  return Array.from(
    weeklyRevenue,
    ([weekStart, revenues]) => ({
      weekStart,
      revenue: sumRevenue(revenues),
    }),
  ).sort(
    (a, b) => a.weekStart.localeCompare(b.weekStart),
  );
}

// Group historical revenue by individual movie.

export function processMovieRevenueTrends(
  rows: readonly RevenueTrendRow[],
): MovieRevenueTrend[] {
  const movies = new Map<number, MovieRevenueTrend>();

  for (const row of rows) {
    let movie = movies.get(row.movieId);

    if (!movie) {
      movie = {
        movieId: row.movieId,
        title: row.title,
        chartPoints: [],
      };

      movies.set(row.movieId, movie);
    }

    movie.chartPoints.push({
      weekStart: row.weekStart,
      revenue: row.revenue,
    });
  }

  return Array.from(movies.values())
    .map((movie) => ({
      ...movie,
      chartPoints: movie.chartPoints.sort(
        (a, b) =>
          a.weekStart.localeCompare(b.weekStart),
      ),
    }))
    .sort(
      (a, b) =>
        a.title.localeCompare(b.title) ||
        a.movieId - b.movieId,
    );
}
