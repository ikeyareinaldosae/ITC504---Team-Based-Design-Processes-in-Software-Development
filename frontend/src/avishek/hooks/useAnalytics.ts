import { useEffect, useState } from "react";

import { request } from "../../shared/api/apiClient";
import { getWeeks } from "../../shared/api/reports.api";

import type {
  WeeklyAnalytics,
  WeeklyMoviePerformance,
  MovieRevenueTrend,
  RevenueTrendPoint,
  ReviewFlag,
} from "../types/analytics.types";

import type {
  ScreeningStatus,
} from "../../shared/types/api.types";

interface WeeklyReportResponse {
  weekStart: string;
  totalRevenue: number;
  bestMovie: string | null;
  movies: WeeklyMoviePerformance[];
}

interface MovieStatusResponse {
  movieId: number;
  screeningStatus: ScreeningStatus;
}

// Get the previous Monday
function getPreviousWeek(weekStart: string): string {
  const date = new Date(`${weekStart}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() - 7);

  return date.toISOString().slice(0, 10);
}

// Preserve missing values instead of treating them as zero
function sumNullableCounts(
  values: (number | null)[]
): number | null {
  if (
    values.length === 0 ||
    values.some((value) => value === null)
  ) {
    return null;
  }

  return values.reduce<number>(
    (total, value) => total + (value ?? 0),
    0
  );
}

// Aggregate all movie revenues by reporting week
function aggregateRevenueTrend(
  movies: MovieRevenueTrend[]
): RevenueTrendPoint[] {
  const revenueByWeek = new Map<string, number>();

  for (const movie of movies) {
    for (const point of movie.chartPoints) {
      const existing =
        revenueByWeek.get(point.weekStart) ?? 0;

      const revenueInCents = Math.round(
        point.revenue * 100
      );

      revenueByWeek.set(
        point.weekStart,
        existing + revenueInCents
      );
    }
  }

  return Array.from(revenueByWeek.entries())
    .map(([weekStart, revenueInCents]) => ({
      weekStart,
      revenue: revenueInCents / 100,
    }))
    .sort((a, b) =>
      a.weekStart.localeCompare(b.weekStart)
    );
}

export default function useAnalytics() {
  const [weeks, setWeeks] = useState<string[]>([]);
  const [weekStart, setWeekStart] = useState("");

  const [analytics, setAnalytics] =
    useState<WeeklyAnalytics | null>(null);

  const [weeksLoading, setWeeksLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  const [weeksError, setWeeksError] =
    useState<string | null>(null);

  const [reportError, setReportError] =
    useState<string | null>(null);

  // Historical revenue state
  const [revenueTrend, setRevenueTrend] =
    useState<RevenueTrendPoint[]>([]);

  const [movieRevenueTrends, setMovieRevenueTrends] =
    useState<MovieRevenueTrend[]>([]);

  const [trendLoading, setTrendLoading] =
    useState(true);

  const [trendError, setTrendError] =
    useState<string | null>(null);

  // Management review state
  const [reviewFlags, setReviewFlags] =
    useState<ReviewFlag[]>([]);

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [reviewError, setReviewError] =
    useState<string | null>(null);

  const [reviewWeek, setReviewWeek] =
    useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  // Retrieve available reporting weeks
  useEffect(() => {
    const controller = new AbortController();

    async function loadWeeks() {
      setWeeksLoading(true);
      setWeeksError(null);

      try {
        const availableWeeks = await getWeeks(
          controller.signal
        );

        if (controller.signal.aborted) return;

        setWeeks(availableWeeks);

        setWeekStart((current) =>
          availableWeeks.includes(current)
            ? current
            : availableWeeks[0] ?? ""
        );
      } catch (err) {
        if (controller.signal.aborted) return;

        setWeeksError(
          err instanceof Error
            ? err.message
            : "Unable to load reporting weeks."
        );
      } finally {
        if (!controller.signal.aborted) {
          setWeeksLoading(false);
        }
      }
    }

    void loadWeeks();

    return () => controller.abort();
  }, [refreshKey]);

  // Retrieve complete weekly analytics
  useEffect(() => {
    if (!weekStart) {
      setAnalytics(null);
      setReportLoading(false);
      setReportError(null);
      return;
    }

    const controller = new AbortController();

    async function loadAnalytics() {
      setReportLoading(true);
      setReportError(null);
      setAnalytics(null);

      try {
        const previousWeek = getPreviousWeek(weekStart);

        const [current, previous, movies] =
          await Promise.all([
            request<WeeklyReportResponse>(
              "/reports/weekly",
              {
                query: { weekStart },
                signal: controller.signal,
              }
            ),

            request<WeeklyReportResponse>(
              "/reports/weekly",
              {
                query: { weekStart: previousWeek },
                signal: controller.signal,
              }
            ),

            request<MovieStatusResponse[]>("/movies", {
              signal: controller.signal,
            }),
          ]);

        if (controller.signal.aborted) return;

        const hasData = current.movies.length > 0;

        const previousTotalRevenue =
          previous.movies.length > 0
            ? previous.totalRevenue
            : null;

        const revenueDifference =
          hasData && previousTotalRevenue !== null
            ? Math.round(
                (current.totalRevenue -
                  previousTotalRevenue) *
                  100
              ) / 100
            : null;

        const percentChange =
          revenueDifference !== null &&
          previousTotalRevenue !== null &&
          previousTotalRevenue !== 0
            ? Math.round(
                (revenueDifference /
                  previousTotalRevenue) *
                  1000
              ) / 10
            : null;

        setAnalytics({
          weekStart: current.weekStart,
          hasData,

          revenue: {
            totalRevenue: current.totalRevenue,
            previousTotalRevenue,
            revenueDifference,
            percentChange,
            bestMovie: current.bestMovie,
          },

          totalTicketsSold: sumNullableCounts(
            current.movies.map(
              (movie) => movie.ticketsSold
            )
          ),

          totalScreenings: sumNullableCounts(
            current.movies.map(
              (movie) => movie.screenings
            )
          ),

          screeningSummary: {
            totalMovies: movies.length,

            activeMovies: movies.filter(
              (movie) =>
                movie.screeningStatus === "active"
            ).length,

            extendedMovies: movies.filter(
              (movie) =>
                movie.screeningStatus === "extended"
            ).length,

            endedMovies: movies.filter(
              (movie) =>
                movie.screeningStatus === "ended"
            ).length,
          },

          movies: current.movies,
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        setReportError(
          err instanceof Error
            ? err.message
            : "Unable to load weekly analytics."
        );
      } finally {
        if (!controller.signal.aborted) {
          setReportLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => controller.abort();
  }, [weekStart, refreshKey]);

  // Retrieve historical revenue for all movies
  useEffect(() => {
    const controller = new AbortController();

    async function loadRevenueTrend() {
      setTrendLoading(true);
      setTrendError(null);

      try {
        const movieTrends =
          await request<MovieRevenueTrend[]>(
            "/reports/charts/revenue-trend",
            {
              signal: controller.signal,
            }
          );

        if (controller.signal.aborted) return;

        const aggregatedTrend =
          aggregateRevenueTrend(movieTrends);

        setMovieRevenueTrends(movieTrends);
        setRevenueTrend(aggregatedTrend);
      } catch (err) {
        if (controller.signal.aborted) return;

        setRevenueTrend([]);
        setMovieRevenueTrends([]);

        setTrendError(
          err instanceof Error
            ? err.message
            : "Unable to load historical revenue."
        );
      } finally {
        if (!controller.signal.aborted) {
          setTrendLoading(false);
        }
      }
    }

    void loadRevenueTrend();

    return () => controller.abort();
  }, [refreshKey]);

  // Retrieve management review flags
  useEffect(() => {
    if (!weekStart) {
      setReviewFlags([]);
      setReviewLoading(false);
      setReviewError(null);
      setReviewWeek("");
      return;
    }

    const controller = new AbortController();

    async function loadReviewFlags() {
      setReviewLoading(true);
      setReviewError(null);
      setReviewFlags([]);
      setReviewWeek("");

      try {
        const flags = await request<ReviewFlag[]>(
          "/management/review-flags",
          {
            query: { weekStart },
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        setReviewFlags(flags);
        setReviewWeek(weekStart);
      } catch (err) {
        if (controller.signal.aborted) return;

        setReviewFlags([]);
        setReviewWeek(weekStart);

        setReviewError(
          err instanceof Error
            ? err.message
            : "Unable to load management review flags."
        );
      } finally {
        if (!controller.signal.aborted) {
          setReviewLoading(false);
        }
      }
    }

    void loadReviewFlags();

    return () => controller.abort();
  }, [weekStart, refreshKey]);

  // Determine the historical reporting range
  const trendFromWeek =
    revenueTrend[0]?.weekStart ?? "";

  const trendToWeek =
    revenueTrend[revenueTrend.length - 1]?.weekStart ?? "";

  // Prevent review flags from another week being displayed
  const reviewPending =
    reviewLoading ||
    (weekStart !== "" && reviewWeek !== weekStart);

  // Refresh all analytics data
  function refresh() {
    setRefreshKey((current) => current + 1);
  }

  return {
    weeks,
    weekStart,
    setWeekStart,
    analytics,

    loading: weeksLoading || reportLoading,
    error: weeksError ?? reportError,

    revenueTrend,
    movieRevenueTrends,
    trendFromWeek,
    trendToWeek,
    trendLoading,
    trendError,

    reviewFlags:
      reviewWeek === weekStart ? reviewFlags : [],

    reviewLoading: weeksLoading || reviewPending,

    reviewError:
      weeksError ??
      (reviewWeek === weekStart ? reviewError : null),

    refreshing:
      weeksLoading ||
      reportLoading ||
      trendLoading ||
      reviewPending,

    refresh,
  };
}