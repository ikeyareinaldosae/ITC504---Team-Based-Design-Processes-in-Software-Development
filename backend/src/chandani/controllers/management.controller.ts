// Management endpoints: review flags and screening decisions. Owner: Chandani Gupta.
// Review flags come from Avishek's review service; screening changes use Rose's movie repository.
import type { Request, Response } from "express";
import { DEFAULT_REVIEW_THRESHOLDS, getReviewFlags } from "../../avishek/services/reviewFlags.service.js";
import { endScreening, extendScreening, getMovie } from "../../rose/repositories/movie.repository.js";
import { conflict, notFound } from "../middleware/errorHandler.js";
import type { ExtendScreeningInput, MovieIdInput } from "../validators/movie.validator.js";
import type { ReviewFlagsInput } from "../validators/report.validator.js";

/** GET /management/review-flags: thresholds not sent use the defaults (5000 AUD, 30%). */
export async function listReviewFlags(_req: Request, res: Response) {
  const { weekStart, minRevenue, dropPercent } = res.locals.input as ReviewFlagsInput;
  const flags = await getReviewFlags(weekStart, {
    minRevenue: minRevenue ?? DEFAULT_REVIEW_THRESHOLDS.minRevenue,
    dropPercent: dropPercent ?? DEFAULT_REVIEW_THRESHOLDS.dropPercent,
  });
  res.json(flags);
}

/**
 * POST /movies/{movieId}/screening/extend
 * Rose's extendScreening returns null both for a missing movie and an ended one,
 * so the movie is read first to choose between 404 and 409.
 */
export async function extendMovieScreening(_req: Request, res: Response) {
  const { movieId, weeks } = res.locals.input as ExtendScreeningInput;

  const movie = await getMovie(movieId);
  if (!movie) throw notFound(`Movie ${movieId} was not found.`);
  if (movie.screeningStatus === "ended") throw conflict(`The screening of "${movie.title}" has ended and cannot be extended.`);

  const updated = await extendScreening(movieId, weeks);
  // The status could have changed to "ended" between the two queries.
  if (!updated) throw conflict(`The screening of "${movie.title}" has ended and cannot be extended.`);

  res.json({ ...updated, message: `Screening extended by ${weeks} week${weeks === 1 ? "" : "s"}.` });
}

/** POST /movies/{movieId}/screening/end */
export async function endMovieScreening(_req: Request, res: Response) {
  const { movieId } = res.locals.input as MovieIdInput;
  const updated = await endScreening(movieId);
  if (!updated) throw notFound(`Movie ${movieId} was not found.`);
  res.json({ ...updated, message: "Screening ended." });
}
