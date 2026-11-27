// Validation for report and management query strings. Owner: Chandani Gupta.
import type { Request } from "express";
import { mondayDate, optionalQueryNumber, textId } from "./common.js";

export type WeekInput = { weekStart: string };
export type TrendInput = { movieId?: number };
export type ReviewFlagsInput = { weekStart: string; minRevenue?: number; dropPercent?: number };

/** GET /reports/weekly?weekStart=YYYY-MM-DD */
export function weekQuery(req: Request): WeekInput {
  return { weekStart: mondayDate(req.query.weekStart, "weekStart") };
}

/** GET /reports/charts/revenue-trend?movieId=N (movieId is optional) */
export function trendQuery(req: Request): TrendInput {
  const raw = req.query.movieId;
  return raw === undefined ? {} : { movieId: textId(raw, "movieId") };
}

/** GET /management/review-flags?weekStart=...&minRevenue=...&dropPercent=... */
export function reviewFlagsQuery(req: Request): ReviewFlagsInput {
  return {
    weekStart: mondayDate(req.query.weekStart, "weekStart"),
    minRevenue: optionalQueryNumber(req.query.minRevenue, "minRevenue", { min: 0 }),
    // Avishek's review service requires a drop above 0 and at most 100 percent.
    dropPercent: optionalQueryNumber(req.query.dropPercent, "dropPercent", { above: 0, max: 100 }),
  };
}
