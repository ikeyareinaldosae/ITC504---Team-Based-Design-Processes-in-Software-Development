// Express application for the Movie Performance Management System API.
// Owner: Chandani Gupta. All routes are under /api/v1, as defined in openapi.yaml (v1.1.0).
import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./chandani/middleware/errorHandler.js";
import { managementRouter } from "./chandani/routes/management.routes.js";
import { movieRouter } from "./chandani/routes/movie.routes.js";
import { performanceRouter } from "./chandani/routes/performance.routes.js";
import { reportRouter } from "./chandani/routes/report.routes.js";

export const API_BASE_PATH = "/api/v1";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  const api = express.Router();

  // GET /health: confirms the API is running.
  api.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  api.use(movieRouter);
  api.use(performanceRouter);
  api.use(reportRouter);
  api.use(managementRouter);

  app.use(API_BASE_PATH, api);

  // Unknown paths, then every error, return { code, message }.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
