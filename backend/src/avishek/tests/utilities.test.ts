
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  roundCurrency,
  roundPercentage,
  sumRevenue,
  calculateDifference,
  calculatePercentageChange,
  calculateRevenueShare,
  sumNullableCounts,
} from "../utils/calculations.js";

import {
  isValidDate,
  isMonday,
  validateWeekStart,
  addDays,
  getPreviousWeek,
  getNextWeek,
  getWeekEnd,
  validateWeekRange,
} from "../utils/dateUtils.js";

describe("Revenue calculation utilities", () => {
  it("rounds currency to two decimal places", () => {
    assert.equal(roundCurrency(123.456), 123.46);
  });

  it("rounds percentages to one decimal place", () => {
    assert.equal(roundPercentage(12.345), 12.3);
  });

  it("sums weekly revenue", () => {
    assert.equal(sumRevenue([12000, 8000]), 20000);
  });

  it("handles decimal currency accurately", () => {
    assert.equal(sumRevenue([0.1, 0.2]), 0.3);
  });

  it("handles empty revenue records", () => {
    assert.equal(sumRevenue([]), 0);
  });

  it("calculates positive revenue differences", () => {
    assert.equal(calculateDifference(12000, 10000), 2000);
  });

  it("calculates negative revenue differences", () => {
    assert.equal(calculateDifference(6500, 10000), -3500);
  });

  it("preserves missing previous revenue", () => {
    assert.equal(calculateDifference(5000, null), null);
  });

  it("calculates revenue growth", () => {
    assert.equal(calculatePercentageChange(12000, 10000), 20);
  });

  it("calculates revenue decline", () => {
    assert.equal(calculatePercentageChange(6500, 10000), -35);
  });

  it("handles a complete revenue decline", () => {
    assert.equal(calculatePercentageChange(0, 10000), -100);
  });

  it("handles unchanged revenue", () => {
    assert.equal(calculatePercentageChange(5000, 5000), 0);
  });

  it("prevents division by zero", () => {
    assert.equal(calculatePercentageChange(5000, 0), null);
  });

  it("handles missing previous revenue for growth", () => {
    assert.equal(calculatePercentageChange(5000, null), null);
  });

  it("calculates movie revenue share", () => {
    assert.equal(calculateRevenueShare(5000, 20000), 25);
  });

  it("handles zero total revenue", () => {
    assert.equal(calculateRevenueShare(0, 0), null);
  });

  it("aggregates complete ticket counts", () => {
    assert.equal(sumNullableCounts([100, 200, 300]), 600);
  });

  it("preserves missing ticket counts", () => {
    assert.equal(sumNullableCounts([100, null, 300]), null);
  });

  it("handles empty count records", () => {
    assert.equal(sumNullableCounts([]), null);
  });

  it("preserves valid zero counts", () => {
    assert.equal(sumNullableCounts([0, 0]), 0);
  });
});

describe("Date utilities", () => {
  it("accepts valid calendar dates", () => {
    assert.equal(isValidDate("2026-11-23"), true);
  });

  it("rejects impossible calendar dates", () => {
    assert.equal(isValidDate("2026-02-30"), false);
  });

  it("rejects incorrect date formats", () => {
    assert.equal(isValidDate("23/11/2026"), false);
  });

  it("rejects empty dates", () => {
    assert.equal(isValidDate(""), false);
  });

  it("identifies Monday reporting dates", () => {
    assert.equal(isMonday("2026-11-23"), true);
  });

  it("rejects non-Monday reporting dates", () => {
    assert.equal(isMonday("2026-11-26"), false);
  });

  it("validates Monday week starts", () => {
    assert.doesNotThrow(() => validateWeekStart("2026-11-23"));
  });

  it("rejects invalid week starts", () => {
    assert.throws(() => validateWeekStart("2026-11-26"));
  });

  it("calculates the previous reporting week", () => {
    assert.equal(getPreviousWeek("2026-11-23"), "2026-11-16");
  });

  it("calculates the next reporting week", () => {
    assert.equal(getNextWeek("2026-11-23"), "2026-11-30");
  });

  it("calculates the reporting week end", () => {
    assert.equal(getWeekEnd("2026-11-23"), "2026-11-29");
  });

  it("handles year transitions", () => {
    assert.equal(getPreviousWeek("2027-01-04"), "2026-12-28");
  });

  it("handles leap years", () => {
    assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  });

  it("handles non-leap years", () => {
    assert.equal(addDays("2026-02-28", 1), "2026-03-01");
  });

  it("rejects invalid dates during arithmetic", () => {
    assert.throws(() => addDays("2026-02-30", 1));
  });

  it("rejects fractional day offsets", () => {
    assert.throws(() => addDays("2026-11-23", 1.5));
  });

  it("accepts valid reporting ranges", () => {
    assert.doesNotThrow(() =>
      validateWeekRange("2026-11-02", "2026-11-23"),
    );
  });

  it("accepts single-week reporting ranges", () => {
    assert.doesNotThrow(() =>
      validateWeekRange("2026-11-23", "2026-11-23"),
    );
  });

  it("rejects reversed reporting ranges", () => {
    assert.throws(() =>
      validateWeekRange("2026-11-23", "2026-11-02"),
    );
  });
});
