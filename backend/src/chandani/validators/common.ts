// Shared validation helpers for the REST API. Owner: Chandani Gupta.
// Each helper returns the clean value or throws a 400 ApiError with a clear message.
import { badRequest } from "../middleware/errorHandler.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-30). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** A reporting week: a real date that is a Monday. */
export function mondayDate(value: unknown, field: string): string {
  if (value === undefined || value === null || value === "") throw badRequest(`${field} is required.`);
  if (!isIsoDate(value)) throw badRequest(`${field} must be a date in the format YYYY-MM-DD.`);
  if (new Date(`${value}T00:00:00Z`).getUTCDay() !== 1) throw badRequest(`${field} must be a Monday.`);
  return value;
}

/** An optional calendar date, or null. */
export function optionalDate(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (!isIsoDate(value)) throw badRequest(`${field} must be a date in the format YYYY-MM-DD.`);
  return value;
}

/** An amount in AUD: a number, zero or more, with at most two decimal places. */
export function money(value: unknown, field: string): number {
  if (value === undefined || value === null) throw badRequest(`${field} is required.`);
  if (typeof value !== "number" || !Number.isFinite(value)) throw badRequest(`${field} must be a number.`);
  if (value < 0) throw badRequest(`${field} must be zero or more.`);
  const cents = value * 100;
  if (Math.abs(cents - Math.round(cents)) > 1e-6) throw badRequest(`${field} can have at most two decimal places.`);
  return value;
}

/** An optional whole number of zero or more (ticketsSold, screenings), or null. */
export function optionalCount(value: unknown, field: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw badRequest(`${field} must be a whole number of zero or more.`);
  }
  return value;
}

/** A positive whole-number ID from the body (a JSON number). */
export function bodyId(value: unknown, field: string): number {
  if (value === undefined || value === null) throw badRequest(`${field} is required.`);
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw badRequest(`${field} must be a whole number of 1 or more.`);
  }
  return value;
}

/** A positive whole-number ID from the URL path or query string (text such as "12"). */
export function textId(value: unknown, field: string): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw badRequest(`${field} must be a whole number of 1 or more.`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw badRequest(`${field} must be a whole number of 1 or more.`);
  return n;
}

/** An optional number from the query string, checked against a range. */
export function optionalQueryNumber(
  value: unknown,
  field: string,
  check: { min?: number; above?: number; max?: number },
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "" || !Number.isFinite(Number(value))) {
    throw badRequest(`${field} must be a number.`);
  }
  const n = Number(value);
  if (check.min !== undefined && n < check.min) throw badRequest(`${field} must be ${check.min} or more.`);
  if (check.above !== undefined && n <= check.above) throw badRequest(`${field} must be more than ${check.above}.`);
  if (check.max !== undefined && n > check.max) throw badRequest(`${field} must be ${check.max} or less.`);
  return n;
}

/** The request body must be a JSON object. */
export function objectBody(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw badRequest("The request body must be a JSON object.");
  }
  return body as Record<string, unknown>;
}
