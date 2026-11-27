// Weekly performance record endpoints. Owner: Chandani Gupta.
// Calls Rose's performance repository. Database rule errors are turned into
// 400 / 404 / 409 by the error handler (duplicate week, unknown movie, broken rule).
import type { Request, Response } from "express";
import { correctRecord, deleteRecord, recordRevenue } from "../../rose/repositories/performance.repository.js";
import { conflict, notFound, statusForDbError } from "../middleware/errorHandler.js";
import type {
  CreatePerformanceInput,
  RecordIdInput,
  UpdatePerformanceInput,
} from "../validators/performance.validator.js";

/** POST /performance */
export async function createPerformance(_req: Request, res: Response) {
  const input = res.locals.input as CreatePerformanceInput;
  try {
    const record = await recordRevenue(input);
    res.status(201).json(record);
  } catch (e) {
    const status = statusForDbError(e);
    if (status === 409) throw conflict(`A record for movie ${input.movieId} in the week of ${input.weekStart} already exists.`);
    if (status === 404) throw notFound(`Movie ${input.movieId} was not found.`);
    throw e;
  }
}

/** PUT /performance/{recordId} */
export async function updatePerformance(_req: Request, res: Response) {
  const { recordId, ...changes } = res.locals.input as UpdatePerformanceInput;
  const record = await correctRecord(recordId, changes);
  if (!record) throw notFound(`Performance record ${recordId} was not found.`);
  res.json(record);
}

/** DELETE /performance/{recordId} */
export async function deletePerformance(_req: Request, res: Response) {
  const { recordId } = res.locals.input as RecordIdInput;
  const deleted = await deleteRecord(recordId);
  if (!deleted) throw notFound(`Performance record ${recordId} was not found.`);
  res.status(204).end();
}
