// Standard error handling for the REST API. Owner: Chandani Gupta.
// Every error leaves the API as { code, message } with the status code set in openapi.yaml.
import type { ErrorRequestHandler, RequestHandler } from "express";
import { httpStatusForDbError } from "../../rose/dbUtils.js";

export type ErrorCode = "BAD_REQUEST" | "UNAUTHORIZED" | "NOT_FOUND" | "CONFLICT" | "SERVER_ERROR";

const CODE_FOR_STATUS: Record<number, ErrorCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  404: "NOT_FOUND",
  409: "CONFLICT",
  500: "SERVER_ERROR",
};

/** An error the API means to send, for example new ApiError(404, "Movie 9 was not found."). */
export class ApiError extends Error {
  readonly status: 400 | 401 | 404 | 409 | 500;
  readonly code: ErrorCode;

  constructor(status: 400 | 401 | 404 | 409 | 500, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = CODE_FOR_STATUS[status];
  }
}

export const badRequest = (message: string) => new ApiError(400, message);
export const notFound = (message: string) => new ApiError(404, message);
export const conflict = (message: string) => new ApiError(409, message);

/** Messages for database errors, so the user never sees SQL or table names. */
const DB_MESSAGES: Record<400 | 404 | 409, string> = {
  400: "The request breaks a data rule (check the date, the amount and the required fields).",
  404: "The movie referred to does not exist.",
  409: "This record already exists.",
};

/** Status for a database error. Uses Rose's mapping, then the PostgreSQL code inside a driver-adapter error. */
export function statusForDbError(err: unknown): 400 | 404 | 409 | 500 {
  const status = httpStatusForDbError(err);
  if (status !== 500) return status;
  const pgCode = (err as { meta?: { driverAdapterError?: { cause?: { originalCode?: string } } } })?.meta
    ?.driverAdapterError?.cause?.originalCode;
  if (pgCode === "23505") return 409;
  if (pgCode === "23503") return 404;
  if (pgCode === "23514" || pgCode === "22007" || pgCode === "22008" || pgCode === "22P02") return 400;
  return 500;
}

/** Sends 404 for any path the API does not have. Registered after all routes. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(notFound(`No endpoint for ${req.method} ${req.originalUrl}.`));
};

/** The last middleware: turns any error into { code, message }. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }

  // Body that is not valid JSON, or is too large (from express.json()).
  const type = (err as { type?: string })?.type;
  if (type === "entity.parse.failed") {
    res.status(400).json({ code: "BAD_REQUEST", message: "The request body is not valid JSON." });
    return;
  }
  if (type === "entity.too.large") {
    res.status(400).json({ code: "BAD_REQUEST", message: "The request body is too large." });
    return;
  }

  const dbStatus = statusForDbError(err);
  if (dbStatus !== 500) {
    res.status(dbStatus).json({ code: CODE_FOR_STATUS[dbStatus], message: DB_MESSAGES[dbStatus] });
    return;
  }

  // Anything else: log the details on the server, return a general message only.
  console.error("[api] unexpected error:", err);
  res.status(500).json({ code: "SERVER_ERROR", message: "Something went wrong. Please try again." });
};
