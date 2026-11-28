import type {
  ReviewFlag,
} from "../types/analytics.types";

import {
  formatCurrency,
  formatPercentageChange,
  formatPercentage,
  getChangeDirection,
} from "../utils/revenueCalculations";

import {
  formatFullWeekLabel,
} from "../utils/chartData";

import "./ReviewFlags.css";

interface ReviewFlagsProps {
  flags: ReviewFlag[];
  weekStart: string;
  loading?: boolean;
  error?: string | null;
}

export default function ReviewFlags({
  flags,
  weekStart,
  loading = false,
  error = null,
}: ReviewFlagsProps) {
  return (
    <section
      className="av-review-card"
      aria-label="Management review flags"
    >
      <header className="av-review-header">
        <div>
          <h3 className="av-review-title">
            Management Review
          </h3>

          <p className="av-review-subtitle">
            {weekStart
              ? `Movies requiring attention · ${formatFullWeekLabel(weekStart)}`
              : "Movies requiring management attention"}
          </p>
        </div>

        {!loading && !error && (
          <span
            className={`av-review-count ${
              flags.length > 0
                ? "av-review-count-warning"
                : "av-review-count-success"
            }`}
          >
            {flags.length} flagged{" "}
            {flags.length === 1 ? "movie" : "movies"}
          </span>
        )}
      </header>

      {loading ? (
        <div
          className="av-review-message"
          role="status"
        >
          Loading management review flags...
        </div>
      ) : error ? (
        <div
          className="av-review-message av-review-error"
          role="alert"
        >
          {error}
        </div>
      ) : !weekStart ? (
        <div className="av-review-message">
          Select a reporting week to view review flags.
        </div>
      ) : flags.length === 0 ? (
        <div className="av-review-empty">
          <span
            className="av-review-empty-icon"
            aria-hidden="true"
          >
            ✓
          </span>

          <h4>No Movies Flagged</h4>

          <p>
            No movies meet the management review
            criteria for this reporting week.
          </p>
        </div>
      ) : (
        <div className="av-review-list">
          {flags.map((flag) => {
            const isSharpDrop =
              flag.reason === "SHARP_DROP";

            const reasonLabel = isSharpDrop
              ? "Sharp Revenue Decline"
              : "Below Minimum Revenue";

            const reasonDescription = isSharpDrop
              ? flag.percentChange !== null
                ? `Revenue decreased by ${formatPercentage(
                    Math.abs(flag.percentChange)
                  )} compared with the previous week.`
                : "Revenue has triggered the decline review rule."
              : "Weekly revenue is below the configured minimum threshold.";

            return (
              <article
                key={flag.movieId}
                className={`av-review-item ${
                  isSharpDrop
                    ? "av-review-item-decline"
                    : "av-review-item-low"
                }`}
              >
                <div className="av-review-item-heading">
                  <div
                    className={`av-review-icon ${
                      isSharpDrop
                        ? "av-review-icon-decline"
                        : "av-review-icon-low"
                    }`}
                    aria-hidden="true"
                  >
                    {isSharpDrop ? "↘" : "!"}
                  </div>

                  <div className="av-review-item-info">
                    <h4 className="av-review-movie">
                      {flag.title}
                    </h4>

                    <span
                      className={`av-review-reason ${
                        isSharpDrop
                          ? "av-review-reason-decline"
                          : "av-review-reason-low"
                      }`}
                    >
                      {reasonLabel}
                    </span>

                    <p className="av-review-description">
                      {reasonDescription}
                    </p>
                  </div>
                </div>

                <div className="av-review-metrics">
                  <div className="av-review-metric">
                    <span className="av-review-metric-label">
                      Current Revenue
                    </span>

                    <strong className="av-review-metric-value">
                      {formatCurrency(flag.revenue)}
                    </strong>
                  </div>

                  <div className="av-review-metric">
                    <span className="av-review-metric-label">
                      Previous Revenue
                    </span>

                    <strong className="av-review-metric-value">
                      {formatCurrency(
                        flag.previousRevenue
                      )}
                    </strong>
                  </div>

                  <div className="av-review-metric">
                    <span className="av-review-metric-label">
                      Revenue Change
                    </span>

                    <strong
                      className={`av-review-metric-value av-review-change-${getChangeDirection(
                        flag.percentChange
                      )}`}
                    >
                      {formatPercentageChange(
                        flag.percentChange
                      )}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="av-review-footer">
        <span
          className="av-review-info-icon"
          aria-hidden="true"
        >
          i
        </span>

        <p>
          Review flags support management decisions.
          Screening extensions and terminations require
          manual management action.
        </p>
      </footer>
    </section>
  );
}