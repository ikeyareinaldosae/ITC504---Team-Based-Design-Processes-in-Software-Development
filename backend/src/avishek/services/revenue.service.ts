import { prisma } from "../../rose/prismaClient.js";

import type { Db } from "../../rose/dbUtils.js";

import {
  weeklyReport,
} from "../../rose/repositories/performance.repository.js";

import type {
  RevenueSummary,
} from "../types/analytics.types.js";

import {
  validateWeekStart,
  getPreviousWeek,
} from "../utils/dateUtils.js";

import {
  processRevenueSummary,
} from "../processors/revenue.processor.js";

/**
 * Retrieves and calculates the cinema's weekly revenue summary.
 * All calculations use the latest available database records.
 */
export async function getRevenueSummary(
  weekStart: string,
  db: Db = prisma,
): Promise<RevenueSummary> {
  validateWeekStart(weekStart);

  const previousWeek = getPreviousWeek(weekStart);

  const [currentRows, previousRows] = await Promise.all([
    weeklyReport({ weekStart }, db),
    weeklyReport({ weekStart: previousWeek }, db),
  ]);

  return processRevenueSummary(
    currentRows,
    previousRows,
  );
}