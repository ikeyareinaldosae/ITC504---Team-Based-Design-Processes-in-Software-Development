// API integration tests: reports, review flags and screening decisions. Owner: Chandani Gupta.
// Run from the backend folder with: npm run test:api (the database must be migrated and seeded).
// Expected values come from the seed data (database/prisma/seed.ts). Screening changes are undone after each test.
import { after, afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { api, BASE, disconnect, sql } from "../../backend/src/chandani/testClient.js";

after(disconnect);

describe("GET /reports/weeks", () => {
  it("lists the 6 weeks that hold data, newest first", async () => {
    const res = await api().get(`${BASE}/reports/weeks`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, ["2026-10-12", "2026-10-05", "2026-09-28", "2026-09-21", "2026-09-14", "2026-09-07"]);
  });
});

describe("GET /reports/weekly", () => {
  it("returns the week's total, best movie and one row per movie", async () => {
    const res = await api().get(`${BASE}/reports/weekly?weekStart=2026-10-12`);
    assert.equal(res.status, 200);
    assert.equal(res.body.weekStart, "2026-10-12");
    assert.equal(res.body.totalRevenue, 159550);
    assert.equal(res.body.bestMovie, "Coral Kingdom");
    assert.equal(res.body.movies.length, 7);
    const neon = res.body.movies.find((m: { title: string }) => m.title === "Neon Static");
    assert.equal(neon.revenue, 5100);
    assert.equal(neon.previousRevenue, 12950);
    assert.equal(neon.difference, -7850);
    assert.equal(neon.percentChange, -60.6);
  });

  it("a week with no data returns total 0 and an empty list", async () => {
    const res = await api().get(`${BASE}/reports/weekly?weekStart=2025-01-06`);
    assert.equal(res.status, 200);
    assert.equal(res.body.totalRevenue, 0);
    assert.equal(res.body.bestMovie, null);
    assert.deepEqual(res.body.movies, []);
  });

  it("a movie in its first week has no previous revenue", async () => {
    const res = await api().get(`${BASE}/reports/weekly?weekStart=2026-10-05`);
    const southernCross = res.body.movies.find((m: { title: string }) => m.title === "Southern Cross");
    assert.equal(southernCross.previousRevenue, null);
    assert.equal(southernCross.percentChange, null);
  });

  for (const [name, query] of [
    ["no weekStart", ""],
    ["a Tuesday", "?weekStart=2026-10-13"],
    ["an impossible date", "?weekStart=2026-13-45"],
  ] as const) {
    it(`${name} returns 400`, async () => {
      const res = await api().get(`${BASE}/reports/weekly${query}`);
      assert.equal(res.status, 400);
      assert.equal(res.body.code, "BAD_REQUEST");
    });
  }
});

describe("GET /reports/charts/revenue-trend", () => {
  it("returns chart points for every movie, in date order", async () => {
    const res = await api().get(`${BASE}/reports/charts/revenue-trend`);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 8);
    for (const movie of res.body) {
      const weeks = movie.chartPoints.map((p: { weekStart: string }) => p.weekStart);
      assert.deepEqual(weeks, [...weeks].sort());
    }
  });

  it("movieId limits the result to one movie", async () => {
    const res = await api().get(`${BASE}/reports/charts/revenue-trend?movieId=6`);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].title, "Neon Static");
    assert.deepEqual(res.body[0].chartPoints.at(-1), { weekStart: "2026-10-12", revenue: 5100 });
  });

  it("an unknown movie returns an empty list", async () => {
    const res = await api().get(`${BASE}/reports/charts/revenue-trend?movieId=999`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  it("movieId that is not a number returns 400", async () => {
    const res = await api().get(`${BASE}/reports/charts/revenue-trend?movieId=abc`);
    assert.equal(res.status, 400);
  });
});

describe("GET /management/review-flags", () => {
  it("flags Neon Static (SHARP_DROP) and The Last Ferry (BELOW_MIN_REVENUE) with the default thresholds", async () => {
    const res = await api().get(`${BASE}/management/review-flags?weekStart=2026-10-12`);
    assert.equal(res.status, 200);
    const reasons = Object.fromEntries(res.body.map((f: { title: string; reason: string }) => [f.title, f.reason]));
    assert.deepEqual(reasons, { "Neon Static": "SHARP_DROP", "The Last Ferry": "BELOW_MIN_REVENUE" });
  });

  it("never flags an ended movie (Grandma's Gold)", async () => {
    const res = await api().get(`${BASE}/management/review-flags?weekStart=2026-10-12&minRevenue=1000000`);
    assert.equal(res.status, 200);
    assert.ok(!res.body.some((f: { title: string }) => f.title === "Grandma's Gold"));
  });

  it("revenue exactly equal to minRevenue is not flagged (boundary)", async () => {
    // Neon Static earned 5100 on 2026-10-12. With minRevenue 5100 it is not below the minimum.
    const res = await api().get(`${BASE}/management/review-flags?weekStart=2026-10-12&minRevenue=5100&dropPercent=100`);
    assert.ok(!res.body.some((f: { title: string }) => f.title === "Neon Static"));
  });

  it("a drop exactly equal to dropPercent is flagged (boundary)", async () => {
    // Neon Static dropped 60.6% on 2026-10-12.
    const res = await api().get(`${BASE}/management/review-flags?weekStart=2026-10-12&minRevenue=0&dropPercent=60.6`);
    const neon = res.body.find((f: { title: string }) => f.title === "Neon Static");
    assert.equal(neon?.reason, "SHARP_DROP");
  });

  for (const [name, query] of [
    ["no weekStart", ""],
    ["negative minRevenue", "?weekStart=2026-10-12&minRevenue=-1"],
    ["dropPercent above 100", "?weekStart=2026-10-12&dropPercent=101"],
    ["dropPercent of 0", "?weekStart=2026-10-12&dropPercent=0"],
    ["minRevenue that is not a number", "?weekStart=2026-10-12&minRevenue=abc"],
  ] as const) {
    it(`${name} returns 400`, async () => {
      const res = await api().get(`${BASE}/management/review-flags${query}`);
      assert.equal(res.status, 400);
      assert.equal(res.body.code, "BAD_REQUEST");
    });
  }
});

describe("screening decisions", () => {
  // Put the movies these tests change back to their seed values.
  afterEach(async () => {
    await sql(`UPDATE movies SET "screeningStatus" = 'active', "extendedWeeks" = 0 WHERE "movieId" = 1`);
    await sql(`UPDATE movies SET "screeningStatus" = 'extended', "extendedWeeks" = 2 WHERE "movieId" = 4`);
  });

  it("extending with no body adds 1 week", async () => {
    const res = await api().post(`${BASE}/movies/1/screening/extend`);
    assert.equal(res.status, 200);
    assert.equal(res.body.screeningStatus, "extended");
    assert.equal(res.body.extendedWeeks, 1);
    assert.equal(res.body.title, "Midnight Harbour");
    assert.equal(typeof res.body.message, "string");
  });

  it("extending twice adds up the weeks", async () => {
    await api().post(`${BASE}/movies/4/screening/extend`).send({ weeks: 2 });
    const res = await api().post(`${BASE}/movies/4/screening/extend`).send({ weeks: 3 });
    assert.equal(res.status, 200);
    assert.equal(res.body.extendedWeeks, 7); // seed 2 + 2 + 3
  });

  it("extending an ended screening returns 409", async () => {
    const res = await api().post(`${BASE}/movies/7/screening/extend`);
    assert.equal(res.status, 409);
    assert.equal(res.body.code, "CONFLICT");
  });

  it("extending an unknown movie returns 404", async () => {
    const res = await api().post(`${BASE}/movies/999/screening/extend`);
    assert.equal(res.status, 404);
  });

  it("weeks of 0 returns 400", async () => {
    const res = await api().post(`${BASE}/movies/1/screening/extend`).send({ weeks: 0 });
    assert.equal(res.status, 400);
  });

  it("ending a screening sets the status to ended", async () => {
    const res = await api().post(`${BASE}/movies/1/screening/end`);
    assert.equal(res.status, 200);
    assert.equal(res.body.screeningStatus, "ended");
  });

  it("ending an unknown movie returns 404", async () => {
    const res = await api().post(`${BASE}/movies/999/screening/end`);
    assert.equal(res.status, 404);
  });
});
