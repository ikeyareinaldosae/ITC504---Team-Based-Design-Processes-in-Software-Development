
// Revenue calculation utilities.
// Movie Performance Management System.

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundPercentage(value: number): number {
  return Math.round(value * 10) / 10;
}

export function sumRevenue(
  revenues: readonly number[],
): number {
  const totalCents = revenues.reduce(
    (total, revenue) => total + Math.round(revenue * 100),
    0,
  );

  return totalCents / 100;
}

export function calculateDifference(
  current: number,
  previous: number | null,
): number | null {
  if (previous === null) {
    return null;
  }

  return roundCurrency(current - previous);
}

export function calculatePercentageChange(
  current: number,
  previous: number | null,
): number | null {
  if (previous === null || previous === 0) {
    return null;
  }

  return roundPercentage(
    ((current - previous) / previous) * 100,
  );
}

export function calculateRevenueShare(
  movieRevenue: number,
  totalRevenue: number,
): number | null {
  if (totalRevenue === 0) {
    return null;
  }

  return roundPercentage(
    (movieRevenue / totalRevenue) * 100,
  );
}

export function sumNullableCounts(
  values: readonly (number | null)[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  let total = 0;

  for (const value of values) {
    if (value === null) {
      return null;
    }

    total += value;
  }

  return total;
}
