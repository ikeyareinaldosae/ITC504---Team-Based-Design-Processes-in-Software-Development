// Report endpoints. Owner: Chandani Gupta.
// Weekly figures come from Rose's report queries; chart trend data comes from Avishek's trend service.
import type { Request, Response } from "express";
import { getMovieRevenueTrends } from "../../avishek/services/trend.service.js";
import { listWeeks, weeklyReport, weeklySummary } from "../../rose/repositories/performance.repository.js";
import type { TrendInput, WeekInput } from "../validators/report.validator.js";

/** GET /reports/weeks: Monday dates that hold data, newest first. */
export async function listReportWeeks(_req: Request, res: Response) {
  const weeks = await listWeeks();
  res.json(weeks.map((w) => w.weekStart));
}

/** GET /reports/weekly?weekStart=: one row per movie plus the week's total. An empty week gives total 0. */
export async function getWeeklyReport(_req: Request, res: Response) {
  const { weekStart } = res.locals.input as WeekInput;
  const [movies, summary] = await Promise.all([weeklyReport({ weekStart }), weeklySummary(weekStart)]);
  res.json({
    weekStart,
    totalRevenue: summary.totalRevenue ?? 0,
    bestMovie: summary.bestMovie,
    movies,
  });
}

/** GET /reports/charts/revenue-trend?movieId=: weekly revenue per movie across every week that holds data. */
export async function getRevenueTrend(_req: Request, res: Response) {
  const { movieId } = res.locals.input as TrendInput;
  const weeks = await listWeeks(); // newest first
  if (weeks.length === 0) {
    res.json([]);
    return;
  }
  const fromWeek = weeks[weeks.length - 1].weekStart;
  const toWeek = weeks[0].weekStart;
  res.json(await getMovieRevenueTrends(fromWeek, toWeek, movieId));
}
