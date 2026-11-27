import { prisma } from "../../rose/prismaClient.js";

import type { Db } from "../../rose/dbUtils.js";

import {
  reviewFlags,
  type ReviewFlag,
} from "../../rose/repositories/performance.repository.js";

import type {
  ReviewThresholds,
} from "../types/analytics.types.js";

import {
  validateWeekStart,
} from "../utils/dateUtils.js";

export const DEFAULT_REVIEW_THRESHOLDS: Readonly<ReviewThresholds> =
  Object.freeze({
    minRevenue: 5000,
    dropPercent: 30,
  });

/**
 * Validates management review thresholds.
 */
export function validateReviewThresholds(
  thresholds: ReviewThresholds,
): void {
  if (
    !Number.isFinite(thresholds.minRevenue) ||
    thresholds.minRevenue < 0
  ) {
    throw new Error(
      "Minimum revenue must be a non-negative number.",
    );
  }

  if (
    !Number.isFinite(thresholds.dropPercent) ||
    thresholds.dropPercent <= 0 ||
    thresholds.dropPercent > 100
  ) {
    throw new Error(
      "Drop percentage must be greater than 0 and at most 100.",
    );
  }
}

/**
 * Retrieves movies requiring management review
 * for the selected reporting week.
 */
export async function getReviewFlags(
  weekStart: string,
  thresholds: ReviewThresholds = DEFAULT_REVIEW_THRESHOLDS,
  db: Db = prisma,
): Promise<ReviewFlag[]> {
  validateWeekStart(weekStart);
  validateReviewThresholds(thresholds);

  return reviewFlags(
    weekStart,
    thresholds.minRevenue,
    thresholds.dropPercent,
    db,
  );
}