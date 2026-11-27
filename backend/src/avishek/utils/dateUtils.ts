
// Date utilities for weekly cinema performance reporting.
// All reporting dates use UTC and YYYY-MM-DD format.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function isMonday(value: string): boolean {
  if (!isValidDate(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return date.getUTCDay() === 1;
}

export function validateWeekStart(
  weekStart: string,
): void {
  if (!isValidDate(weekStart)) {
    throw new Error(
      "Invalid date. Expected YYYY-MM-DD format.",
    );
  }

  if (!isMonday(weekStart)) {
    throw new Error(
      "Reporting week must start on a Monday.",
    );
  }
}

export function addDays(
  value: string,
  days: number,
): string {
  if (!isValidDate(value)) {
    throw new Error("Invalid date.");
  }

  if (!Number.isSafeInteger(days)) {
    throw new Error("Days must be an integer.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() + days);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Date is outside the supported range.");
  }

  const result = date.toISOString().slice(0, 10);

  if (!isValidDate(result)) {
    throw new Error("Date is outside the supported range.");
  }

  return result;
}

export function getPreviousWeek(
  weekStart: string,
): string {
  validateWeekStart(weekStart);

  return addDays(weekStart, -7);
}

export function getNextWeek(
  weekStart: string,
): string {
  validateWeekStart(weekStart);

  return addDays(weekStart, 7);
}

export function getWeekEnd(
  weekStart: string,
): string {
  validateWeekStart(weekStart);

  return addDays(weekStart, 6);
}

export function validateWeekRange(
  fromWeek: string,
  toWeek: string,
): void {
  validateWeekStart(fromWeek);
  validateWeekStart(toWeek);

  if (fromWeek > toWeek) {
    throw new Error(
      "Start week cannot be after end week.",
    );
  }
}
