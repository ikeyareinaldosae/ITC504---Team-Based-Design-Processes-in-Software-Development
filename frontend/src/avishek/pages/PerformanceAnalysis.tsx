import { useMemo, useState } from "react";

import useAnalytics from "../hooks/useAnalytics";
import RevenueTrendChart from "../components/RevenueTrendChart";

import {
  prepareMovieRevenueTrends,
  formatFullWeekLabel,
} from "../utils/chartData";

import {
  formatCurrency,
  formatNumber,
  formatRevenueDifference,
  formatPercentageChange,
  getChangeDirection,
} from "../utils/revenueCalculations";

import type {
  RevenueTrendPoint,
} from "../types/analytics.types";

import "./AnalyticsDashboard.css";
import "./PerformanceAnalysis.css";

interface WeeklyHistoryRow {
  weekStart: string;
  revenue: number;
  previousRevenue: number | null;
  difference: number | null;
  percentChange: number | null;
}

// Calculate the previous reporting week
function getPreviousWeek(weekStart: string): string {
  const date = new Date(`${weekStart}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() - 7);

  return date.toISOString().slice(0, 10);
}

// Prepare weekly performance comparisons
function prepareWeeklyHistory(
  points: RevenueTrendPoint[]
): WeeklyHistoryRow[] {
  const revenueByWeek = new Map(
    points.map((point) => [
      point.weekStart,
      point.revenue,
    ])
  );

  return points
    .map((point) => {
      const previousRevenue =
        revenueByWeek.get(
          getPreviousWeek(point.weekStart)
        ) ?? null;

      const difference =
        previousRevenue !== null
          ? Math.round(
              (point.revenue - previousRevenue) * 100
            ) / 100
          : null;

      const percentChange =
        difference !== null &&
        previousRevenue !== null &&
        previousRevenue !== 0
          ? Math.round(
              (difference / previousRevenue) * 1000
            ) / 10
          : null;

      return {
        weekStart: point.weekStart,
        revenue: point.revenue,
        previousRevenue,
        difference,
        percentChange,
      };
    })
    .sort((a, b) =>
      b.weekStart.localeCompare(a.weekStart)
    );
}

// Calculate individual movie summary statistics
function calculateMovieStatistics(
  points: RevenueTrendPoint[]
) {
  if (points.length === 0) {
    return null;
  }

  const totalRevenue =
    points.reduce(
      (total, point) =>
        total + Math.round(point.revenue * 100),
      0
    ) / 100;

  const averageRevenue =
    Math.round(
      (totalRevenue / points.length) * 100
    ) / 100;

  const highestWeek = [...points].sort(
    (a, b) =>
      b.revenue - a.revenue ||
      a.weekStart.localeCompare(b.weekStart)
  )[0];

  const latestWeek = points[points.length - 1];

  return {
    totalRevenue,
    averageRevenue,
    highestWeek,
    latestWeek,
    recordedWeeks: points.length,
  };
}

export default function PerformanceAnalysis() {
  const {
    movieRevenueTrends,
    trendLoading,
    trendError,
    refreshing,
    refresh,
  } = useAnalytics();

  const [selectedMovieId, setSelectedMovieId] =
    useState("");

  // Prepare available movie histories
  const movies = useMemo(
    () =>
      prepareMovieRevenueTrends(movieRevenueTrends),
    [movieRevenueTrends]
  );

  // Preserve the selected movie when refreshing
  const selectedMovie =
    movies.find(
      (movie) =>
        String(movie.movieId) === selectedMovieId
    ) ??
    movies[0] ??
    null;

  const statistics = useMemo(
    () =>
      calculateMovieStatistics(
        selectedMovie?.chartPoints ?? []
      ),
    [selectedMovie]
  );

  const weeklyHistory = useMemo(
    () =>
      prepareWeeklyHistory(
        selectedMovie?.chartPoints ?? []
      ),
    [selectedMovie]
  );

  const latestHistory = weeklyHistory[0] ?? null;

  return (
    <main className="av-dashboard">
      <header className="av-dashboard-header">
        <div>
          <h1 className="av-dashboard-title">
            Performance Analysis
          </h1>

          <p className="av-dashboard-subtitle">
            Explore individual movie performance
            and historical revenue.
          </p>
        </div>

        <div className="av-dashboard-controls">
          <div className="av-week-filter">
            <label htmlFor="av-analysis-movie">
              Select Movie
            </label>

            <select
              id="av-analysis-movie"
              value={
                selectedMovie
                  ? String(selectedMovie.movieId)
                  : ""
              }
              onChange={(event) =>
                setSelectedMovieId(event.target.value)
              }
              disabled={
                trendLoading || movies.length === 0
              }
            >
              {movies.length === 0 && (
                <option value="">
                  No movie histories available
                </option>
              )}

              {movies.map((movie) => (
                <option
                  key={movie.movieId}
                  value={String(movie.movieId)}
                >
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="av-refresh-button"
            onClick={refresh}
            disabled={refreshing}
          >
            {refreshing
              ? "Loading..."
              : "Refresh Data"}
          </button>
        </div>
      </header>

      {trendLoading ? (
        <p role="status">
          Loading movie performance data...
        </p>
      ) : trendError ? (
        <p role="alert">{trendError}</p>
      ) : !selectedMovie || !statistics ? (
        <p>No movie performance records available.</p>
      ) : (
        <>
          {/* Individual movie summary */}
          <section className="av-dashboard-section">
            <h2 className="av-section-title">
              {selectedMovie.title}
            </h2>

            <p className="av-section-description">
              Performance across{" "}
              {formatNumber(statistics.recordedWeeks)}{" "}
              recorded reporting weeks.
            </p>

            <div className="av-analysis-summary-grid">
              <article className="av-analysis-card">
                <h3>Total Recorded Revenue</h3>

                <strong>
                  {formatCurrency(
                    statistics.totalRevenue
                  )}
                </strong>

                <p>
                  Across all recorded reporting weeks
                </p>
              </article>

              <article className="av-analysis-card">
                <h3>Latest Weekly Revenue</h3>

                <strong>
                  {formatCurrency(
                    statistics.latestWeek.revenue
                  )}
                </strong>

                <p>
                  {formatFullWeekLabel(
                    statistics.latestWeek.weekStart
                  )}
                </p>

                <span
                  className={`av-analysis-change-${getChangeDirection(
                    latestHistory?.percentChange ?? null
                  )}`}
                >
                  {formatPercentageChange(
                    latestHistory?.percentChange ?? null
                  )}{" "}
                  vs previous week
                </span>
              </article>

              <article className="av-analysis-card">
                <h3>Average Weekly Revenue</h3>

                <strong>
                  {formatCurrency(
                    statistics.averageRevenue
                  )}
                </strong>

                <p>Based on recorded weeks only</p>
              </article>

              <article className="av-analysis-card">
                <h3>Highest Weekly Revenue</h3>

                <strong>
                  {formatCurrency(
                    statistics.highestWeek.revenue
                  )}
                </strong>

                <p>
                  {formatFullWeekLabel(
                    statistics.highestWeek.weekStart
                  )}
                </p>
              </article>
            </div>
          </section>

          {/* Individual revenue trend */}
          <section className="av-dashboard-section">
            <h2 className="av-section-title">
              Historical Revenue Analysis
            </h2>

            <p className="av-section-description">
              Explore weekly revenue trends for{" "}
              {selectedMovie.title}.
            </p>

            <RevenueTrendChart
              key={selectedMovie.movieId}
              data={selectedMovie.chartPoints}
              fromWeek={
                selectedMovie.chartPoints[0]?.weekStart ?? ""
              }
              toWeek={statistics.latestWeek.weekStart}
              loading={trendLoading}
              error={trendError}
              title="Individual Revenue Trend"
              subtitle={`Historical revenue for ${selectedMovie.title}`}
              revenueLabel="Weekly Revenue"
              legendLabel={`${selectedMovie.title} - Weekly Revenue`}
            />
          </section>

          {/* Weekly performance history */}
          <section className="av-dashboard-section">
            <h2 className="av-section-title">
              Weekly Performance History
            </h2>

            <p className="av-section-description">
              Review historical revenue and
              week-to-week performance changes.
            </p>

            <div className="av-analysis-history-card">
              <div className="av-analysis-table-wrapper">
                <table className="av-analysis-table">
                  <thead>
                    <tr>
                      <th scope="col">Reporting Week</th>
                      <th scope="col">Weekly Revenue</th>
                      <th scope="col">Previous Revenue</th>
                      <th scope="col">Difference</th>
                      <th scope="col">Change (%)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {weeklyHistory.map((row) => (
                      <tr key={row.weekStart}>
                        <td>
                          {formatFullWeekLabel(
                            row.weekStart
                          )}
                        </td>

                        <td>
                          {formatCurrency(row.revenue)}
                        </td>

                        <td>
                          {formatCurrency(
                            row.previousRevenue
                          )}
                        </td>

                        <td
                          className={`av-analysis-change-${getChangeDirection(
                            row.difference
                          )}`}
                        >
                          {formatRevenueDifference(
                            row.difference
                          )}
                        </td>

                        <td
                          className={`av-analysis-change-${getChangeDirection(
                            row.percentChange
                          )}`}
                        >
                          {formatPercentageChange(
                            row.percentChange
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="av-analysis-history-footer">
                {formatNumber(weeklyHistory.length)}{" "}
                recorded reporting weeks
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}