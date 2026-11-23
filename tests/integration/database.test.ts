// Tests for the database: rules, seed data, report views and the 15 queries.
// Run with: npm run test:db (from the backend folder; it migrates and seeds the database first). Every test that changes data
// runs inside a transaction that is rolled back, so the seed data stays the same.
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../../backend/src/rose/prismaClient.js";
import { dbErrorCode, httpStatusForDbError, type Db } from "../../backend/src/rose/dbUtils.js";
import * as movies from "../../backend/src/rose/repositories/movie.repository.js";
import * as perf from "../../backend/src/rose/repositories/performance.repository.js";

// One name for every repository function, so the tests read the same as the query list (Q1 to Q15).
const q = { ...movies, ...perf, dbErrorCode, httpStatusForDbError };

class Rollback extends Error {}

/** Runs fn inside a transaction and always rolls it back. */
async function rolledBack<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
  let out!: T;
  try {
    await prisma.$transaction(async (tx) => {
      out = await fn(tx);
      throw new Rollback();
    });
  } catch (e) {
    if (!(e instanceof Rollback)) throw e;
  }
  return out;
}

/** Runs raw SQL that must be refused. Returns the PostgreSQL error code. */
async function refused(sql: string): Promise<string | undefined> {
  let code: string | undefined;
  await rolledBack(async (tx) => {
    try {
      await tx.$executeRawUnsafe(sql);
    } catch (e) {
      code = q.dbErrorCode(e);
      throw e;
    }
  }).catch(() => undefined);
  assert.ok(code, "the statement should have been refused");
  return code;
}

/** Runs raw SQL that must be accepted. */
async function accepted(sql: string): Promise<void> {
  await rolledBack((tx) => tx.$executeRawUnsafe(sql));
}

after(() => prisma.$disconnect());

describe("database rules", () => {
  it("duplicate movie and week is rejected", async () =>
    assert.equal(await refused(`INSERT INTO performance("movieId","weekStart",revenue) VALUES (1,'2026-09-07',1)`), "23505"));
  it("non-Monday week is rejected", async () =>
    assert.equal(await refused(`INSERT INTO performance("movieId","weekStart",revenue) VALUES (8,'2026-10-13',1)`), "23514"));
  it("impossible date is rejected", async () =>
    assert.ok(["22008", "22007"].includes((await refused(`INSERT INTO performance("movieId","weekStart",revenue) VALUES (8,'2026-13-01',1)`))!)));
  it("negative revenue is rejected", async () =>
    assert.equal(await refused(`INSERT INTO performance("movieId","weekStart",revenue) VALUES (8,'2026-10-12',-5)`), "23514"));
  it("3 decimal places in revenue are rejected", async () =>
    assert.equal(await refused(`INSERT INTO performance("movieId","weekStart",revenue) VALUES (8,'2026-10-12',10.005)`), "23514"));
  it("unknown movie is rejected", async () =>
    assert.equal(await refused(`INSERT INTO performance("movieId","weekStart",revenue) VALUES (99,'2026-10-12',10)`), "23503"));
  it("bad screening status is rejected", async () =>
    assert.equal(await refused(`UPDATE movies SET "screeningStatus"='paused' WHERE "movieId"=1`), "22P02"));
  it("duplicate title in any letter case is rejected", async () =>
    assert.equal(await refused(`INSERT INTO movies(title) VALUES ('coral kingdom')`), "23505"));
  it("impossible release date is rejected", async () =>
    assert.ok(["22008", "22007"].includes((await refused(`INSERT INTO movies(title,"releaseDate") VALUES ('X','2026-02-30')`))!)));
  it("blank title is rejected", async () =>
    assert.equal(await refused(`INSERT INTO movies(title) VALUES ('   ')`), "23514"));
  it("negative tickets are rejected", async () =>
    assert.equal(await refused(`INSERT INTO performance("movieId","weekStart",revenue,"ticketsSold") VALUES (8,'2026-10-19',10,-1)`), "23514"));
  it("negative screenings are rejected", async () =>
    assert.equal(await refused(`INSERT INTO performance("movieId","weekStart",revenue,screenings) VALUES (8,'2026-10-19',10,-1)`), "23514"));
  it("valid 2-decimal Monday insert is accepted", async () =>
    accepted(`INSERT INTO performance("movieId","weekStart",revenue) VALUES (8,'2026-10-19',1234.56)`));
  it("tickets and screenings are optional (NULL allowed)", async () =>
    accepted(`INSERT INTO performance("movieId","weekStart",revenue) VALUES (8,'2026-10-19',10)`));
  it("duplicate username in any letter case is rejected", async () =>
    assert.equal(
      await refused(`INSERT INTO users(username,"passwordHash") VALUES ('Sam','x'),('sam','y')`),
      "23505",
    ));
  it("settings hold the placeholder review thresholds", async () => {
    const rows = await prisma.setting.findMany({ orderBy: { name: "asc" } });
    assert.deepEqual(rows.map((r) => [r.name, Number(r.value)]), [["dropPercent", 30], ["minRevenue", 5000]]);
  });
});

