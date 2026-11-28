import useAnalytics from "../hooks/useAnalytics";

import PerformanceCards from "../components/PerformanceCards";
import RevenueBarChart from "../components/RevenueBarChart";
import RevenueTrendChart from "../components/RevenueTrendChart";
import MovieComparison from "../components/MovieComparison";
import ReviewFlags from "../components/ReviewFlags";

import { formatFullWeekLabel } from "../utils/chartData";

import "./AnalyticsDashboard.css";

export default function AnalyticsDashboard() {
  const {
    weeks,
    weekStart,
    setWeekStart,
    analytics,
    loading,
    error,
    revenueTrend,
    trendFromWeek,
    trendToWeek,
    trendLoading,
    trendError,
    reviewFlags,
    reviewLoading,
    reviewError,
    refreshing,
    refresh,
  } = useAnalytics();

  const revenueChartData =
    analytics?.movies.map((movie) => ({
      movieId: movie.movieId,
      title: movie.title,
      revenue: movie.revenue,
      previousRevenue: movie.previousRevenue,
    })) ?? [];

  return (
    <main className="av-dashboard">
      <header className="av-dashboard-header">
        <div>
          <h1 className="av-dashboard-title">
            Analytics Dashboard
          </h1>

          <p className="av-dashboard-subtitle">
            Monitor cinema revenue and movie performance.
          </p>
        </div>

        <div className="av-dashboard-controls">
          <div className="av-week-filter">
            <label htmlFor="av-reporting-week">
              Reporting Week
            </label>

            <select
              id="av-reporting-week"
              value={weekStart}
              onChange={(event) =>
                setWeekStart(event.target.value)
              }
              disabled={loading || weeks.length === 0}
            >
              {weeks.length === 0 && (
                <option value="">
                  No reporting weeks
                </option>
              )}

              {weeks.map((week) => (
                <option key={week} value={week}>
                  {formatFullWeekLabel(week)}
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

      {/* Performance overview */}
      <section className="av-dashboard-section">
        <h2 className="av-section-title">
          Performance Overview
        </h2>

        <p className="av-section-description">
          {weekStart
            ? `Week commencing ${formatFullWeekLabel(weekStart)}`
            : "Select a reporting week"}
        </p>

        <PerformanceCards
          analytics={analytics}
          loading={loading}
          error={error}
        />
      </section>

      {/* Revenue charts */}
      <section className="av-dashboard-section">
        <h2 className="av-section-title">
          Revenue Analysis
        </h2>

        <p className="av-section-description">
          Compare weekly movie revenue and explore
          historical cinema performance.
        </p>

        <div className="av-dashboard-charts">
          <RevenueBarChart
            data={revenueChartData}
            weekStart={weekStart}
            loading={loading}
            error={error}
          />

          <RevenueTrendChart
            data={revenueTrend}
            fromWeek={trendFromWeek}
            toWeek={trendToWeek}
            loading={trendLoading}
            error={trendError}
          />
        </div>
      </section>

      {/* Movie performance comparison */}
      <section className="av-dashboard-section">
        <h2 className="av-section-title">
          Movie Performance
        </h2>

        <p className="av-section-description">
          Compare individual movie revenue,
          weekly changes and screening status.
        </p>

        <MovieComparison
          movies={analytics?.movies ?? []}
          totalRevenue={
            analytics?.revenue.totalRevenue ?? 0
          }
          weekStart={weekStart}
          loading={loading}
          error={error}
        />
      </section>

      {/* Management review flags */}
      <section className="av-dashboard-section">
        <h2 className="av-section-title">
          Performance Review
        </h2>

        <p className="av-section-description">
          Identify underperforming movies that require
          management attention based on weekly revenue
          and performance changes.
        </p>

        <ReviewFlags
          flags={reviewFlags}
          weekStart={weekStart}
          loading={reviewLoading}
          error={reviewError}
        />
      </section>
    </main>
  );
}