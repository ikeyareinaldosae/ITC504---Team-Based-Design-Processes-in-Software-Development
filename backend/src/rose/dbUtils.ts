// Small helpers shared by the Rose repositories. Owner: Rose Budha.
import type { Prisma, PrismaClient } from "@prisma/client";

/** A database client or a transaction. Every repository function accepts either. */
export type Db = PrismaClient | Prisma.TransactionClient;

/** Date column to "YYYY-MM-DD" text, as openapi.yaml expects. */
export const day = (d: Date | null): string | null => (d ? d.toISOString().slice(0, 10) : null);

/** Database number (Decimal, bigint or null) to a plain number or null. */
export const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

// Maps a database error to the API status code that the contract expects.
//   409 = the movie or week already exists, 400 = a rule was broken, 404 = a referenced movie does not exist.
export function httpStatusForDbError(e: unknown): 400 | 404 | 409 | 500 {
  const code = dbErrorCode(e);
  if (code === "23505") return 409; // unique violation
  if (code === "23514" || code === "22007" || code === "22008" || code === "22P02") return 400; // check rule or bad date or bad value
  if (code === "23503") return 404; // foreign key: the movie does not exist
  return 500;
}

// Returns the PostgreSQL error code (SQLSTATE) inside a Prisma error, for example "23505" for a repeated value.
export function dbErrorCode(e: unknown): string | undefined {
  const err = e as { code?: string; meta?: { code?: string; message?: string }; message?: string };
  if (err?.meta?.code && /^[0-9A-Z]{5}$/.test(err.meta.code)) return err.meta.code;
  if (err?.code === "P2002") return "23505";
  if (err?.code === "P2003") return "23503";
  const m = /(?:code|SQLSTATE)[:= ]+"?([0-9A-Z]{5})/.exec(err?.message ?? "");
  return m?.[1];
}
