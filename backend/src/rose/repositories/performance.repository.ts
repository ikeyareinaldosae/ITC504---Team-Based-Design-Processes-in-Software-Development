// Weekly record and report queries (Q4 to Q11). Owner: Rose Budha.
// One function per API operation. Every function takes an optional database client, so the
// API can pass a transaction and the tests can roll their changes back.
import { Prisma } from "@prisma/client";
import { prisma } from "../prismaClient.js";
import { day, num, type Db } from "../dbUtils.js";

export type PerformanceRow = {
  recordId: number;
  movieId: number;
  weekStart: string;
  isoWeek: string;
  revenue: number;
  ticketsSold: number | null;
  screenings: number | null;
};
type RawPerformance = Omit<PerformanceRow, "weekStart" | "revenue"> & { weekStart: Date; revenue: unknown };
const toPerformance = (r: RawPerformance): PerformanceRow => ({ ...r, weekStart: day(r.weekStart)!, revenue: Number(r.revenue) });
const PERFORMANCE_COLUMNS = Prisma.sql`"recordId", "movieId", "weekStart", "isoWeek", "revenue", "ticketsSold", "screenings"`;

// Q4 Record weekly revenue (POST /performance). A repeated movie and week throws a unique error (409).
// ticketsSold and screenings are optional. weekStart must be a Monday ("YYYY-MM-DD").
export async function recordRevenue(
  input: { movieId: number; weekStart: string; revenue: number; ticketsSold?: number | null; screenings?: number | null },
  db: Db = prisma,
): Promise<PerformanceRow> {
  const rows = await db.$queryRaw<RawPerformance[]>`
    INSERT INTO performance ("movieId", "weekStart", "revenue", "ticketsSold", "screenings")
    VALUES (${input.movieId}, ${input.weekStart}::date, ${String(input.revenue)}::numeric,
            ${input.ticketsSold ?? null}, ${input.screenings ?? null})
    RETURNING ${PERFORMANCE_COLUMNS}`;
  return toPerformance(rows[0]);
}

// Q5 Correct a record (PUT /performance/{recordId}). Returns null when there is no such record (404).
export async function correctRecord(
  recordId: number,
  input: { revenue: number; ticketsSold?: number | null; screenings?: number | null },
  db: Db = prisma,
): Promise<PerformanceRow | null> {
  const rows = await db.$queryRaw<RawPerformance[]>`
    UPDATE performance
    SET "revenue" = ${String(input.revenue)}::numeric, "ticketsSold" = ${input.ticketsSold ?? null}, "screenings" = ${input.screenings ?? null}
    WHERE "recordId" = ${recordId}
    RETURNING ${PERFORMANCE_COLUMNS}`;
  return rows[0] ? toPerformance(rows[0]) : null;
}

// Q6 Delete a record (DELETE /performance/{recordId}). Returns false when there is no such record (404).
export async function deleteRecord(recordId: number, db: Db = prisma): Promise<boolean> {
  const n = await db.$executeRaw`DELETE FROM performance WHERE "recordId" = ${recordId}`;
  return n > 0;
}

// Q7 Weeks that have data, newest first (GET /reports/weeks)
export async function listWeeks(db: Db = prisma): Promise<{ weekStart: string; isoWeek: string }[]> {
  const rows = await db.$queryRaw<{ weekStart: Date; isoWeek: string }[]>`
    SELECT DISTINCT "weekStart", "isoWeek" FROM performance ORDER BY "weekStart" DESC`;
  return rows.map((r) => ({ weekStart: day(r.weekStart)!, isoWeek: r.isoWeek }));
}

export type WeeklyReportRow = {
  movieId: number;
  title: string;
  revenue: number;
  previousRevenue: number | null;
  difference: number | null;
  percentChange: number | null;
  ticketsSold: number | null;
  screenings: number | null;
  screeningStatus: "active" | "extended" | "ended";
};

