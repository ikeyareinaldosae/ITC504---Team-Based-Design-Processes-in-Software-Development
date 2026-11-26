const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-AU");

const percentageFormatter = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Format revenue in Australian dollars
export function formatCurrency(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  return currencyFormatter.format(value);
}

// Format positive and negative revenue differences
export function formatRevenueDifference(
  value: number | null
): string {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  const formatted = formatCurrency(value);

  return value > 0 ? `+${formatted}` : formatted;
}

// Format percentage values
export function formatPercentage(
  value: number | null
): string {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  return `${percentageFormatter.format(value)}%`;
}

// Format percentage changes with direction
export function formatPercentageChange(
  value: number | null
): string {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  const formatted = formatPercentage(value);

  return value > 0 ? `+${formatted}` : formatted;
}

// Format tickets, screenings and movie counts
export function formatNumber(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  return numberFormatter.format(value);
}

// Determine the direction of a performance change
export type ChangeDirection =
  | "positive"
  | "negative"
  | "neutral"
  | "unavailable";

export function getChangeDirection(
  value: number | null
): ChangeDirection {
  if (value === null || !Number.isFinite(value)) {
    return "unavailable";
  }

  if (value > 0) return "positive";
  if (value < 0) return "negative";

  return "neutral";
}

// Format revenue values for chart axes
export function formatCompactCurrency(value: number): string {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}