import { prisma } from "../../rose/prismaClient.js";

import type { Db } from "../../rose/dbUtils.js";

import {
  weeklyReport,
} from "../../rose/repositories/performance.repository.js";

import type {
  MovieComparison,
} from "../types/analytics.types.js";

import {
  validateWeekStart,
} from "../utils/dateUtils.js";

import {
  processMovieComparison,
} from "../processors/revenue.processor.js";

/**
 * Retrieves and compares individual movie performance
 * for the selected reporting week.
 */
export async function getMovieComparison(
  weekStart: string,
  db: Db = prisma,
): Promise<MovieComparison[]> {
  validateWeekStart(weekStart);

  const rows = await weeklyReport(
    { weekStart },
    db,
  );

  return processMovieComparison(rows);
}