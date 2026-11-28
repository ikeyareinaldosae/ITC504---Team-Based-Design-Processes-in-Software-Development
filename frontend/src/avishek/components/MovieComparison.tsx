import { useMemo, useState } from "react";

import type {
  WeeklyMoviePerformance,
} from "../types/analytics.types";

import {
  formatCurrency,
  formatRevenueDifference,
  formatPercentage,
  formatPercentageChange,
  getChangeDirection,
} from "../utils/revenueCalculations";

import {
  formatFullWeekLabel,
} from "../utils/chartData";

import "./MovieComparison.css";

interface MovieComparisonProps {
  movies: WeeklyMoviePerformance[];
  totalRevenue: number;
  weekStart: string;
  loading?: boolean;
  error?: string | null;
}

type SortField =
  | "title"
  | "revenue"
  | "previousRevenue"
  | "difference"
  | "percentChange"
  | "revenueShare"
  | "screeningStatus";

type SortDirection = "asc" | "desc";

const columns: {
  key: SortField;
  label: string;
}[] = [
  { key: "title", label: "Movie" },
  { key: "revenue", label: "Weekly Revenue" },
  { key: "previousRevenue", label: "Previous Revenue" },
  { key: "difference", label: "Difference" },
  { key: "percentChange", label: "Change" },
  { key: "revenueShare", label: "Revenue Share" },
  { key: "screeningStatus", label: "Status" },
];

export default function MovieComparison({
  movies,
  totalRevenue,
  weekStart,
  loading = false,
  error = null,
}: MovieComparisonProps) {
  const [sortField, setSortField] =
    useState<SortField>("revenue");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [search, setSearch] = useState("");

  // Calculate each movie's contribution to weekly revenue
  const comparisonData = useMemo(() => {
    return movies.map((movie) => ({
      ...movie,

      revenueShare:
        totalRevenue > 0
          ? Math.round(
              (movie.revenue / totalRevenue) * 1000
            ) / 10
          : null,
    }));
  }, [movies, totalRevenue]);

  // Search and sort comparison records
  const displayedMovies = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return comparisonData
      .filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        const first = a[sortField];
        const second = b[sortField];

        // Keep missing values at the bottom
        if (first === null && second === null) {
          return a.movieId - b.movieId;
        }

        if (first === null) return 1;
        if (second === null) return -1;

        let result: number;

        if (
          typeof first === "string" &&
          typeof second === "string"
        ) {
          result = first.localeCompare(second);
        } else {
          result = Number(first) - Number(second);
        }

        if (result === 0) {
          return a.movieId - b.movieId;
        }

        return sortDirection === "asc"
          ? result
          : -result;
      });
  }, [
    comparisonData,
    search,
    sortField,
    sortDirection,
  ]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);

      setSortDirection(
        field === "title" ||
        field === "screeningStatus"
          ? "asc"
          : "desc"
      );
    }
  }

  return (
    <section
      className="av-comparison-card"
      aria-label="Movie performance comparison"
    >
      <header className="av-comparison-header">
        <div>
          <h3 className="av-comparison-title">
            Movie Performance Comparison
          </h3>

          <p className="av-comparison-subtitle">
            {weekStart
              ? `Weekly performance · ${formatFullWeekLabel(weekStart)}`
              : "Compare movie revenue and performance"}
          </p>
        </div>

        <input
          type="search"
          className="av-comparison-search"
          placeholder="Search movies..."
          aria-label="Search movies"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          disabled={loading}
        />
      </header>

      {loading ? (
        <div
          className="av-comparison-message"
          role="status"
        >
          Loading movie performance...
        </div>
      ) : error ? (
        <div
          className="av-comparison-message av-comparison-error"
          role="alert"
        >
          {error}
        </div>
      ) : movies.length === 0 ? (
        <div className="av-comparison-message">
          No movie performance records for this week.
        </div>
      ) : displayedMovies.length === 0 ? (
        <div className="av-comparison-message">
          No movies match your search.
        </div>
      ) : (
        <>
          <div className="av-comparison-table-wrapper">
            <table className="av-comparison-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        sortField === column.key
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className="av-comparison-sort"
                        onClick={() =>
                          handleSort(column.key)
                        }
                      >
                        {column.label}

                        <span
                          className="av-sort-indicator"
                          aria-hidden="true"
                        >
                          {sortField === column.key
                            ? sortDirection === "asc"
                              ? "↑"
                              : "↓"
                            : "↕"}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {displayedMovies.map((movie) => (
                  <tr key={movie.movieId}>
                    <td className="av-comparison-movie">
                      {movie.title}
                    </td>

                    <td className="av-comparison-revenue">
                      {formatCurrency(movie.revenue)}
                    </td>

                    <td>
                      {formatCurrency(
                        movie.previousRevenue
                      )}
                    </td>

                    <td>
                      <span
                        className={`av-comparison-change av-change-${getChangeDirection(
                          movie.difference
                        )}`}
                      >
                        {formatRevenueDifference(
                          movie.difference
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`av-comparison-change av-change-${getChangeDirection(
                          movie.percentChange
                        )}`}
                      >
                        {formatPercentageChange(
                          movie.percentChange
                        )}
                      </span>
                    </td>

                    <td>
                      <div className="av-revenue-share">
                        <span>
                          {formatPercentage(
                            movie.revenueShare
                          )}
                        </span>

                        {movie.revenueShare !== null && (
                          <div
                            className="av-share-track"
                            aria-hidden="true"
                          >
                            <div
                              className="av-share-fill"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    movie.revenueShare
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`av-screening-status av-status-${movie.screeningStatus}`}
                      >
                        {movie.screeningStatus
                          .charAt(0)
                          .toUpperCase() +
                          movie.screeningStatus.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="av-comparison-footer">
            <span>
              Showing {displayedMovies.length} of{" "}
              {movies.length} movies
            </span>

            <span>
              Total weekly revenue:{" "}
              <strong>
                {formatCurrency(totalRevenue)}
              </strong>
            </span>
          </footer>
        </>
      )}
    </section>
  );
}