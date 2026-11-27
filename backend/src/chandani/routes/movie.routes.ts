// Movie routes (mounted under /api/v1). Owner: Chandani Gupta.
import { Router } from "express";
import { createMovie, getMovieById, listAllMovies } from "../controllers/movie.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createMovieBody, movieIdParam } from "../validators/movie.validator.js";

export const movieRouter = Router();

movieRouter.get("/movies", listAllMovies);
movieRouter.post("/movies", validateRequest(createMovieBody), createMovie);
movieRouter.get("/movies/:movieId", validateRequest(movieIdParam), getMovieById);
