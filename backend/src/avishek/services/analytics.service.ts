import { prisma } from "../../rose/prismaClient.js";

import type { Db } from "../../rose/dbUtils.js";

import {
  listMovies,
} from "../../rose/repositories/movie.repository.js";

import {
  weeklyReport,
  revenueTrend,
} from "../../rose/repositories/performance.repository.js";

import type {
  WeeklyAnalytics,
  AnalyticsDashboardData,
  ReviewThresholds,
} from "../types/analytics.types.js";

import {
  validateWeekStart,
  validateWeekRange,
  getPreviousWeek,
} from "../utils/dateUtils.js";

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
  getReviewFlags,
  validateReviewThresholds,
  DEFAULT_REVIEW_THRESHOLDS,
} from "./reviewFlags.service.js";

/**
 * Retrieves complete weekly cinema performance analytics.
 */
export async function getWeeklyAnalytics(
  weekStart: string,
  db: Db = prisma,
): Promise<WeeklyAnalytics> {
  validateWeekStart(weekStart);

  const previousWeek = getPreviousWeek(weekStart);

  const [currentRows, previousRows, movies] =
    await Promise.all([
      weeklyReport({ weekStart }, db),
      weeklyReport({ weekStart: previousWeek }, db),
      listMovies(db),
    ]);

  return processWeeklyAnalytics(
    weekStart,
    currentRows,
    previousRows,
    movies,
  );
}

/**
 * Retrieves all analytics required by the dashboard
 * using a consistent database snapshot.
 */
export async function getDashboardAnalytics(
  weekStart: string,
  fromWeek: string,
  toWeek: string,
  thresholds: ReviewThresholds = DEFAULT_REVIEW_THRESHOLDS,
): Promise<AnalyticsDashboardData> {
  validateWeekStart(weekStart);
  validateWeekRange(fromWeek, toWeek);
  validateReviewThresholds(thresholds);

  return prisma.$transaction(
    async (tx) => {
      const weeklyAnalytics = await getWeeklyAnalytics(
        weekStart,
        tx,
      );

      const trendRows = await revenueTrend(
        fromWeek,
        toWeek,
        tx,
      );

      const flags = await getReviewFlags(
        weekStart,
        thresholds,
        tx,
      );

      return {
        weeklyAnalytics,

        revenueChart: processRevenueChart(
          weeklyAnalytics.movies,
        ),

        revenueTrend: processRevenueTrend(
          trendRows,
        ),

        movieComparison: processMovieComparison(
          weeklyAnalytics.movies,
        ),

        reviewFlags: flags,
      };
    },
    {
      isolationLevel: "RepeatableRead",
    },
  );
}