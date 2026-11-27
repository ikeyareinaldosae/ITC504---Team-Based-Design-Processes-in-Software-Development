// Validation for weekly performance records. Owner: Chandani Gupta.
import type { Request } from "express";
import { bodyId, mondayDate, money, objectBody, optionalCount, textId } from "./common.js";

export type CreatePerformanceInput = {
  movieId: number;
  weekStart: string;
  revenue: number;
  ticketsSold: number | null;
  screenings: number | null;
};

export type UpdatePerformanceInput = {
  recordId: number;
  revenue: number;
  ticketsSold: number | null;
  screenings: number | null;
};

export type RecordIdInput = { recordId: number };

/** POST /performance */
export function createPerformanceBody(req: Request): CreatePerformanceInput {
  const body = objectBody(req.body);
  return {
    movieId: bodyId(body.movieId, "movieId"),
    weekStart: mondayDate(body.weekStart, "weekStart"),
    revenue: money(body.revenue, "revenue"),
    ticketsSold: optionalCount(body.ticketsSold, "ticketsSold"),
    screenings: optionalCount(body.screenings, "screenings"),
  };
}

/** PUT /performance/{recordId}: only revenue, ticketsSold and screenings can change. */
export function updatePerformanceRequest(req: Request): UpdatePerformanceInput {
  const body = objectBody(req.body);
  return {
    recordId: textId(req.params.recordId, "recordId"),
    revenue: money(body.revenue, "revenue"),
    ticketsSold: optionalCount(body.ticketsSold, "ticketsSold"),
    screenings: optionalCount(body.screenings, "screenings"),
  };
}

/** DELETE /performance/{recordId} */
export function recordIdParam(req: Request): RecordIdInput {
  return { recordId: textId(req.params.recordId, "recordId") };
}