describe("seed data and calculated week label", () => {
  it("8 movies are seeded", async () => assert.equal(await prisma.movie.count(), 8));
  it("39 weekly records are seeded", async () => assert.equal(await prisma.performance.count(), 39));
  it("every record has tickets and screenings", async () =>
    assert.equal(await prisma.performance.count({ where: { OR: [{ ticketsSold: null }, { screenings: null }] } }), 0));
  for (const [weekStart, iso] of [["2026-09-28", "2026-W40"], ["2026-10-12", "2026-W42"], ["2026-10-05", "2026-W41"], ["2026-09-07", "2026-W37"]]) {
    it(`isoWeek ${weekStart} = ${iso}`, async () => {
      const row = await prisma.performance.findFirst({ where: { weekStart: new Date(weekStart) } });
      assert.equal(row?.isoWeek, iso);
    });
  }
  it("isoWeek is also right across a year boundary (2026-12-28 is 2026-W53)", async () => {
    await rolledBack(async (tx) => {
      const r = await q.recordRevenue({ movieId: 8, weekStart: "2026-12-28", revenue: 100 }, tx);
      assert.equal(r.isoWeek, "2026-W53");
      const s = await q.recordRevenue({ movieId: 8, weekStart: "2027-01-04", revenue: 100 }, tx);
      assert.equal(s.isoWeek, "2027-W01");
    });
  });
});

describe("report views", () => {
  it("weekly report lists 7 movies for 2026-10-12", async () => assert.equal((await q.weeklyReport({ weekStart: "2026-10-12" })).length, 7));
  it("difference and percent change are calculated", async () => {
    const row = (await q.weeklyReport({ weekStart: "2026-10-12" })).find((r) => r.title === "Midnight Harbour")!;
    assert.equal(row.previousRevenue, 31200);
    assert.equal(row.difference, -2450);
    assert.equal(row.percentChange, -7.9);
  });
  it("a movie with no previous week has no previous revenue", async () => {
    const row = (await q.weeklyReport({ weekStart: "2026-10-05" })).find((r) => r.title === "Southern Cross")!;
    assert.equal(row.previousRevenue, null);
    assert.equal(row.percentChange, null);
  });
  it("Neon Static is flagged SHARP_DROP and The Last Ferry BELOW_MIN_REVENUE (view)", async () => {
    const rows = await prisma.$queryRaw<{ title: string; reason: string }[]>`SELECT title, reason FROM v_review_flags WHERE "weekStart" = '2026-10-12'::date`;
    const flags = Object.fromEntries(rows.map((r) => [r.title, r.reason]));
    assert.equal(flags["Neon Static"], "SHARP_DROP");
    assert.equal(flags["The Last Ferry"], "BELOW_MIN_REVENUE");
  });
  it("an ended movie is never flagged", async () => {
    const rows = await prisma.$queryRaw<{ title: string }[]>`SELECT title FROM v_review_flags`;
    assert.ok(!rows.some((r) => r.title === "Grandma's Gold"));
  });
  it("deleting a movie removes its weekly records (cascade)", async () => {
    await rolledBack(async (tx) => {
      await tx.$executeRaw`DELETE FROM movies WHERE "movieId" = 8`;
      assert.equal(await tx.performance.count({ where: { movieId: 8 } }), 0);
    });
  });
});

