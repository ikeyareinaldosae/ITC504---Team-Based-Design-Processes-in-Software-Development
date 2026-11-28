import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import type {
  RevenueChartData,
} from "../types/analytics.types";

import {
  prepareRevenueBarData,
  formatFullWeekLabel,
} from "../utils/chartData";

import {
  formatCurrency,
  formatCompactCurrency,
} from "../utils/revenueCalculations";

import "./RevenueCharts.css";

interface RevenueBarChartProps {
  data: RevenueChartData[];
  weekStart: string;
  loading?: boolean;
  error?: string | null;
}

export default function RevenueBarChart({
  data,
  weekStart,
  loading = false,
  error = null,
}: RevenueBarChartProps) {
  const chartData = prepareRevenueBarData(data);

  const highestRevenue =
    chartData[0]?.revenue ?? 0;

  const chartHeight = Math.max(
    320,
    chartData.length * 44 + 50
  );

  return (
    <section
      className="av-chart-card"
      aria-label="Weekly movie revenue chart"
    >
      <header className="av-chart-header">
        <h3 className="av-chart-title">
          Weekly Movie Revenue
        </h3>

        <p className="av-chart-subtitle">
          {weekStart
            ? `Revenue by movie · ${formatFullWeekLabel(weekStart)}`
            : "Revenue comparison by movie"}
        </p>
      </header>

      {loading ? (
        <div className="av-chart-message" role="status">
          Loading revenue chart...
        </div>
      ) : error ? (
        <div
          className="av-chart-message av-chart-error"
          role="alert"
        >
          {error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="av-chart-message">
          No movie revenue records for this week.
        </div>
      ) : (
        <>
          <div className="av-chart-container">
            <ResponsiveContainer
              width="100%"
              height={chartHeight}
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 24,
                  bottom: 10,
                  left: 10,
                }}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  domain={[0, "auto"]}
                  tickFormatter={formatCompactCurrency}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="title"
                  width={135}
                  tick={{
                    fontSize: 12,
                    fill: "#475569",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />

                <Tooltip
                  cursor={{
                    fill: "#f1f5f9",
                  }}
                  formatter={(value) => [
                    formatCurrency(
                      typeof value === "number"
                        ? value
                        : null
                    ),
                    "Weekly Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    boxShadow:
                      "0 4px 12px rgba(15,23,42,0.08)",
                    fontSize: "13px",
                  }}
                />

                <Bar
                  dataKey="revenue"
                  name="Weekly Revenue"
                  radius={[0, 5, 5, 0]}
                  maxBarSize={30}
                  animationDuration={500}
                >
                  {chartData.map((movie) => (
                    <Cell
                      key={movie.movieId}
                      fill={
                        highestRevenue > 0 &&
                        movie.revenue === highestRevenue
                          ? "#1e3a5f"
                          : "#6389b8"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="av-chart-legend">
            <span className="av-legend-item">
              <span
                className="av-legend-dot"
                style={{ backgroundColor: "#1e3a5f" }}
              />
              Highest revenue
            </span>

            <span className="av-legend-item">
              <span
                className="av-legend-dot"
                style={{ backgroundColor: "#6389b8" }}
              />
              Other movies
            </span>
          </div>
        </>
      )}
    </section>
  );
}