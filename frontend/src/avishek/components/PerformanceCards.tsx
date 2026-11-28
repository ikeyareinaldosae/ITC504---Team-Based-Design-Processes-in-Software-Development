import type { WeeklyAnalytics } from "../types/analytics.types";

import {
  formatCurrency,
  formatNumber,
  formatPercentageChange,
  formatRevenueDifference,
  getChangeDirection,
} from "../utils/revenueCalculations";

import "./PerformanceCards.css";

interface PerformanceCardsProps {
  analytics: WeeklyAnalytics | null;
  loading?: boolean;
  error?: string | null;
}

interface SummaryCardProps {
  label: string;
  value: string;
  description: string;
  direction?: "positive" | "negative" | "neutral" | "unavailable";
}

function SummaryCard({
  label,
  value,
  description,
  direction = "neutral",
}: SummaryCardProps) {
  return (
    <article className="av-performance-card">
      <h3 className="av-card-label">{label}</h3>

      <p className="av-card-value">{value}</p>

      <p className={`av-card-description av-change-${direction}`}>
        {description}
      </p>
    </article>
  );
}

export default function PerformanceCards({
  analytics,
  loading = false,
  error = null,
}: PerformanceCardsProps) {
  if (loading) {
    return (
      <div className="av-cards-message" role="status">
        Loading performance summary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="av-cards-message av-cards-error" role="alert">
        {error}
      </div>
    );
  }

  if (!analytics || !analytics.hasData) {
    return (
      <div className="av-cards-message">
        No performance records are available for the selected week.
      </div>
    );
  }

  const {
    revenue,
    movies,
    totalTicketsSold,
    totalScreenings,
  } = analytics;

  const bestMovie = movies.find(
    (movie) => movie.title === revenue.bestMovie
  );

  const revenueDirection = getChangeDirection(
    revenue.revenueDifference
  );

  const revenueDescription =
    revenue.previousTotalRevenue === null
      ? "No previous week data"
      : revenue.percentChange === null
        ? `${formatRevenueDifference(
            revenue.revenueDifference
          )} from previous week`
        : `${formatPercentageChange(
            revenue.percentChange
          )} (${formatRevenueDifference(
            revenue.revenueDifference
          )}) from previous week`;

  return (
    <section
      className="av-performance-cards"
      aria-label="Weekly performance summary"
    >
      <SummaryCard
        label="Total Weekly Revenue"
        value={formatCurrency(revenue.totalRevenue)}
        description={revenueDescription}
        direction={revenueDirection}
      />

      <SummaryCard
        label="Best Performing Movie"
        value={revenue.bestMovie ?? "N/A"}
        description={
          bestMovie
            ? `${formatCurrency(bestMovie.revenue)} revenue`
            : "No movie performance available"
        }
      />

      <SummaryCard
        label="Total Tickets Sold"
        value={formatNumber(totalTicketsSold)}
        description={
          totalTicketsSold === null
            ? "Incomplete ticket sales data"
            : "Tickets sold during selected week"
        }
      />

      <SummaryCard
        label="Total Screenings"
        value={formatNumber(totalScreenings)}
        description={
          totalScreenings === null
            ? "Incomplete screening data"
            : "Screenings during selected week"
        }
      />
    </section>
  );
}