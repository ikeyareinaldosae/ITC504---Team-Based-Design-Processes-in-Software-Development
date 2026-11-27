// Weekly performance routes (mounted under /api/v1). Owner: Chandani Gupta.
import { Router } from "express";
import { createPerformance, deletePerformance, updatePerformance } from "../controllers/performance.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createPerformanceBody,
  recordIdParam,
  updatePerformanceRequest,
} from "../validators/performance.validator.js";

export const performanceRouter = Router();

performanceRouter.post("/performance", validateRequest(createPerformanceBody), createPerformance);
performanceRouter.put("/performance/:recordId", validateRequest(updatePerformanceRequest), updatePerformance);
performanceRouter.delete("/performance/:recordId", validateRequest(recordIdParam), deletePerformance);
