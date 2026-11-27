import type { MovieRow } from "../../rose/repositories/movie.repository.js";

import type {
  WeeklyReportRow,
  ReviewFlag,
} from "../../rose/repositories/performance.repository.js";

export interface RevenueSummary {
  totalRevenue: number;
  previousTotalRevenue: number | null;
  revenueDifference: number | null;
  percentChange: number | null;
  bestMovie: string | null;
}

export interface ScreeningSummary {
  totalMovies: number;
  activeMovies: number;
  extendedMovies: number;
  endedMovies: number;
}

export interface WeeklyAnalytics {
  weekStart: string;
  hasData: boolean;
  revenue: RevenueSummary;
  totalTicketsSold: number | null;
  totalScreenings: number | null;
  screeningSummary: ScreeningSummary;
  movies: WeeklyReportRow[];
}

export interface RevenueTrendPoint {
  weekStart: string;
  revenue: number;
}

export interface MovieRevenueTrend {
  movieId: number;
  title: string;
  chartPoints: RevenueTrendPoint[];
}

export interface RevenueChartData {
  movieId: number;
  title: string;
  revenue: number;
  previousRevenue: number | null;
}

export interface MovieComparison {
  movieId: number;
  title: string;
  revenue: number;
  previousRevenue: number | null;
  difference: number | null;
  percentChange: number | null;
  revenueShare: number | null;
  screeningStatus: MovieRow["screeningStatus"];
}

export interface ReviewThresholds {
  minRevenue: number;
  dropPercent: number;
}

export interface AnalyticsDashboardData {
  weeklyAnalytics: WeeklyAnalytics;
  revenueChart: RevenueChartData[];
  revenueTrend: RevenueTrendPoint[];
  movieComparison: MovieComparison[];
  reviewFlags: ReviewFlag[];
}