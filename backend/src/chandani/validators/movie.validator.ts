// Validation for movie and screening requests. Owner: Chandani Gupta.
import type { Request } from "express";
import { badRequest } from "../middleware/errorHandler.js";
import { objectBody, optionalDate, textId } from "./common.js";

export type MovieIdInput = { movieId: number };
export type CreateMovieInput = { title: string; genre: string | null; releaseDate: string | null };
export type ExtendScreeningInput = { movieId: number; weeks: number };

/** GET /movies/{movieId}, POST /movies/{movieId}/screening/end */
export function movieIdParam(req: Request): MovieIdInput {
  return { movieId: textId(req.params.movieId, "movieId") };
}

/** POST /movies: title is required; genre and releaseDate are optional. */
export function createMovieBody(req: Request): CreateMovieInput {
  const body = objectBody(req.body);

  if (typeof body.title !== "string" || body.title.trim() === "") {
    throw badRequest("title is required and must not be blank.");
  }

  let genre: string | null = null;
  if (body.genre !== undefined && body.genre !== null) {
    if (typeof body.genre !== "string") throw badRequest("genre must be text.");
    genre = body.genre.trim() === "" ? null : body.genre.trim();
  }

  return {
    title: body.title.trim(),
    genre,
    releaseDate: optionalDate(body.releaseDate, "releaseDate"),
  };
}

/** POST /movies/{movieId}/screening/extend: optional body { weeks }, default 1. */
export function extendScreeningRequest(req: Request): ExtendScreeningInput {
  const { movieId } = movieIdParam(req);
  const body = req.body === undefined || req.body === null ? {} : objectBody(req.body);

  let weeks = 1;
  if (body.weeks !== undefined) {
    if (typeof body.weeks !== "number" || !Number.isSafeInteger(body.weeks) || body.weeks < 1) {
      throw badRequest("weeks must be a whole number of 1 or more.");
    }
    weeks = body.weeks;
  }
  return { movieId, weeks };
}