// Q8 Weekly report (GET /reports/weekly). Pass weekStart ("YYYY-MM-DD") or an isoWeek label such as
// "2026-W40". A week with no data returns an empty list, not an error.
export async function weeklyReport(
  by: { weekStart: string } | { isoWeek: string },
  db: Db = prisma,
): Promise<WeeklyReportRow[]> {
  const where = "weekStart" in by ? Prisma.sql`"weekStart" = ${by.weekStart}::date` : Prisma.sql`"isoWeek" = ${by.isoWeek}`;
  const rows = await db.$queryRaw<Record<string, unknown>[]>`
    SELECT "movieId", "title", "revenue", "previousRevenue", "difference", "percentChange",
           "ticketsSold", "screenings", "screeningStatus"::text AS "screeningStatus"
    FROM v_weekly_report WHERE ${where} ORDER BY "revenue" DESC`;
  return rows.map((r) => ({
    movieId: r.movieId as number,
    title: r.title as string,
    revenue: Number(r.revenue),
    previousRevenue: num(r.previousRevenue),
    difference: num(r.difference),
    percentChange: num(r.percentChange),
    ticketsSold: r.ticketsSold as number | null,
    screenings: r.screenings as number | null,
    screeningStatus: r.screeningStatus as WeeklyReportRow["screeningStatus"],
  }));
}

// Q9 Weekly summary: total revenue and the best movie (GET /reports/weekly)
export async function weeklySummary(
  weekStart: string,
  db: Db = prisma,
): Promise<{ totalRevenue: number | null; bestMovie: string | null }> {
  const rows = await db.$queryRaw<{ totalRevenue: unknown; bestMovie: string | null }[]>`
    SELECT (SELECT sum("revenue") FROM performance WHERE "weekStart" = ${weekStart}::date) AS "totalRevenue",
           (SELECT "title" FROM v_weekly_report WHERE "weekStart" = ${weekStart}::date ORDER BY "revenue" DESC LIMIT 1) AS "bestMovie"`;
  return { totalRevenue: num(rows[0].totalRevenue), bestMovie: rows[0].bestMovie };
}

// Q10 Revenue trend between two weeks, inclusive (GET /reports/charts/revenue-trend)
export async function revenueTrend(
  fromWeek: string,
  toWeek: string,
  db: Db = prisma,
): Promise<{ movieId: number; title: string; weekStart: string; revenue: number }[]> {
  const rows = await db.$queryRaw<{ movieId: number; title: string; weekStart: Date; revenue: unknown }[]>`
    SELECT m."movieId", m."title", p."weekStart", p."revenue"
    FROM performance p JOIN movies m ON m."movieId" = p."movieId"
    WHERE p."weekStart" BETWEEN ${fromWeek}::date AND ${toWeek}::date
    ORDER BY lower(m."title"), p."weekStart"`;
  return rows.map((r) => ({ ...r, weekStart: day(r.weekStart)!, revenue: Number(r.revenue) }));
}

export type ReviewFlag = {
  movieId: number;
  title: string;
  revenue: number;
  previousRevenue: number | null;
  percentChange: number | null;
  reason: "BELOW_MIN_REVENUE" | "SHARP_DROP";
};

// Q11 Review flags for a week, with the thresholds passed in by the API (GET /management/review-flags)
export async function reviewFlags(
  weekStart: string,
  minRevenue: number,
  dropPercent: number,
  db: Db = prisma,
): Promise<ReviewFlag[]> {
  const rows = await db.$queryRaw<Record<string, unknown>[]>`
    SELECT "movieId", "title", "revenue", "previousRevenue", "percentChange",
           CASE WHEN "revenue" < ${String(minRevenue)}::numeric THEN 'BELOW_MIN_REVENUE' ELSE 'SHARP_DROP' END AS "reason"
    FROM v_weekly_report
    WHERE "weekStart" = ${weekStart}::date AND "screeningStatus" <> 'ended'
      AND ("revenue" < ${String(minRevenue)}::numeric OR "percentChange" <= -${String(dropPercent)}::numeric)
    ORDER BY lower("title")`;
  return rows.map((r) => ({
    movieId: r.movieId as number,
    title: r.title as string,
    revenue: Number(r.revenue),
    previousRevenue: num(r.previousRevenue),
    percentChange: num(r.percentChange),
    reason: r.reason as ReviewFlag["reason"],
  }));
}
