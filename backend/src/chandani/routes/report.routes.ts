// Report routes (mounted under /api/v1). Owner: Chandani Gupta.
import { Router } from "express";
import { getRevenueTrend, getWeeklyReport, listReportWeeks } from "../controllers/report.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { trendQuery, weekQuery } from "../validators/report.validator.js";

export const reportRouter = Router();

reportRouter.get("/reports/weeks", listReportWeeks);
reportRouter.get("/reports/weekly", validateRequest(weekQuery), getWeeklyReport);
reportRouter.get("/reports/charts/revenue-trend", validateRequest(trendQuery), getRevenueTrend);
