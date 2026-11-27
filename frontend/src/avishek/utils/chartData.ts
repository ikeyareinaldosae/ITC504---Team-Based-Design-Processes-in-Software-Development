import type {
  RevenueChartData,
  RevenueTrendPoint,
  RevenueTrendChartPoint,
  MovieRevenueTrend,
} from "../types/analytics.types";

// Sort movie revenue from highest to lowest
export function prepareRevenueBarData(
  rows: readonly RevenueChartData[]
): RevenueChartData[] {
  return [...rows].sort(
    (a, b) => b.revenue - a.revenue || a.movieId - b.movieId
  );
}

// Sort historical revenue chronologically
export function sortRevenueTrend(
  points: readonly RevenueTrendPoint[]
): RevenueTrendPoint[] {
  return [...points].sort(
    (a, b) => a.weekStart.localeCompare(b.weekStart)
  );
}

// Validate a reporting week
function isValidWeekStart(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date.getUTCDay() === 1
  );
}

// Move to the next reporting week
function getNextWeek(weekStart: string): string {
  const date = new Date(`${weekStart}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() + 7);

  return date.toISOString().slice(0, 10);
}

// Preserve missing reporting weeks as chart gaps
export function prepareRevenueTrendData(
  points: readonly RevenueTrendPoint[],
  fromWeek: string,
  toWeek: string
): RevenueTrendChartPoint[] {
  if (
    !isValidWeekStart(fromWeek) ||
    !isValidWeekStart(toWeek) ||
    fromWeek > toWeek
  ) {
    throw new Error("Invalid reporting week range.");
  }

  const revenueByWeek = new Map(
    points.map((point) => [
      point.weekStart,
      point.revenue,
    ])
  );

  const result: RevenueTrendChartPoint[] = [];

  let currentWeek = fromWeek;

  while (currentWeek <= toWeek) {
    result.push({
      weekStart: currentWeek,
      revenue: revenueByWeek.get(currentWeek) ?? null,
    });

    if (currentWeek === toWeek) break;

    currentWeek = getNextWeek(currentWeek);
  }

  return result;
}

// Prepare individual movie revenue histories
export function prepareMovieRevenueTrends(
  movies: readonly MovieRevenueTrend[]
): MovieRevenueTrend[] {
  return movies
    .map((movie) => ({
      ...movie,
      chartPoints: sortRevenueTrend(movie.chartPoints),
    }))
    .sort(
      (a, b) =>
        a.title.localeCompare(b.title) ||
        a.movieId - b.movieId
    );
}

// Format reporting dates for chart labels
export function formatWeekLabel(weekStart: string): string {
  if (!isValidWeekStart(weekStart)) {
    return weekStart;
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${weekStart}T00:00:00Z`));
}

// Format full reporting dates for tooltips
export function formatFullWeekLabel(
  weekStart: string
): string {
  if (!isValidWeekStart(weekStart)) {
    return weekStart;
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${weekStart}T00:00:00Z`));
}