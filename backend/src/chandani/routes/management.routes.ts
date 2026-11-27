// Management routes (mounted under /api/v1). Owner: Chandani Gupta.
import { Router } from "express";
import { endMovieScreening, extendMovieScreening, listReviewFlags } from "../controllers/management.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { extendScreeningRequest, movieIdParam } from "../validators/movie.validator.js";
import { reviewFlagsQuery } from "../validators/report.validator.js";

export const managementRouter = Router();

managementRouter.get("/management/review-flags", validateRequest(reviewFlagsQuery), listReviewFlags);
managementRouter.post("/movies/:movieId/screening/extend", validateRequest(extendScreeningRequest), extendMovieScreening);
managementRouter.post("/movies/:movieId/screening/end", validateRequest(movieIdParam), endMovieScreening);
