import type { ScreeningStatus } from "../../shared/types/api.types";

// Revenue summary
export interface RevenueSummary {
  totalRevenue: number;
  previousTotalRevenue: number | null;
  revenueDifference: number | null;
  percentChange: number | null;
  bestMovie: string | null;
}

// Current screening status summary
export interface ScreeningSummary {
  totalMovies: number;
  activeMovies: number;
  extendedMovies: number;
  endedMovies: number;
}

// Weekly movie performance
export interface WeeklyMoviePerformance {
  movieId: number;
  title: string;
  revenue: number;
  previousRevenue: number | null;
  difference: number | null;
  percentChange: number | null;
  ticketsSold: number | null;
  screenings: number | null;
  screeningStatus: ScreeningStatus;
}

// Complete weekly analytics
export interface WeeklyAnalytics {
  weekStart: string;
  hasData: boolean;
  revenue: RevenueSummary;
  totalTicketsSold: number | null;
  totalScreenings: number | null;
  screeningSummary: ScreeningSummary;
  movies: WeeklyMoviePerformance[];
}

// Weekly revenue bar chart
export interface RevenueChartData {
  movieId: number;
  title: string;
  revenue: number;
  previousRevenue: number | null;
}

// Historical cinema revenue
export interface RevenueTrendPoint {
  weekStart: string;
  revenue: number;
}

// Individual movie revenue history
export interface MovieRevenueTrend {
  movieId: number;
  title: string;
  chartPoints: RevenueTrendPoint[];
}

// Movie performance comparison
export interface MovieComparison {
  movieId: number;
  title: string;
  revenue: number;
  previousRevenue: number | null;
  difference: number | null;
  percentChange: number | null;
  revenueShare: number | null;
  screeningStatus: ScreeningStatus;
}

// Management review rules
export type ReviewReason =
  | "BELOW_MIN_REVENUE"
  | "SHARP_DROP";

// Management review flags
export interface ReviewFlag {
  movieId: number;
  title: string;
  revenue: number;
  previousRevenue: number | null;
  percentChange: number | null;
  reason: ReviewReason;
}

// Configurable review thresholds
export interface ReviewThresholds {
  minRevenue: number;
  dropPercent: number;
}

// Complete dashboard data
export interface AnalyticsDashboardData {
  weeklyAnalytics: WeeklyAnalytics;
  revenueChart: RevenueChartData[];
  revenueTrend: RevenueTrendPoint[];
  movieComparison: MovieComparison[];
  reviewFlags: ReviewFlag[];
}

// Analytics reporting filters
export interface AnalyticsFilters {
  weekStart: string;
  fromWeek: string;
  toWeek: string;
  movieId?: number;
}

// Analytics loading and error state
export interface AnalyticsState {
  data: AnalyticsDashboardData | null;
  loading: boolean;
  error: string | null;
}

// Chart display points with missing-week support
export interface RevenueTrendChartPoint {
  weekStart: string;
  revenue: number | null;
}