describe("queries Q1 to Q15", () => {
  it("Q1 lists movies in name order", async () => {
    const movies = await q.listMovies();
    assert.equal(movies.length, 8);
    assert.equal(movies[0].title, "Coral Kingdom");
    assert.equal(movies[0].releaseDate, "2026-08-27");
  });
  it("Q2 gets one movie, and null for an unknown id", async () => {
    assert.equal((await q.getMovie(2))?.title, "Coral Kingdom");
    assert.equal(await q.getMovie(999), null);
  });
  it("Q3 adds a movie, and a repeated title gives 409", async () => {
    await rolledBack(async (tx) => {
      const m = await q.addMovie({ title: "Test Film", genre: "Drama", releaseDate: "2026-10-01" }, tx);
      assert.equal(m.title, "Test Film");
      assert.equal(m.screeningStatus, "active");
      await assert.rejects(q.addMovie({ title: "TEST FILM" }, tx), (e) => q.httpStatusForDbError(e) === 409);
    });
  });
  it("Q3b finds a movie by name in any letter case, and null when missing", async () => {
    assert.equal(await q.findMovieIdByTitle("coral kingdom"), 2);
    assert.equal(await q.findMovieIdByTitle("No Such Film"), null);
  });
  it("Q4 records revenue with optional tickets and screenings", async () => {
    await rolledBack(async (tx) => {
      const r = await q.recordRevenue({ movieId: 8, weekStart: "2026-10-19", revenue: 1234.56 }, tx);
      assert.equal(r.revenue, 1234.56);
      assert.equal(r.ticketsSold, null);
      assert.equal(r.isoWeek, "2026-W43");
    });
  });
  it("Q4 error mapping: repeat week 409, non-Monday 400, 3 decimals 400, unknown movie 404", async () => {
    const status = async (input: Parameters<typeof q.recordRevenue>[0]) =>
      rolledBack(async (tx) => {
        try {
          await q.recordRevenue(input, tx);
          return 200;
        } catch (e) {
          return q.httpStatusForDbError(e);
        }
      });
    assert.equal(await status({ movieId: 1, weekStart: "2026-09-07", revenue: 1 }), 409);
    assert.equal(await status({ movieId: 8, weekStart: "2026-10-13", revenue: 1 }), 400);
    assert.equal(await status({ movieId: 8, weekStart: "2026-10-19", revenue: 10.005 }), 400);
    assert.equal(await status({ movieId: 99, weekStart: "2026-10-19", revenue: 10 }), 404);
  });
  it("Q5 corrects a record, and null for an unknown id", async () => {
    await rolledBack(async (tx) => {
      const id = (await prisma.performance.findFirstOrThrow({ where: { movieId: 1 } })).recordId;
      const r = await q.correctRecord(id, { revenue: 999.5, ticketsSold: 60, screenings: 3 }, tx);
      assert.equal(r?.revenue, 999.5);
      assert.equal(await q.correctRecord(99999, { revenue: 1 }, tx), null);
    });
  });
  it("Q6 deletes a record, and false for an unknown id", async () => {
    await rolledBack(async (tx) => {
      const id = (await prisma.performance.findFirstOrThrow({ where: { movieId: 1 } })).recordId;
      assert.equal(await q.deleteRecord(id, tx), true);
      assert.equal(await q.deleteRecord(id, tx), false);
    });
  });
  it("Q7 lists the 6 weeks that have data, newest first", async () => {
    const weeks = await q.listWeeks();
    assert.equal(weeks.length, 6);
    assert.deepEqual(weeks[0], { weekStart: "2026-10-12", isoWeek: "2026-W42" });
  });
  it("Q8 weekly report works by weekStart and by isoWeek, and an empty week gives an empty list", async () => {
    const byDate = await q.weeklyReport({ weekStart: "2026-10-12" });
    const byIso = await q.weeklyReport({ isoWeek: "2026-W42" });
    assert.deepEqual(byDate, byIso);
    assert.equal(byDate[0].title, "Coral Kingdom");
    assert.deepEqual(await q.weeklyReport({ weekStart: "2030-01-07" }), []);
  });
  it("Q9 weekly summary gives total and best movie", async () => {
    const s = await q.weeklySummary("2026-10-12");
    assert.equal(s.totalRevenue, 159550);
    assert.equal(s.bestMovie, "Coral Kingdom");
  });
  it("Q10 revenue trend covers the chosen weeks", async () => {
    const rows = await q.revenueTrend("2026-09-07", "2026-10-12");
    assert.equal(rows.length, 39);
    assert.deepEqual(rows[0], { movieId: 2, title: "Coral Kingdom", weekStart: "2026-09-07", revenue: 52300.5 });
  });
  it("Q11 review flags use the thresholds given", async () => {
    const flags = await q.reviewFlags("2026-10-12", 5000, 30);
    assert.deepEqual(flags.map((f) => [f.title, f.reason]).sort(), [["Neon Static", "SHARP_DROP"], ["The Last Ferry", "BELOW_MIN_REVENUE"]]);
    assert.equal((await q.reviewFlags("2026-10-12", 0, 90)).length, 0);
  });
  it("Q12 extends a screening, and refuses an ended movie", async () => {
    await rolledBack(async (tx) => {
      const m = await q.extendScreening(1, 2, tx);
      assert.equal(m?.screeningStatus, "extended");
      assert.equal(m?.extendedWeeks, 2);
      assert.equal((await q.extendScreening(1, 1, tx))?.extendedWeeks, 3);
      assert.equal(await q.extendScreening(7, 1, tx), null);
    });
  });
  it("Q13 ends a screening", async () => {
    await rolledBack(async (tx) => {
      assert.equal((await q.endScreening(1, tx))?.screeningStatus, "ended");
      assert.equal(await q.endScreening(999, tx), null);
    });
  });
  it("Q14 updates a movie, and a title that already exists gives 409", async () => {
    await rolledBack(async (tx) => {
      const m = await q.updateMovie(8, { title: "Renamed Test Film", genre: "Drama", releaseDate: "2026-10-02" }, tx);
      assert.equal(m?.title, "Renamed Test Film");
      assert.equal(await q.updateMovie(999, { title: "Nobody" }, tx), null);
      await assert.rejects(q.updateMovie(8, { title: "coral kingdom" }, tx), (e) => q.httpStatusForDbError(e) === 409);
    });
  });
  it("Q15 deletes a movie and its records, and false for an unknown id", async () => {
    await rolledBack(async (tx) => {
      assert.equal(await q.deleteMovie(8, tx), true);
      assert.equal(await q.getMovie(8, tx), null);
      assert.equal(await tx.performance.count({ where: { movieId: 8 } }), 0);
      assert.equal(await q.deleteMovie(8, tx), false);
    });
  });
  it("the seed leaves the data unchanged after all the tests above", async () => {
    assert.equal(await prisma.movie.count(), 8);
    assert.equal(await prisma.performance.count(), 39);
  });
});
