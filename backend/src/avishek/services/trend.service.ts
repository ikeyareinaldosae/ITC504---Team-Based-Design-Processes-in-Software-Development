import { prisma } from "../../rose/prismaClient.js";

import type { Db } from "../../rose/dbUtils.js";

import {
  revenueTrend,
} from "../../rose/repositories/performance.repository.js";

import type {
  RevenueTrendPoint,
  MovieRevenueTrend,
} from "../types/analytics.types.js";

import {
  validateWeekRange,
} from "../utils/dateUtils.js";

import {
  processRevenueTrend,
  processMovieRevenueTrends,
} from "../processors/chartData.processor.js";

/**
 * Retrieves total cinema revenue for each reporting week
 * within the selected date range.
 */
export async function getRevenueTrend(
  fromWeek: string,
  toWeek: string,
  db: Db = prisma,
): Promise<RevenueTrendPoint[]> {
  validateWeekRange(fromWeek, toWeek);

  const rows = await revenueTrend(
    fromWeek,
    toWeek,
    db,
  );

  return processRevenueTrend(rows);
}

/**
 * Retrieves historical revenue trends for all movies
 * or an individual movie within the selected date range.
 */
export async function getMovieRevenueTrends(
  fromWeek: string,
  toWeek: string,
  movieId?: number,
  db: Db = prisma,
): Promise<MovieRevenueTrend[]> {
  validateWeekRange(fromWeek, toWeek);

  if (
    movieId !== undefined &&
    (!Number.isSafeInteger(movieId) || movieId <= 0)
  ) {
    throw new Error("Invalid movie ID.");
  }

  const rows = await revenueTrend(
    fromWeek,
    toWeek,
    db,
  );

  const filteredRows =
    movieId === undefined
      ? rows
      : rows.filter((row) => row.movieId === movieId);

  return processMovieRevenueTrends(filteredRows);
}