// Movie endpoints. Owner: Chandani Gupta.
// Calls Rose's movie repository (backend/src/rose/repositories/movie.repository.ts).
import type { Request, Response } from "express";
import { addMovie, getMovie, listMovies } from "../../rose/repositories/movie.repository.js";
import { conflict, notFound, statusForDbError } from "../middleware/errorHandler.js";
import type { CreateMovieInput, MovieIdInput } from "../validators/movie.validator.js";

/** GET /movies: every movie, sorted by title. */
export async function listAllMovies(_req: Request, res: Response) {
  res.json(await listMovies());
}

/** GET /movies/{movieId} */
export async function getMovieById(_req: Request, res: Response) {
  const { movieId } = res.locals.input as MovieIdInput;
  const movie = await getMovie(movieId);
  if (!movie) throw notFound(`Movie ${movieId} was not found.`);
  res.json(movie);
}

/** POST /movies: new movies start "active". A repeated title gives 409 through the error handler. */
export async function createMovie(_req: Request, res: Response) {
  const input = res.locals.input as CreateMovieInput;
  try {
    const movie = await addMovie(input);
    res.status(201).json(movie);
  } catch (e) {
    if (statusForDbError(e) === 409) throw conflict(`A movie titled "${input.title}" already exists.`);
    throw e;
  }
}
