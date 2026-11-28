import { useId } from "react";

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type {
  RevenueTrendPoint,
} from "../types/analytics.types";

import {
  prepareRevenueTrendData,
  formatWeekLabel,
  formatFullWeekLabel,
} from "../utils/chartData";

import {
  formatCurrency,
  formatCompactCurrency,
} from "../utils/revenueCalculations";

import "./RevenueCharts.css";

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
  fromWeek: string;
  toWeek: string;
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  revenueLabel?: string;
  legendLabel?: string;
}

export default function RevenueTrendChart({
  data,
  fromWeek,
  toWeek,
  loading = false,
  error = null,
  title = "Total Revenue Trend",
  subtitle = "Historical weekly cinema revenue",
  revenueLabel = "Total Revenue",
  legendLabel = "Total weekly revenue",
}: RevenueTrendChartProps) {
  // Generate a unique gradient ID for each chart
  const gradientId = `avRevenueGradient-${useId().replace(
    /:/g,
    ""
  )}`;

  const chartData =
    fromWeek && toWeek
      ? prepareRevenueTrendData(
          data,
          fromWeek,
          toWeek
        )
      : [];

  const hasData = chartData.some(
    (point) => point.revenue !== null
  );

  return (
    <section
      className="av-chart-card"
      aria-label={title}
    >
      <header className="av-chart-header">
        <h3 className="av-chart-title">
          {title}
        </h3>

        <p className="av-chart-subtitle">
          {fromWeek && toWeek
            ? `${formatFullWeekLabel(fromWeek)} - ${formatFullWeekLabel(toWeek)}`
            : subtitle}
        </p>
      </header>

      {loading ? (
        <div
          className="av-chart-message"
          role="status"
        >
          Loading revenue trend...
        </div>
      ) : error ? (
        <div
          className="av-chart-message av-chart-error"
          role="alert"
        >
          {error}
        </div>
      ) : !hasData ? (
        <div className="av-chart-message">
          No historical revenue records available.
        </div>
      ) : (
        <>
          <div className="av-chart-container">
            <ResponsiveContainer
              width="100%"
              height={358}
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 20,
                  bottom: 10,
                  left: 5,
                }}
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#6389b8"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="95%"
                      stopColor="#6389b8"
                      stopOpacity={0.03}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="weekStart"
                  tickFormatter={formatWeekLabel}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                  tickMargin={12}
                />

                <YAxis
                  domain={[0, "auto"]}
                  tickFormatter={formatCompactCurrency}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />

                <Tooltip
                  labelFormatter={(label) =>
                    formatFullWeekLabel(String(label))
                  }
                  formatter={(value) => [
                    formatCurrency(
                      typeof value === "number"
                        ? value
                        : null
                    ),
                    revenueLabel,
                  ]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    boxShadow:
                      "0 4px 12px rgba(15,23,42,0.08)",
                    fontSize: "13px",
                  }}
                  cursor={{
                    stroke: "#94a3b8",
                    strokeDasharray: "4 4",
                  }}
                />

                <Area
                  type="linear"
                  dataKey="revenue"
                  name={revenueLabel}
                  stroke="#1e3a5f"
                  strokeWidth={3}
                  fill={`url(#${gradientId})`}
                  connectNulls={false}
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: "#1e3a5f",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#1e3a5f",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="av-chart-legend">
            <span className="av-legend-item">
              <span
                style={{
                  display: "inline-block",
                  width: "22px",
                  height: "3px",
                  backgroundColor: "#1e3a5f",
                  borderRadius: "2px",
                }}
              />

              {legendLabel}
            </span>
          </div>
        </>
      )}
    </section>
  );
}